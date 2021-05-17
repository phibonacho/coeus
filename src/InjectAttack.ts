import Attack from "./Attack";

export const cmdInjects: string[] = [
  ' && ls -l',
  'asdf || ls -l',
  ' ; ls -l',
];

export const checkExp = /[d-][rwx-]{9}\s+[0-9]+(\s+[A-Za-z0-9]+){2}\s+[0-9]+/gm;

export default class InjectAttack extends Attack {
  private injections: string[];

  public constructor(method: string, host: string, port: number, path: string, payload: string, check: RegExp | null, injections: string[]) {
    super(method, host, port, path, payload, check);
    this.injections = injections;
  }

  protected generateAttackList() {
    let result: Attack[] = [];
    this.method.split(Attack.configuration.listDelimiter).forEach(method => {
      this.path.split(Attack.configuration.listDelimiter).forEach(path => {
        this.payload.split(Attack.configuration.listDelimiter).forEach(p => {
          this.injections.forEach(inj => {
            result.push(new Attack(method, this.host, this.port, path, (p + inj).replace(/&&/, '%26%26'), this.check));
          });
        });
      });
    });
    return result;
  }
}
