// 定义数据类型


// 数据库层的方法 包括添加删除表 和表的操作
const database = {
    drop: [],
    create: [],
    tables: {},
};

// //表中内部的操作
// exports.table={
//     name:'',
//     createIndex:[],
//     dropIndex:[],
//     dropColumn:[],
//     alertColumn:[],

// }

const _initTable = ()=>{
    return {
        createIndex: [],
        dropIndex: [],
        dropColumn: [],
        addColumn: [],
        modifyColumn: [],
        addPrimaryConstraint: [],
        addUniqueConstraint: [],
        addForeignConstraint: [],
    };
};

// 对table 进行插入操作
exports.setTableData = (tableName, key, value)=>{
    if (!database.tables[tableName]) {
        database.tables[tableName] = _initTable();
    }
    value['warn'] = value['warn'] === undefined ? false : true;
    database.tables[tableName][key].push(value);
};

exports.database = database;