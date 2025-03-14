export class Uuid {
  /**
   * Generates a new UUID v4
   *
   * @returns {string}
   */
  static generate(): string {
    const randomPart = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    const timestamp = Date.now().toString(16)
    return `${randomPart()}${randomPart()}-${randomPart()}-4${randomPart().substring(1)}-${randomPart()}-${timestamp}${randomPart()}`
  }

  /**
   * Validates a UUID string
   *
   * @param {string} uuid
   * @returns {boolean}
   */
  static isValid(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      uuid,
    )
  }

  /**
   * Converts a UUID to a hexadecimal string
   *
   * @param {string} uuid
   * @returns {string}
   */
  static toHex(uuid: string): string {
    return uuid.replace(/-/g, '')
  }

  /**
   * Converts a hexadecimal string to a UUID
   *
   * @param {string} hex
   * @returns {string}
   */
  static fromHex(hex: string): string {
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  /**
   * Generates a new UUID v4 with a specific namespace
   *
   * @param {string} namespace
   * @returns {Promise<string>}
   */
  static async generateWithNamespace(namespace: string): Promise<string> {
    const hash = await this.hash(namespace)
    const uuid = this.generate()
    return uuid.replace(uuid.slice(0, 8), hash.slice(0, 8))
  }

  /**
   * Generates a new UUID v4 with a specific name
   *
   * @param {string} name
   * @returns {Promise<string>}
   */
  static async generateWithName(name: string): Promise<string> {
    const hash = await this.hash(name)
    const uuid = this.generate()
    return uuid.replace(uuid.slice(0, 8), hash.slice(0, 8))
  }

  /**
   * Extracts the version from a UUID
   *
   * @param {string} uuid
   * @returns {number}
   */
  static getVersion(uuid: string): number {
    const versionHex = uuid.replace(/-/g, '').charAt(12)
    return parseInt(versionHex, 16) >> 4
  }

  /**
   * Extracts the variant from a UUID
   *
   * @param {string} uuid
   * @returns {number}
   */
  static getVariant(uuid: string): number {
    const variantHex = uuid.replace(/-/g, '').charAt(8)
    return parseInt(variantHex, 16) & 0x3f
  }

  /**
   * Checks if a UUID is a v4 UUID
   *
   * @param {string} uuid
   * @returns {boolean}
   */
  static isV4(uuid: string): boolean {
    return this.getVersion(uuid) === 4
  }

  /**
   * Checks if a UUID is a v5 UUID
   *
   * @param {string} uuid
   * @returns {boolean}
   */
  static isV5(uuid: string): boolean {
    return this.getVersion(uuid) === 5
  }

  /**
   * Throws an exception if the UUID is invalid
   *
   * @param {string} uuid
   * @throws {Error}
   */
  static validate(uuid: string): void {
    if (!this.isValid(uuid)) {
      throw new Error(`Invalid UUID: ${uuid}`)
    }
  }

  /**
   * Hashes a string using SHA-256
   *
   * @param {string} input
   * @returns {Promise<string>}
   */
  private static async hash(input: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }
}
