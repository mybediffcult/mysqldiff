var dialects = require('./');
var pync = require('pync');
var MysqlClient = require('./mysql-client');
const minimatch = require('minimatch');

class MySQLDialect {
    _quote (str) {
        return '`' + str + '`';
    }

    describeDatabase (options, ignoreList) {
        var client = new MysqlClient(options);
        return   this.describeWithConn(client,ignoreList)
    }
    describeWithConn(client,ignoreList){
        var schema = { dialect: 'mysql', sequences: [] };
        return client.query('SHOW TABLES')
            .then((result) => {
                var field = result.fields[0].name;
                var rows = result.rows;
                var tables = [];
                rows.forEach((row) => {
                    if (!ignoreList) {
                        tables.push(row[field]);
                    } else {
                        let isMatch = false;
                        for (let ignore of ignoreList) {
                            isMatch = minimatch(row[field], ignore);
                            if (isMatch) {
                                break;
                            }
                        }
                        if (!isMatch) {
                            tables.push(row[field]);
                        }
                    }
                });
                return pync.map(tables, (table) => {
                    var t = {
                        name: table,
                        constraints: [],
                        indexes: [],
                        tableInfo: '',
                    };
                    return client.find(`SHOW CREATE TABLE ${this._quote(table)}`)
                        .then((info)=>{
                            t.tableInfo = info[0]['Create Table'].replace(/(AUTO_INCREMENT=[0-9]+ )/g, '');
                        })
                        .then(()=>
                            client.find(`SHOW FULL COLUMNS FROM ${this._quote(table)}`)
                        )
                        .then((columns) => {
                            t.columns = columns.map((column) => ({
                                name: column.Field,
                                nullable: column.Null === 'YES',
                                default_value: column.Default,
                                index_type: column.Type,
                                extra: column.Extra,
                                comment: column.Comment,
                            }));
                            return t;
                        });
                });
            })
            .then((tables) => {
                schema.tables = tables;
                return client.find('SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=?', [client.database]);
            })
            .then((constraints) => {
                constraints.forEach((constraint) => {
                    var name = constraint['CONSTRAINT_NAME'];
                    var table = schema.tables.find((table) => table.name === constraint['TABLE_NAME']);
                    if (table) {
                        var info = table.constraints.find((constr) => constr.name === name);
                        var foreign = !!constraint['REFERENCED_TABLE_NAME'];
                        if (!info) {
                            info = {
                                name,
                                index_type: foreign ? 'foreign' : (name === 'PRIMARY' ? 'primary' : 'unique'),
                                columns: [],
                            };
                            if (foreign) { info.referenced_columns = []; }
                            table.constraints.push(info);
                        }
                        if (foreign) {
                            info.referenced_table = constraint['REFERENCED_TABLE_NAME'];
                            info.referenced_columns.push(constraint['REFERENCED_COLUMN_NAME']);
                        }
                        info.columns.push(constraint['COLUMN_NAME']);
                    }
                });
                return pync.series(schema.tables, (table) => (
                    client.find(`SHOW INDEXES IN ${this._quote(table.name)}`)
                        .then((indexes) => {
                            indexes
                                .filter((index) => !table.constraints.find((constraint) => constraint.name === index.Key_name))
                                .forEach((index) => {
                                    var info = table.indexes.find((indx) => index.Key_name === indx.name);
                                    if (!info) {
                                        info = {
                                            name: index.Key_name,
                                            index_type: index.Index_type,
                                            columns: [],
                                        };
                                        table.indexes.push(info);
                                    }
                                    const column = index.Sub_part ? `${index.Column_name}(${index.Sub_part})` : index.Column_name;
                                    info.columns.push(column);
                                });
                        })
                ));
            })
            .then(() => schema);
    }

}
dialects.register('mysql', MySQLDialect);
