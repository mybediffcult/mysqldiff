#!/usr/bin/env node

const program = require('commander');
const app = require('../app');
const pkg = require('../package.json');

program.version(pkg.version, '-v,--version');

program
    .command('run [env]')
    .description('run  dev -T sql://user:pass@host[:port]/dbname1 -S sql://user:pass@host[:port]/dbname2 -W ture -M true')
    .option('-S,--source [source]', 'source config file name or ', 'sequelize.dev.js')
    .option('-T,--target [target]', 'target config file name', 'sequelize.prod.js')
    .option('-P ,--processed [processed]', 'Decide if the returned result is processed,for example :true:string,false:object', 'true')
    // .option('--db1','target database describtion')
    // .option('--db2','source database describtion')
    .option('-W --warn  [warn]', 'show warn info', 'true')
    .action((env, cmd)=>{
        app(env, cmd);
    });
program.parse(process.argv);
