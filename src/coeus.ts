#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import AttackConfiguration from "./AttackConfiguration";

const methodsExpression = '(?<method>(GET|POST|PUT|HEAD|DELETE)(,(GET|POST|PUT|HEAD|DELETE))*)';
const pathsExpression = '(?<path>[-\\/.\\w]+(,[-\\/.\\w]+)*)';
const paramsExpression = '(?<params>\\w+=[\\w\\s|&\\-;]+(,\\w+=[\\w\\s|&\\-;]+)*)';
const checkExpression = '(?<check>.*)';
const configurationExpression = `^(${methodsExpression}:)?${pathsExpression}:${paramsExpression}(:${checkExpression})?$`;

yargs(hideBin(process.argv))
  .command('scan-fast <host> [port]', 'Scan host with provided attack configurations',
    (yargs: any) => yargs.positional('host', {
      describe: 'host to attack',
      type: 'string',

    }).positional('port', {
      describe: 'optional host port',
      type: 'number',
      default: 8080
    }),
    (argv: any) => {
      if(argv['quick-config']) {
        let config = argv.q.match(new RegExp(configurationExpression)).groups;
        if(config) {
        new AttackConfiguration(
          config.method || argv.method,
          argv.host,
          argv.port,
          config.path,
          config.params,
          config.check ? new RegExp(config.check, 'gm') : null).fireAttack();
        }
        else {
          console.error(`Couldn't process quick configuration: ${argv['quick-config']}`)
        }
      } else if(argv['load-config']) {
        fs.readFile(argv['load-config'], 'utf8', (err, data) => {
          if(err) {
            console.error(`Couldn't read configuration from: ${argv['load-config']}: ${err.message}`)
            process.exit(1);
          }

          data.split('\n').forEach(row => {
            if(row) {
              let config = (row.match(new RegExp(configurationExpression)) || { groups: null }).groups;
              if(config) {
                new AttackConfiguration(
                  config.method || argv.method,
                  argv.host,
                  argv.port,
                  config.path,
                  config.params.replace(/&&/, '%26%26'),
                  config.check ? new RegExp(config.check, 'gm') : null).fireAttack();
              }
              else {
                console.error(`Couldn't process configuration: ${row}`)
              }
            }
          })
        })
      } else if(argv.host && argv.port && argv.path && argv['attack-payload']) {

        new AttackConfiguration(argv.method,
          argv.host,
          argv.port,
          argv.path,
          argv['attack-payload'].replace(/&&/, '%26%26'),
          argv.check)
          .fireAttack();
      } else {
        console.log('yeah... what should I do?');
        yargs.showHelp();
      }
    })
  .option('methods', {
    alias: 'm',
    type: 'string',
    describe: 'HTTP method (GET|POST|PUT|HEAD|DELETE)[,GET|POST|PUT|HEAD|DELETE]*',
    coerce: arg => arg.match(new RegExp(methodsExpression, 'gm')) ? arg.toUpperCase() : undefined,
    default: 'GET'
  }).option('paths', {
  alias: 'p',
  type: 'string',
  describe: 'paths to attack',
  coerce: arg => arg && arg.match(new RegExp(pathsExpression), 'gm') ? arg.replace(/&&/, '%26%26') : undefined
}).option('attack-payloads', {
  alias: 'a',
  type: 'string',
  requiresArg: true,
  coerce: arg => arg && arg.match(new RegExp(paramsExpression, 'gm')) ? arg.replace(/&&/, '%26%26') : undefined
  ,
  describe: 'attack payloads expressed as param=val&param=val(,paramx=valx&param...)*',
}).option('check', {
  alias: 'c',
  type: 'string',
  describe: 'attack return check expressed as regex',
}).option('quick-config', {
  alias: 'q',
  type: 'string',
  describe: 'quick attack configuration [METHOD:]path:params[:check] (other option will be ignored)',
  coerce: arg => arg && arg.match(new RegExp(configurationExpression, 'gm')) ? arg : '',
}).option('load-config', {
  alias: ['l', 'could-you-please-load-this-file-thanks'],
  type: 'string',
  describe: 'load attack configuration from specified file (other option will be ignored)'
}).argv;
