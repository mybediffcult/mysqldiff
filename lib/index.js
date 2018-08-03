const fs = require('fs');
const path = require('path');
const is = require('is-type-of');
const assert = require('assert');

const DbDiff = exports.DbDiff = require('./dbdiff');


const getDataBase = async (conf, configPath)=>{
    try {
        const reg = /\.js$/;
        if (!reg.exec(conf)) {
            return conf;
        }
        const cwd = process.cwd();
        let prod = require(path.resolve(cwd, configPath + conf));
        assert(is.Object(prod), 'the sql  file must be object');
        const {host, port, username, password, name} = prod;
        assert(host, 'sql object must contain host ');
        assert(port, 'sql object must contain port ');
        assert(username, 'sql object must contain username ');
        assert(password, 'sql object must contain password ');
        assert(name, 'sql object must contain name ');
        return {
            dialect: 'mysql',
            user: username,
            password: password,
            host: host,
            port: port,
            database: name,
        };
    } catch (e) {
        throw new Error('can not find database,please use command to add database' + e, e.stack);
    }
};

function baseCheckParams({source, target, warn, processed, merge, dealFile}) {
    let result = '';
    const regStr = /^mysql:\/\/\w+:\w+@(\d{1,3}\.){3}\d{1,3}:\d+\/\w+$/;
    const regFile = /\.js$/;
    const regDealFile = /\.js$/;
    if (!regStr.test(source) && !regFile.test(source)) {
        result += ' parma  source is not a Correct format,it must be like mysql://user:pass@host[:port]/dbname or  a path to a.js,please check it \n';
    }
    if (!regStr.test(target) && !regFile.test(target)) {
        result += ' parma target is not a Correct format,it must be like mysql://user:pass@host[:port]/dbname or a path to a.js,please check it \n';
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

module.exports = function (cmd) {
    const {source, target, warn, processed, merge, file, configPath = './', distPath = './', ignore} = cmd;
    const realConfigPath = configPath && configPath.lastIndexOf('/') !== configPath.length - 1 ? configPath + '/' : configPath;
    const realDistPath = distPath && distPath.lastIndexOf('/') !== distPath.length - 1 ? distPath + '/' : distPath;
    Promise.resolve()
        .then(()=>{
            const paramsError = baseCheckParams(cmd);
            if (paramsError) {
                throw new Error(paramsError);
            }
        })
        .then(async ()=>{
            const sourceConf = await getDataBase(source, realConfigPath);
            const targetConf = await getDataBase(target, realConfigPath);
            const dbdiff = new DbDiff();
            var ignoreReg = '';
            if (ignore) {
                const ignoreBuffer = fs.readFileSync('./.dbignore', 'utf8');
                const ignoreStr = ignoreBuffer.replace(/#.*\r?\n/g, '').replace(/(\r?\n)+/g, '|').replace(/\|$/, '').replace(/^\|/, '');
                ignoreReg = `+(${ignoreStr})`;
            }
            return await dbdiff.compare(targetConf, sourceConf, ignoreReg);
        })
        .then((result)=>{
            const cwd = process.cwd();
            const fileName = _getFileName();
            const filePath = path.resolve(cwd, realDistPath + `${fileName}.sql`);
            if (processed === 'true') {
                const func = require('./common/func');
                const dealFunc = merge === 'true' ? func.mergeFunc : func.independentFunc;
                const externalFunc = file ? require(path.resolve(cwd, file)) : {};
                fs.writeFileSync(filePath, dealFunc(result, externalFunc, warn));
            } else {
                fs.writeFileSync(filePath, JSON.stringify(result));
            }
            console.log(`\nthe result file is ${fileName},and the path is ${filePath}\n`);
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
