#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import Attack, {AttackConfiguration} from "./Attack";

const coeus: AttackConfiguration = Attack.configuration;
const implicitConfigurationPath = `${process.cwd()}/coeus.config.js`;

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
      if(argv.setup) {
        if (fs.existsSync(argv.setup)) {
          Object.assign(Attack.configuration, require(argv.setup));
        } else {
          if(argv.setup !== implicitConfigurationPath)
            console.error(`using default tool configuration: ${argv.setup} not found.`);
        }
      }

      // QUICK INLINE CONFIG OPTION
      if(argv['quick-config']) {
        let config = argv.q.match(coeus.configurationExpression()).groups;
        if(config) {
        new Attack(
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
      }
      // QUICK CONFIG FROM FILE
      else if(argv['load-config']) {
        fs.readFile(argv['load-config'], 'utf8', (err, data) => {
          if(err) {
            console.error(`Couldn't read configuration from: ${argv['load-config']}: ${err.message}`)
            process.exit(1);
          }

          data.split('\n').forEach(row => {
            if(row) {
              let config = (row.match(coeus.configurationExpression()) || { groups: null }).groups;
              if(config) {
                new Attack(
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
      }
      // FULL OPTION CONFIGURATION
      else if(argv.host && argv.port && argv.p && argv.a) {
        new Attack(argv.m,
          argv.host,
          argv.port,
          argv.p,
          argv.a.replace(/&&/, '%26%26'),
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
    coerce: arg => arg.match(coeus.methodsExpression()) ? arg : undefined,
    default: 'GET'
  }).option('paths', {
  alias: 'p',
  type: 'string',
  describe: 'paths to attack',
  coerce: arg => arg && arg.match(coeus.pathsExpression) ? arg.replace(/&&/, '%26%26') : undefined
}).option('attack-payloads', {
  alias: 'a',
  type: 'string',
  requiresArg: true,
  coerce: arg => arg && arg.match(coeus.paramsExpression()) ? arg.replace(/&&/, '%26%26') : undefined
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
  coerce: arg => arg && arg.match(coeus.configurationExpression()) ? arg : '',
}).option('load-config', {
  alias: ['l', 'could-you-please-load-this-file-thanks'],
  type: 'string',
  describe: 'load attack configuration from specified file (other option will be ignored)'
}).option('setup', {
  alias: 's',
  type: 'string',
  describe: 'load tool configuration from file passed',
  coerce: (arg: string) => arg.match(/^(\/|\.\/)/) ? arg : `${process.cwd()}/${arg}`,
  default: implicitConfigurationPath
}).argv;
