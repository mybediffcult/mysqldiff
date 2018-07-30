
// 对每个数据类型定义相应的结构方法
const tableMergeFunc = {
    createIndex: ({name, type, keys})=>`ADD INDEX ${name} USING ${type} (${keys})`,
    dropIndex: (index)=>`DROP INDEX ${index} `,
    dropColumn: (columnName)=>`DROP COLUMN ${columnName}`,
    addColumn: ({columnName, description, comment})=>`ADD COLUMN ${columnName} ${description}  COMMENT ${comment}`,
    modifyColumn: ({columnName, comment, description, extra})=>`MODIFY ${columnName} ${description} ${extra} COMMENT ${comment}`,
    addPrimaryConstraint: ({name, keys})=>`ADD CONSTRAINT ${name} PRIMARY KEY (${keys})`,
    addUniqueConstraint: ({name, keys})=>`ADD CONSTRAINT ${name} UNIQUE (${keys})`,
    addForeignConstraint: ({name, keys, references, foreignKeys})=>`ADD CONSTRAINT ${name} FOREIGN KEY (${keys}) REFERENCES ${references} (${foreignKeys})`,
};
const tableIndependentFunc = {
    createIndex: ({name, type, keys}, tableName)=>`ALTER ${tableName} ADD INDEX ${name} USING ${type} (${keys});\n`,
    dropIndex: (index, tableName)=>`ALTER ${tableName} DROP INDEX ${index};\n`,
    dropColumn: (columnName, tableName)=>`ALTER ${tableName} DROP COLUMN ${columnName};\n`,
    addColumn: ({columnName, description, comment}, tableName)=>`ALTER ${tableName} ADD COLUMN ${columnName} ${description}  COMMENT ${comment};\n`,
    modifyColumn: ({columnName, comment, description, extra}, tableName)=>`ALTER ${tableName} MODIFY ${columnName} ${description} ${extra} COMMENT ${comment};\n`,
    addPrimaryConstraint: ({name, keys}, tableName)=>`ALTER ${tableName} ADD CONSTRAINT ${name} PRIMARY KEY (${keys});\n`,
    addUniqueConstraint: ({name, keys}, tableName)=>`ALTER ${tableName} ADD CONSTRAINT ${name} UNIQUE (${keys});\n`,
    addForeignConstraint: ({name, keys, references, foreignKeys}, tableName)=>`ALTER ${tableName} ADD CONSTRAINT ${name} FOREIGN KEY (${keys}) REFERENCES ${references} (${foreignKeys});\n`,
};
const dropTable = (table)=>`DROP TABLE ${table};\n`;
// const createTable = ({tableName, text})=>`CREATE TABLE ${tableName} (${text});\n`;
const createTable = (table)=>`${table};\n`;


module.exports = {

    tableMergeFunc,
    tableIndependentFunc,
    dropTable,
    createTable,
    mergeFunc: (data, externalFunc, showWarn = 'true')=>{
        let result = '';
        const drop = externalFunc[dropTable] ? externalFunc[dropTable] : dropTable;
        const create = externalFunc[createTable] ? externalFunc[createTable] : createTable;
        const realFunc = {...tableMergeFunc, ...externalFunc};
        for (let [key, value] of Object.entries(data)) {
            switch (key) {
                case 'drop':
                    for (let tableName of value) {
                        result += drop(tableName);
                    }
                    break;
                case 'create':
                    for (let table of value) {
                        result += create(table);
                    }
                    break;
                case 'tables':
                    for (let [tableName, operation] of Object.entries(value)) {
                        result += `ALTER TABLE ${tableName} `;
                        for (let [operationName, operationArray] of Object.entries(operation)) {
                            for (let item of operationArray) {
                                if (showWarn === 'true' || !item.warn) {
                                    result += realFunc[operationName](item, tableName) + ',';
                                }
                            }
                        }
                        result = result.substring(0, result.length - 1) + ';\n';
                    }
                    break;
            }
        }
        return result;
    },
    independentFunc: (data, externalFunc, showWarn = 'true')=>{
        let result = '';
        const drop = externalFunc[dropTable] ? externalFunc[dropTable] : dropTable;
        const create = externalFunc[createTable] ? externalFunc[createTable] : createTable;
        const realFunc = {...tableIndependentFunc, ...externalFunc};
        for (let [key, value] of Object.entries(data)) {
            switch (key) {
                case 'drop':
                    for (let tableName of value) {
                        result += drop(tableName);
                    }
                    break;
                case 'create':
                    for (let table of value) {
                        result += create(table);
                    }
                    break;
                case 'tables':
                    for (let [tableName, operation] of Object.entries(value)) {
                        for (let [operationName, operationArray] of Object.entries(operation)) {
                            for (let item of operationArray) {
                                if (showWarn === 'true' || !item.warn) {
                                    result += realFunc[operationName](item, tableName);
                                }
                            }
                        }
                    }
                    break;
            }
        }
        return result;
    },
};

