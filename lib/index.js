const fs = require('fs');
const path = require('path');
const is = require('is-type-of');
const {Consul} = require('byted-service');
const assert = require('assert');

const DbDiff = exports.DbDiff = require('./dbdiff');


const loadConfig = (name)=>{
    const cwd = process.cwd();
    const configPath = path.resolve(cwd, name);
    if (!fs.existsSync(configPath)) {
        return {};
    }
    let config = require(configPath);
    if (is.function(config)) {
        config = config({});
    }
    assert(is.object(config), 'config must be object or function to return object.');
    return config.sequelize ? config.sequelize : config;
};
const getConsul = (configPath, env)=>{
    const consul = {
        host: '127.0.0.1',
        port: 2280,
    };

    const aggregatedDefaultConfigConsul = loadConfig(configPath + 'config.default.js').consul;

    const aggregatedEnvConfigConsul = loadConfig(configPath + `config.${env}.js`).consul;

    const scatteredDefaultConfigConsul = loadConfig(configPath + 'consul.default.js');

    const scatteredEnvConfig = loadConfig(configPath + `consul.${env}.js`);


    return {
        ...consul,
        ...aggregatedDefaultConfigConsul,
        ...aggregatedEnvConfigConsul,
        ...scatteredDefaultConfigConsul,
        ...scatteredEnvConfig,
    };
};

const getDataBase = async (conf, configPath, env)=>{
    try {
        const reg = /^([^\.]+)\.([^\.]+)\.js$/;
        if (!reg.exec(conf)) {
            return conf;
        }
        const cwd = process.cwd();
        let prod = require(path.resolve(cwd, configPath + conf));
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

        const consul = new Consul(getConsul(configPath, env));
        const databaseConf = options.replication.write;

        const paths =  await consul.first(databaseConf.psm);
        if (!paths) {
            throw new Error('can not find your sql address,please check your consul Configuration.');
        }
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

function baseCheckParams({source, target, warn, processed, merge, dealFile}) {
    let result = '';
    const regStr = /^mysql:\/\/\w+:\w+@(\d{1,3}\.){3}\d{1,3}:\d+\/\w+$/;
    const regFile = /^([^\.]+)\.([^\.]+)\.js$/;
    const regDealFile = /\.js$/;
    if (!regStr.test(source) && !regFile.test(source)) {
        result += ' parma  source is not a Correct format,it must be like mysql://user:pass@host[:port]/dbname or  a path to a.b.js,please check it \n';
    }
    if (!regStr.test(target) && !regFile.test(target)) {
        result += ' parma target is not a Correct format,it must be like mysql://user:pass@host[:port]/dbname or a path to a.b.js,please check it \n';
    }
    if (warn !== 'true' && warn !== 'false') {
        result += `parma warn must true or false ,but now  warn is ${warn} \n `;
    }
    if (processed !== 'true' && processed !== 'false') {
        result += `parma processed must true or false ,but now processed is ${processed} \n `;
    }
    if (merge !== 'true' && merge !== 'false') {
        result += `parma merge must true or false ,but now merge is ${processed} \n `;
    }
    if (dealFile && !regDealFile.test(dealFile)) {
        result += 'parma  dealfile is not a Correct format,it must be like a path to a.js,please check it \n';
    }
    return result;
}

function _getFileName() {
    const date =  new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    return 'dbdiff' + [year, month, day, hour, min].join('_');
}

module.exports = function (env = 'dev', cmd) {
    const {source, target, warn, processed, merge, file, configPath} = cmd;
    // 根据dealFile 获取文件exports todo
    const realConfigPath = configPath && configPath.lastIndexOf('/') !== configPath.length - 1 ? configPath + '/' : configPath;
    Promise.resolve()
        .then(()=>{
            const paramsError = baseCheckParams(cmd);
            if (paramsError) {
                throw new Error(paramsError);
            }
        })
        .then(async ()=>{
            const sourceConf = await getDataBase(source, realConfigPath, env);
            const targetConf = await getDataBase(target, realConfigPath, env);
            const dbdiff = new DbDiff();
            // 将结果放到内存中 直接返回
            return await dbdiff.compare(targetConf, sourceConf);
        })
        .then((result)=>{
            const cwd = process.cwd();
            const fileName = _getFileName();
            if (processed === 'true') {
                const func = require('./common/func');
                const dealFunc = merge === 'true' ? func.mergeFunc : func.independentFunc;
                const externalFunc = file ? require(path.resolve(cwd, file)) : {};
                fs.writeFileSync(cwd + `/${fileName}.sql`, dealFunc(result, externalFunc, warn));
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
