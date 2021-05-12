export default class RegexUtils {

  /**
   * Transform regex to a list one
   * @param token the regex matching single list item
   * @param name list name
   * @param delimiter item separator
   */
  public static listify(token: string, name: string, delimiter: string = ',') {
    return `(?<${name}>${token}(${delimiter}${token})*)`;
  }
}
