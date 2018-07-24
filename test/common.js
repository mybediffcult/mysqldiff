const mysqlClient = require('../app/dialects/mysql-client');

const options = 'mysql://user:pass@host[:port]/dbname1';
const devOptions = 'mysql://user:pass@host[:port]/dbname1';

const client = new mysqlClient(options);
const devClient = new mysqlClient(devOptions);
const devFunc = (sql, params)=>{
    devClient.query(sql, params)
        .then(res=>console.log(res))
        .then(_=>process.exit(0))
        .catch(err=>{
            console.error(err.stack);
            process.exit(1);
        });
};
const func = (sql, params)=>{
    client.query(sql, params)
        .then(res=>console.log(res))
        .then(_=>process.exit(0))
        .catch(err=>{
            console.error(err.stack);
            process.exit(1);
        });
};
module.exports = {
    options,
    devOptions,
    client,
    devClient,
    devFunc,
    func,
};