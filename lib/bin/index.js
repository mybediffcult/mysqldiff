#!/usr/bin/env node

const program = require('commander');
const app = require('../index');
const pkg = require('../../package.json');

program.version(pkg.version, '-v,--version');

program
    .command('run')
    .description('run  dev -T mysql://user:pass@host[:port]/dbname1 -S mysql://user:pass@host[:port]/dbname2 -W ture -M true')
    .option('-c --configPath <configPath>', 'give a config path')
    .option('-d --distPath <distPath>', 'result file path')
    .option('-s,--source <source>', 'source config file name or ')
    .option('-t,--target <target>', 'target config file name')
    .option('-p ,--processed [processed]', 'Decide if the returned result is processed,for example :true:string,false:object', 'true')
    .option('-w --warn  [warn]', 'show warn info', 'true')
    .option('-m --merge  [merge]', 'deal to return merge result or independent result', 'true')
    .option('-f --file  <file>', 'use your func to deal result data')
    .option('-i --ignore')
    .action((cmd)=>{
        app(cmd);
    });
program.parse(process.argv);
