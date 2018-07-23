const mysql = require('mysql');
const url = require('url');
const assert = require('assert');

const connections = {};

class MysqlClient {
    constructor(options) {

        if (typeof options === 'string') {
            const info = url.parse(options);
            const auth = info.auth && info.auth.split(':');
            const port = info.port ? info.port : '3306';
            options = {
                dialect: 'mysql',
                user: auth[0],
                password: auth[1],
                database: (info.pathname || '/').substring(1),
                host: info.hostname,
                port: port,
            };
        }

        this.options = Object.assign({
            multipleStatements: true,
        }, options);

        this.database = options.database;
        const key = `${options.user}:${options.password}@${options.host}:${options.port}/${options.database}`;

        let connection = connections[key];
        if (!connection) {
            connection = connections[key] = mysql.createConnection(this.options);
        }
        this.connection = connection;

    }

    query(sql, params = []) {
        return new Promise((resolve, reject)=>{
            this.connection.query(sql, params, (err, rows, fields)=>{
                assert(!err, `mysql  query ${sql} with params ${params} error,${err}`);
                err ? reject(err) : resolve({rows, fields});
            });
        });
    }

    find (sql, params = []) {
        return this.query(sql, params).then((result) => result.rows);
    }

    findOne (sql, params = []) {
        return this.query(sql, params).then((result) => result.rows[0]);
    }


    dropTables () {
        return this.find(`
        SELECT concat('DROP TABLE IF EXISTS ', table_name, ';') AS fullSQL
        FROM information_schema.tables
        WHERE table_schema = ?;
      `, [this.options.database])
            .then((results) => {
                var sql = results.map((result) => result.fullSQL).join(' ');
                return sql && this.query(sql);
            });
    }

}


module.exports = MysqlClient;