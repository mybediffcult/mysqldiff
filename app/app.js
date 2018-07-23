const fs = require('fs');
const path = require('path');
const is = require('is-type-of');
const {Consul} = require('byted-service');
const assert = require('assert');

const DbDiff = exports.DbDiff = require('./dbdiff');


const loadConfig = (name)=>{
    const cwd = process.cwd();
    const configPath = path.resolve(cwd + '/config', name);
    if (!fs.existsSync(configPath)) {
        return {};
    }
    let config = require(configPath);
    if (is.function(config)) {
        config = config({});
    }
    assert(is.object(config), 'config must be object or function to return object.');
    return config;
};
const getConsul = (env)=>{
    const consul = {
        host: '127.0.0.1',
        port: 2280,
    };

    const aggregatedDefaultConfigConsul = loadConfig('config.default.js').consul;

    const aggregatedEnvConfigConsul = loadConfig(`config.${env}.js`).consul;

    const scatteredDefaultConfigConsul = loadConfig('consul.default.js');

    const scatteredEnvConfig = loadConfig(`consul.${env}.js`);


    return {
        ...consul,
        ...aggregatedDefaultConfigConsul,
        ...aggregatedEnvConfigConsul,
        ...scatteredDefaultConfigConsul,
        ...scatteredEnvConfig,
    };
};

const getDataBase = async (conf, env)=>{
    try {
        const reg = /^([^\.]+)\.([^\.]+)\.js$/;
        if (!reg.exec(conf)) {
            return conf;
        }
        const cwd = process.cwd();
        let prod = require(path.resolve(cwd + '/config', conf));
        if (is.function(prod)) {
            prod = prod({root: cwd});
        }
        const client = prod.client;
        const options = client.options;
        if (options.host && options.port) {
            return {
                dialect: 'mysql',
                user: client.username,
                password: client.password,
                host: options.host,
                port: options.port,
                database: client.name,
            };
        }

        const consul = new Consul(getConsul(env));

        const databaseConf = options.replication.write;

        const paths =  await consul.first(databaseConf.psm);
        return {
            dialect: 'mysql',
            user: databaseConf.username,
            password: databaseConf.password,
            host: paths.host,
            port: paths.port,
            database: client.name,
        };
    } catch (e) {
        throw new Error('can not find database,please use command to add database' + e, e.stack);
    }
};

function baseCheckParams(source, target, warn, processed) {
    let result = '';
    const regStr = /^mysql:\/\/\w+:\w+@(\d{1,3}\.){3}\d{1,3}:\d+\/\w+$/;
    const regFile = /^([^\.]+)\.([^\.]+)\.js$/;
    if (!regStr.test(source) && !regFile.test(source)) {
        result += ' parma  source is not a Correct format,please check it \n';
    }
    if (!regStr.test(target) && !regFile.test(target)) {
        result += ' parma target is not a Correct format,please check it \n';
    }
    if (warn !== 'true' && warn !== 'false') {
        result += `parma warn must true or false ,but now  warn is ${warn} \n `;
    }
    if (processed !== 'true' && processed !== 'false') {
        result += `parma processed must true or false ,but now processed is ${processed} \n `;
    }
    return result;
}

module.exports = function (env = 'dev', cmd) {
    const {source, target, warn, processed} = cmd;
    Promise.resolve()
        .then(()=>{
            const paramsError = baseCheckParams(source, target, warn, processed);
            if (paramsError) {
                throw new Error(paramsError);
            }
        })
        .then(async ()=>{
            const sourceConf = await getDataBase(source, env);
            const targetConf = await getDataBase(target, env);
            const dbdiff = new DbDiff();
            //将结果放到内存中 直接返回
            await dbdiff.compare(targetConf, sourceConf);
        })
        .then(()=>{
            const result = require('./common/sqlObject').database;
            const cwd = process.cwd();
            const date =  new Date();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const min = date.getMinutes();
            const fileName = 'dbdiff' + [year, month, day, hour, min].join('_');
            if (processed === 'true') {
                const func = require('./common/func');
                fs.writeFileSync(cwd + `/${fileName}.sql`, func.dealFunc(result, warn));
                return;
            }
            fs.writeFileSync(cwd + `/${fileName}.sql`, JSON.stringify(result));
        })
        .then(()=>{
            console.log('sql diff done.');
            process.exit(0);
        })
        .catch(err=>{
            console.error(err.stack);
            process.exit(1);
        });
};
