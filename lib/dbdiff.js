const _ = require('underscore');
const util = require('util');
const dialects = require('./dialects');
// const dedent = require('dedent')
const sqlObject = require('./common/sqlObject');

const database = sqlObject.initDatabase();
class DbDiff {
    compare (conn1, conn2) {
        return Promise.all([
            dialects.describeDatabase(conn1),
            dialects.describeDatabase(conn2),
        ])
            .then((results) => {
                var db1 = results[0];
                var db2 = results[1];
                this.compareSchemas(db1, db2);
            })
            .then(()=>database);
    }
    compareSchemas (db1, db2) {
        this.sql = [];
        this._dialect = db1.dialect;
        this._quotation = {
            mysql: '`',
            postgres: '"',
        }[this._dialect];

        db1.tables.forEach((table) => {
            var t = this._findTable(db2, table);
            if (!t) {
                database.drop.push(this._fullName(table));
            }
        });

        db2.tables.forEach((table) => {
            var t = this._findTable(db1, table);
            if (!t) {
                database.create.push(table.tableInfo);
            } else {
                this._compareTables(t, table);
                this._compareIndexes(t, table);
                this._compareConstraints(t, table);
            }
        });
    }
    _compareTables (table1, table2) {
        var tableName = this._fullName(table1);

        var columNames1 = this._columnNames(table1);
        var columNames2 = this._columnNames(table2);

        var diff1 = _.difference(columNames1, columNames2);
        var diff2 = _.difference(columNames2, columNames1);

        diff1.forEach((columnName) => {
            sqlObject.setTableData(database, tableName, 'dropColumn', this._quote(columnName));
        });

        diff2.forEach((columnName) => {
            var col = table2.columns.find((column) => column.name === columnName);
            var description = this._columnDescription(col);
            sqlObject.setTableData(database, tableName, 'addColumn', {columnName: this._quote(columnName), description, comment: '\'' + col.comment + '\''});
        });

        var common = _.intersection(columNames1, columNames2);
        common.forEach((columnName) => {
            var col1 = table1.columns.find((column) => column.name === columnName);
            var col2 = table2.columns.find((column) => column.name === columnName);

            if (!_.isEqual(col1, col2)) {
                var warn = (col1.type !== col2.type || (col1.nullable !== col2.nullable && !col2.nullable)) ? true : false;
                var extra = col2.extra ? ' ' + col2.extra : '';
                var description = this._columnDescription(col2);
                sqlObject.setTableData(database, tableName, 'modifyColumn', {columnName: this._quote(columnName), comment: '\'' + col2.comment + '\'', description, extra, warn});
            }
        });
    }
    _compareIndexes (table1, table2) {
        var indexNames1 = this._indexNames(table1);
        var indexNames2 = this._indexNames(table2);

        var diff1 = _.difference(indexNames1, indexNames2);
        var diff2 = _.difference(indexNames2, indexNames1);

        if (diff1.length > 0) {
            diff1.forEach((indexName) => {
                var index = table1.indexes.find((index) => index.name === indexName);
                this._dropIndex(table1, index);
            });
        }
        if (diff2.length > 0) {
            diff2.forEach((indexName) => {
                var index = table2.indexes.find((index) => index.name === indexName);
                this._createIndex(table2, index);
            });
        }

        var inter = _.intersection(indexNames1, indexNames2);
        inter.forEach((indexName) => {
            var index1 = table1.indexes.find((index) => index.name === indexName);
            var index2 = table2.indexes.find((index) => index.name === indexName);

            if (_.difference(index1.columns, index2.columns).length > 0
        || index1.primary !== index2.primary
        || index1.unique !== index2.unique) {
                var index = index2;
                // 删除上一个创建一个新的
                this._dropIndex(table1, index);
                this._createIndex(table1, index);
            }
        });
    }
    _createIndex (table, index) {
        var tableName = this._fullName(table);
        var keys = index.columns.map((key) => `${this._quote(key)}`).join(',');
        sqlObject.setTableData(database, tableName, 'createIndex', {keys, name: this._quote(index.name), type: index.type});
    }

    _dropIndex (table, index) {
        sqlObject.setTableData(database, this._fullName(table), 'dropIndex', this._fullName(index));
    }

    _compareConstraints (table1, table2) {
        var tableName = this._fullName(table2);
        table2.constraints.forEach((constraint2) => {
            var constraint1 = table1 && table1.constraints.find((cons) => constraint2.name === cons.name);
            if (constraint1) {
                if (_.isEqual(constraint1, constraint2)) { return; }
                sqlObject.setTableData(database, tableName, 'dropIndex', this._quote(constraint2.name));
                constraint1 = null;
            }
            if (!constraint1) {
                var keys = constraint2.columns.map((s) => `${this._quote(s)}`).join(', ');
                var warn = table1 ? true : false;
                var fullName = this._quote(constraint2.name);
                if (constraint2.type === 'primary') {
                    if (this._dialect === 'mysql') { fullName = 'foo'; }
                    sqlObject.setTableData(database, tableName, 'addPrimaryConstraint', {name: fullName, keys, warn});
                } else if (constraint2.type === 'unique') {
                    sqlObject.setTableData(database, tableName, 'addUniqueConstraint', {name: fullName, keys, warn});
                } else if (constraint2.type === 'foreign') {
                    var foreignKeys = constraint2.referenced_columns.map((s) => `${this._quote(s)}`).join(', ');
                    sqlObject.setTableData(database, tableName, 'addForeignConstraint', {name: fullName, keys, references: this._quote(constraint2.referenced_table), foreignKeys, warn});
                }
            }
        });
    }
    _quote (name) {
        return this._quotation + name + this._quotation;
    }

    _findTable (db, table) {
        return db.tables.find((t) => t.name === table.name && t.schema === table.schema);
    }

    _columnNames (table) {
        return table.columns.map((col) => col.name).sort();
    }

    _columnDescription (col) {
        var desc = col.type;
        desc += col.nullable ? ' NULL' : ' NOT NULL';

        if (col.default_value !== null) {
            const stringType = col.default_value === 'CURRENT_TIMESTAMP' ? '' : '\'';
            desc += ' DEFAULT ' + stringType + col.default_value + stringType;
        }
        return desc;
    }

    _indexNames (table) {
        return table.indexes.map((index) => index.name).sort();
    }

    _isNumber (n) {
    return +n == n // eslint-disable-line
    }


    _fullName (obj) {
        if (obj.schema) { return `${this._quote(obj.schema)}.${this._quote(obj.name)}`; }
        return this._quote(obj.name);
    }


}

module.exports = DbDiff;
