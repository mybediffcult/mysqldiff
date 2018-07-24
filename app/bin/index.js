#!/usr/bin/env node

const program = require('commander');
const app = require('../app');
const pkg = require('../package.json');

program.version(pkg.version, '-v,--version');

program
    .command('run [env]')
    .description('run  dev -T mysql://user:pass@host[:port]/dbname1 -S mysql://user:pass@host[:port]/dbname2 -W ture -M true')
    .option('-C --configPath [configPath]', 'give a config path', './config/')
    .option('-S,--source [source]', 'source config file name or ', 'sequelize.dev.js')
    .option('-T,--target [target]', 'target config file name', 'sequelize.prod.js')
    .option('-P ,--processed [processed]', 'Decide if the returned result is processed,for example :true:string,false:object', 'true')
    .option('-W --warn  [warn]', 'show warn info', 'true')
    .option('-M --merge  [merge]', 'deal to return merge result or independent result', 'true')
    .option('-F --file  <file>', 'use your func to deal result data')
    .action((env, cmd)=>{
        app(env, cmd);
    });
program.parse(process.argv);
