import Attack, {AttackConfiguration} from "../Attack";

const coeus: AttackConfiguration = Attack.configuration;

export const basics = (yargs: any) => yargs.positional('host', {
  describe: 'host to attack',
  type: 'string'
}).positional('port', {
  describe: 'optional host port',
  type: 'number',
  default: 8080
}).option('methods', {
  alias: 'm',
  type: 'string',
  describe: 'HTTP method (GET|POST|PUT|HEAD|DELETE)[,GET|POST|PUT|HEAD|DELETE]*',
  coerce: (arg: string) => arg.match(coeus.methodsExpression()) ? arg : undefined,
  default: 'GET'
}).option('paths', {
  alias: 'p',
  type: 'string',
  describe: 'paths to attack',
  coerce: (arg: any) => arg && arg.match(coeus.pathsExpression()) ? arg : undefined
}).option('attack-payloads', {
  alias: 'a',
  type: 'string',
  requiresArg: true,
  coerce: (arg: string) => arg && arg.match(coeus.paramsExpression()) ? arg.replace(/&&/, '%26%26') : undefined,
  describe: 'attack payloads expressed as param=val&param=val(,paramx=valx&param...)*',
}).option('check', {
  alias: 'c',
  type: 'string',
  describe: 'attack return check expressed as regex',
}).option('quick-config', {
  alias: 'q',
  type: 'string',
  describe: 'quick attack configuration [METHOD:]path:params[:check] (other option will be ignored)',
  coerce: (arg: string) => arg && arg.match(coeus.configurationExpression()) ? arg : '',
}).option('load-config', {
  alias: ['l', 'could-you-please-load-this-file-thanks'],
  type: 'string',
  describe: 'load attack configuration from specified file (other option will be ignored)'
});
