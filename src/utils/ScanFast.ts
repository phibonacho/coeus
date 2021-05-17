import fs from "fs";
import yargs from "yargs";
import {basics} from './Builders';
import Attack, {AttackConfiguration} from "../Attack";


const coeus: AttackConfiguration = Attack.configuration;

export const builder = basics;

export const handler = (argv: any) => {
  // QUICK INLINE CONFIG OPTION
  if (argv.q) {
    let config = argv.q.match(coeus.configurationExpression()).groups;
    if (config) {
      new Attack(
        config.method || argv.method,
        argv.host,
        argv.port,
        config.path,
        config.params.replace(/&&/, '%26%26'),
        config.check ? new RegExp(config.check, 'gm') : null).fireAttack();
    } else {
      console.error(`Couldn't process quick configuration: ${argv['quick-config']}`)
    }
  }
  // QUICK CONFIG FROM FILE
  else if (argv.l) {
    fs.readFile(argv.l, 'utf8', (err, data) => {
      if (err) {
        console.error(`Couldn't read configuration from: ${argv.l}: ${err.message}`)
        process.exit(1);
      }

      data.split('\n').forEach((row: string) => {
        let config = (row.match(coeus.configurationExpression()) || { groups: null }).groups;
        if (config) {
          new Attack(
            config.method || argv.method,
            argv.host,
            argv.port,
            config.path,
            config.params.replace(/&&/, '%26%26'),
            config.check ? new RegExp(config.check, 'gm') : null).fireAttack();
        } else {
          console.error(`Couldn't process configuration: ${row}`)
        }
      })
    })
  }
  // FULL OPTION CONFIGURATION
  else if (argv.host && argv.port && argv.p && argv.a) {
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
};
