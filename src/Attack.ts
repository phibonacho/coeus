import axios, {Method} from "axios";
import ora, {Ora} from "ora";
import chalk from "chalk";
import RegexUtils from "./utils/RegexUtils";

export abstract class AttackConfiguration {
  listDelimiter: string;
  tokenDelimiter: string;
  methodDefinition: string;
  pathDefinition: string;
  paramDefinition: string;
  checkDefinition: string;

  protected constructor(methodDefinition: string, pathDefinition: string, paramDefinition: string, checkDefinition: string, listDelimiter: string, tokenDelimiter: string) {
    this.listDelimiter = listDelimiter;
    this.tokenDelimiter = tokenDelimiter;
    this.methodDefinition = methodDefinition;
    this.pathDefinition = pathDefinition;
    this.paramDefinition = paramDefinition;
    this.checkDefinition = checkDefinition;
  }


  public configurationExpression(): RegExp {
    return new RegExp(`^(${this.methodsDefinition()}${this.tokenDelimiter})?${this.pathsDefinition()}${this.tokenDelimiter}${this.paramsDefinition()}(${this.tokenDelimiter}${this.checkDefinition})?$`);
  }

  public methodsExpression(): RegExp {
    return new RegExp(this.methodsDefinition(), 'gm');
  }

  public pathsExpression(): RegExp {
    return new RegExp(this.pathsDefinition(), 'gm');
  }

  public paramsExpression(): RegExp {
    return new RegExp(this.paramsDefinition(), 'gm');
  }

  private methodsDefinition(): string {
    return RegexUtils.listify(this.methodDefinition, 'method', this.listDelimiter);
  }

  private pathsDefinition(): string {
    return RegexUtils.listify(this.pathDefinition, 'path', this.listDelimiter);
  }

  private paramsDefinition(): string {
    return RegexUtils.listify(this.paramDefinition, 'params', this.listDelimiter)
  }

}

export class BaseConfiguration extends AttackConfiguration {
  public constructor() {
    super('(GET|POST|PUT|HEAD|DELETE)', '[-\\/.\\w]+', '\\w+=[\\w\\s|&\\-;\'=%*\.#]+', '(?<check>.*)', ',', ':');
  }
}

export default class Attack {
  private readonly check: RegExp | null;
  private readonly method: string;
  private readonly host: string;
  private readonly path: string;
  private readonly payload: string;
  private readonly port: number;
  public static configuration: AttackConfiguration = new BaseConfiguration();

  constructor(method: string, host: string, port: number, path: string, payload: string, check: RegExp | null) {
    this.method = method;
    this.host = host;
    this.port = port;
    this.path = path;
    this.payload = payload;
    this.check = check;
  }

  public toString() {
    return `[${this.method} ${this.host}:${this.port}/${this.path}]:(${this.payload})`;
  }

  private generateAttackList() {
    let result: Attack[] = [];
    this.method.split(Attack.configuration.listDelimiter).forEach(method => {
      this.path.split(Attack.configuration.listDelimiter).forEach(path => {
        this.payload.split(Attack.configuration.listDelimiter).forEach(p => {
          result.push(new Attack(method, this.host, this.port, path, p, this.check));
        })
      })
    });
    return result;
  }

  private checkAttack(config: Attack, data: any, feedBackProvider: Ora) {
    if(config.check) {
      let result = data.split('\n').filter((row: string) => row.match(config.check as RegExp));
      if(result) {
        feedBackProvider.succeed(`${config}: ${chalk.bold.greenBright('was effective')}!`);
        console.info(`\t matching result: ${chalk.italic.greenBright(data)}`);
      }
      else {
        feedBackProvider.fail(`${config}: ${chalk.bold.redBright('wasn\'t effective')}`);
      }
    }
    else {
      feedBackProvider.warn(`${config} ended successfully ${chalk.bold.yellow('but no result chek was provided')}`);
      console.info(`\t attack result: ${chalk.italic.greenBright(data)}`);
    }
  }

  public fireAttack() {
    this.generateAttackList().forEach(config => {
      const reqSpinner: Ora = ora({
        text: `Launching attack: ${config.path} [${config.payload}]`,
        color: 'yellow'
      }).start();

      switch (this.method) {
        case "POST":
        case "DELETE":
        case "HEAD":
        case "PUT":
          axios({
            method: config.method as Method,
            url: config.path,
            baseURL: `${config.host}:${config.port}`,
            data: JSON.parse(config.payload)
          }).then(response => {
            this.checkAttack(config, response.data, reqSpinner);
          }).catch(error => {
            reqSpinner.fail(`${config} failed: ${error.message}`);
          });
          break;
        default: // GET is default
          axios({
            method: config.method as Method,
            url: config.path,
            baseURL: `${config.host}:${config.port}`,
            params: new URLSearchParams(config.payload)
          }).then(response => {
            this.checkAttack(config, response.data, reqSpinner);
          }).catch(error => {
            reqSpinner.fail(`${config} failed: ${error.message}`);
          });
          break;
      }
    })
  }
}
