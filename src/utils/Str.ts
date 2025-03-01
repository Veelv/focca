import { Uuid } from "./Uuid";

export class Str {
  /**
   * Converts a given string to camelCase format.
   * @param value - The input string to be converted.
   * @returns The camelCased string.
   */
  static camelCase(value: string): string {
    return value
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, "");
  }

  /**
   * Converts a given string to kebab-case format.
   * @param value - The input string to be converted.
   * @returns The kebab-cased string.
   */
  static kebabCase(value: string): string {
    return value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }

  /**
   * Converts a given string to snake_case format.
   * @param value - The input string to be converted.
   * @returns The snake-cased string.
   */
  static snakeCase(value: string): string {
    return value
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]+/g, "");
  }

  /**
   * Checks if a string contains a specified substring.
   * @param value - The string to search within.
   * @param search - The substring to search for.
   * @returns True if the substring is found; otherwise, false.
   */
  static contains(value: string, search: string): boolean {
    return value.indexOf(search) !== -1;
  }

  /**
   * Checks if a string starts with a specified substring.
   * @param value - The string to check.
   * @param search - The substring to check for at the start.
   * @returns True if the string starts with the substring; otherwise, false.
   */
  static startsWith(value: string, search: string): boolean {
    return value.startsWith(search);
  }

  /**
   * Checks if a string ends with a specified substring.
   * @param value - The string to check.
   * @param search - The substring to check for at the end.
   * @returns True if the string ends with the substring; otherwise, false.
   */
  static endsWith(value: string, search: string): boolean {
    return value.endsWith(search);
  }

  /**
   * Converts a given string to title case format.
   * @param value - The input string to be converted.
   * @returns The title-cased string.
   */
  static titleCase(value: string): string {
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Converts a given string to a URL-friendly slug format.
   * @param value - The input string to be converted.
   * @returns The slugified string.
   */
  static slug(value: string): string {
    return this.kebabCase(value)
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Trims whitespace from both ends of a string.
   * @param value - The input string to be trimmed.
   * @returns The trimmed string.
   */
  static trim(value: string): string {
    return value.trim();
  }

  /**
   * Removes all spaces from a string.
   * @param value - The input string to process.
   * @returns The string without spaces.
   */
  static removeSpaces(value: string): string {
    return value.replace(/\s+/g, "");
  }

  /**
   * Replaces all occurrences of a substring with a specified replacement string.
   * @param value - The input string to process.
   * @param search - The substring to search for.
   * @param replacement - The string to replace the substring with.
   * @returns The modified string with replacements.
   */
  static replace(value: string, search: string, replacement: string): string {
    const regex = new RegExp(search, "g");
    return value.replace(regex, replacement);
  }

  /**
   * Counts the number of words in a string.
   * @param value - The input string to count words in.
   * @returns The number of words in the string.
   */
  static wordCount(value: string): number {
    return value.trim().split(/\s+/).length;
  }

  /**
   * Checks if a string is empty.
   * @param value - The input string to check.
   * @returns True if the string is empty; otherwise, false.
   */
  static isEmpty(value: string): boolean {
    return value.length === 0;
  }

  /**
   * Converts a string to lowercase.
   * @param value - The input string to convert.
   * @returns The lowercase version of the string.
   */
  static toLower(value: string): string {
    return value.toLowerCase();
  }

  /**
   * Converts a string to uppercase.
   * @param value - The input string to convert.
   * @returns The uppercase version of the string.
   */
  static toUpper(value: string): string {
    return value.toUpperCase();
  }

  /**
   * Generates a UUID using the Uuid module.
   * @returns A generated UUID string.
   */
  static uuid(): string {
    return Uuid.generate();
  }

  /**
   * Generates a code of specified length from a UUID.
   * @param length - The desired length of the code (default is 8).
   * @returns A substring of the UUID in hexadecimal format.
   */
  static code(length: number = 8): string {
    const uuid = this.uuid();
    const hex = Uuid.toHex(uuid);
    return hex.slice(0, length);
  }

  /**
   * Generates an array of unique random lottery numbers within a specified range.
   * @param quantity - The number of unique numbers to generate.
   * @param min - The minimum value of the range.
   * @param max - The maximum value of the range.
   * @param unique - Whether the numbers should be unique (default is true).
   * @returns An array of generated lottery numbers.
   * @throws Error if quantity is less than or equal to 0, or if min is not less than max, or if unique quantity exceeds available range.
   */
  static lottery(
    quantity: number,
    min: number,
    max: number,
    unique: boolean = true
  ): number[] {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0.");
    }
    if (min >= max) {
      throw new Error("Minimum value must be less than the maximum.");
    }
    if (unique && quantity > max - min + 1) {
      throw new Error(
        "Quantity exceeds the available range of unique numbers."
      );
    }

    const numbers: number[] = [];
    while (numbers.length < quantity) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (unique && numbers.includes(num)) {
        continue;
      }
      numbers.push(num);
    }
    return numbers;
  }
}
