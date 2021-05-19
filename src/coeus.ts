#!/usr/bin/env node

import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import * as ScanFast from './utils/ScanFast';
import fs from "fs";
import Attack from "./Attack";

const implicitConfigurationPath = `${process.cwd()}/coeus.config.js`;

yargs(hideBin(process.argv))
  .command('fast <host> [port]',
    'Scan host with provided attack configurations',
    ScanFast.builder,
    (argv: any) => configLoader(argv, ScanFast.handler)
  )
  // host port and setup are global
  .positional('host', {
    describe: 'host to attack',
    type: 'string'
  }).positional('port', {
  describe: 'optional host port',
  type: 'number',
  default: 8080
}).option('setup', {
    alias: 's',
    type: 'string',
    describe: 'load tool sql_injections from file',
    coerce: (arg: string) => arg.match(/^(\/|\.\/)/) ? arg : `${process.cwd()}/${arg}`,
    default: implicitConfigurationPath
  }).argv;

function configLoader(_argv: any, callback: (a: any) => void) {
  if (_argv.setup) {
    if (fs.existsSync(_argv.setup)) {
      Object.assign(Attack.configuration, require(_argv.setup));
    } else {
      if (_argv.setup !== implicitConfigurationPath)
        console.error(`using default tool configuration: ${_argv.setup} not found.`);
    }
  }

  callback(_argv);
}
