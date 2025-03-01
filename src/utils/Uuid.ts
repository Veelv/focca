export class Uuid {
    /**
     * Generates a new UUID v4
     *
     * @returns {string}
     */
    static generate(): string {
        const data = new Uint8Array(16);
        window.crypto.getRandomValues(data);
        data[6] = (data[6] & 0x0f) | 0x40; // Set version to 0100
        data[8] = (data[8] & 0x3f) | 0x80; // Set variant to 10

        const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    /**
     * Validates a UUID string
     *
     * @param {string} uuid
     * @returns {boolean}
     */
    static isValid(uuid: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(uuid);
    }

    /**
     * Converts a UUID to a hexadecimal string
     *
     * @param {string} uuid
     * @returns {string}
     */
    static toHex(uuid: string): string {
        return uuid.replace(/-/g, '');
    }

    /**
     * Converts a hexadecimal string to a UUID
     *
     * @param {string} hex
     * @returns {string}
     */
    static fromHex(hex: string): string {
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    /**
     * Generates a new UUID v4 with a specific namespace
     *
     * @param {string} namespace
     * @returns {Promise<string>}
     */
    static async generateWithNamespace(namespace: string): Promise<string> {
        const hash = await this.hash(namespace);
        const uuid = this.generate();
        return uuid.replace(uuid.slice(0, 8), hash.slice(0, 8));
    }

    /**
     * Generates a new UUID v4 with a specific name
     *
     * @param {string} name
     * @returns {Promise<string>}
     */
    static async generateWithName(name: string): Promise<string> {
        const hash = await this.hash(name);
        const uuid = this.generate();
        return uuid.replace(uuid.slice(0, 8), hash.slice(0, 8));
    }

    /**
     * Extracts the version from a UUID
     *
     * @param {string} uuid
     * @returns {number}
     */
    static getVersion(uuid: string): number {
        const versionHex = uuid.replace(/-/g, '').charAt(12);
        return parseInt(versionHex, 16) >> 4;
    }

    /**
     * Extracts the variant from a UUID
     *
     * @param {string} uuid
     * @returns {number}
     */
    static getVariant(uuid: string): number {
        const variantHex = uuid.replace(/-/g, '').charAt(8);
        return parseInt(variantHex, 16) & 0x3f;
    }

    /**
     * Checks if a UUID is a v4 UUID
     *
     * @param {string} uuid
     * @returns {boolean}
     */
    static isV4(uuid: string): boolean {
        return this.getVersion(uuid) === 4;
    }

    /**
     * Checks if a UUID is a v5 UUID
     *
     * @param {string} uuid
     * @returns {boolean}
     */
    static isV5(uuid: string): boolean {
        return this.getVersion(uuid) === 5;
    }

    /**
     * Throws an exception if the UUID is invalid
     *
     * @param {string} uuid
     * @throws {Error}
     */
    static validate(uuid: string): void {
        if (!this.isValid(uuid)) {
            throw new Error(`Invalid UUID: ${uuid}`);
        }
    }

    /**
     * Hashes a string using SHA-256
     *
     * @param {string} input
     * @returns {Promise<string>}
     */
    private static async hash(input: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}