import Attack, {AttackConfiguration} from "../Attack";
import {Options} from "yargs";

const coeus: AttackConfiguration = Attack.configuration;

module.exports = {
  methods: {
    alias: 'm',
    type: "string",
    describe: 'HTTP method (GET|POST|PUT|HEAD|DELETE)[,GET|POST|PUT|HEAD|DELETE]*',
    coerce: (arg: string) => arg.match(coeus.methodsExpression()) ? arg : undefined,
    default: 'GET'
  } as Options,
  paths: {
    alias: 'p',
    type: 'string',
    describe: 'paths to attack',
    coerce: (arg: any) => arg && arg.match(coeus.pathsExpression()) ? arg : undefined
  } as Options,
  'attacks-payload' : {
    alias: 'a',
    type: 'string',
    requiresArg: true,
    coerce: (arg: string) => arg && arg.match(coeus.paramsExpression()) ? arg.replace(/&&/, '%26%26') : undefined,
    describe: 'attack payloads expressed as param=val&param=val(,paramx=valx&param...)*'
  } as Options,
  check: {
    alias: 'c',
    type: 'string',
    describe: 'attack return check expressed as regex'
  } as Options,
  'quick-config': {
    alias: 'q',
    type: 'string',
    describe: 'quick attack sql_injections [METHOD:]path:params[:check] (other option will be ignored)',
    coerce: (arg: string) => arg && arg.match(coeus.configurationExpression()) ? arg : ''
  } as Options,
  'load-config': {
    alias: ['l', 'could-you-please-load-this-file-thanks'],
    type: 'string',
    describe: 'load attack sql_injections from specified file (other option will be ignored)'
  } as Options
}
