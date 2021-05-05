import axios, {Method} from "axios";
import ora, {Ora} from "ora";
import chalk from "chalk";

export default class AttackConfiguration {
  check: RegExp | null;
  method: string;
  host: string;
  path: string;
  payload: string;
  port: number;

  constructor(method: string, host: string, port: number, path: string, payload: string, check: RegExp | null) {
    this.method = method;
    this.host = host;
    this.port = port;
    this.path = path;
    this.payload = payload;
    this.check = check;
  }

  public toString() {
    return `configuration [${chalk.bold.bgBlueBright(this.method)} ${this.host}:${this.port}/${chalk.italic.cyan(this.path)} {${this.payload}}]`;
  }

  private generateAttackList() {
    let result: AttackConfiguration[] = [];
    this.method.split(',').forEach(method => {
      this.path.split(',').forEach(path => {
        this.payload.split(',').forEach(p => {
          result.push(new AttackConfiguration(method, this.host, this.port, path, p, this.check));
        })
      })
    });
    return result;
  }

  private checkAttack(config: AttackConfiguration, data: any, feedBackProvider: Ora) {
    if(config.check &&  data.split('\n').some((row: string) => row.match(config.check as RegExp)))
      feedBackProvider.succeed(`${config}: ${chalk.bold.greenBright('was effective')}!`);
    else if(!config.check)
      feedBackProvider.warn(`${config}: ended successfully ${chalk.bold.yellow('but no result chek was provided')}`);
    else
      feedBackProvider.fail(`${config}: ${chalk.bold.redBright('wasn\'t effective')}`);
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
            reqSpinner.fail(`attack: ${config.path} [${config.payload}] failed: ${error.message}`)
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
            reqSpinner.fail(`attack: ${config.path} [${config.payload}] failed: ${error.message}`)
          });
          break;
      }
    })
  }
}
