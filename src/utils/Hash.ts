import bcrypt from 'bcrypt';
import argon2 from 'argon2';
import { HashOptions } from '../interfaces/IHashInterfaces';

/**
 * Enum representing supported hashing algorithms.
 */
enum HashAlgorithm {
    BCRYPT = 'bcrypt',
    ARGON2 = 'argon2'
}

/**
 * Class for handling password hashing and verification.
 */
class Hash {
    // Default options for hashing algorithms
    private static options: HashOptions = {
        bcrypt: {
            saltRounds: 10 // Default salt rounds for Bcrypt
        },
        argon2: {} // Default options for Argon2
    };

    /**
     * Configures the hashing options for Bcrypt and Argon2.
     * @param options - The options to configure.
     */
    public static configure(options: HashOptions): void {
        this.options = { ...this.options, ...options };
    }

    /**
     * Hashes a password using the specified algorithm.
     * @param password - The password to hash.
     * @param algorithm - The hashing algorithm to use (default is Bcrypt).
     * @returns The hashed password.
     */
    public static async make(password: string, algorithm: HashAlgorithm = HashAlgorithm.BCRYPT): Promise<string> {
        try {
            switch (algorithm) {
                case HashAlgorithm.BCRYPT:
                    return await this.bcryptHash(password);
                case HashAlgorithm.ARGON2:
                    return await this.argon2Hash(password);
                default:
                    throw new Error('Unsupported hashing algorithm');
            }
        } catch (error) {
            console.error('Error hashing password:', error);
            throw new Error('Hashing failed');
        }
    }

    /**
     * Hashes a password using Bcrypt.
     * @param password - The password to hash.
     * @returns The hashed password.
     */
    private static async bcryptHash(password: string): Promise<string> {
        const saltRounds = this.options.bcrypt?.saltRounds || 10; // Get salt rounds from options
        const salt = await bcrypt.genSalt(saltRounds); // Generate salt
        return await bcrypt.hash(password, salt); // Return hashed password
    }

    /**
     * Hashes a password using Argon2.
     * @param password - The password to hash.
     * @returns The hashed password.
     */
    private static async argon2Hash(password: string): Promise<string> {
        // Ensure options are defined and cast to the expected type
        const argon2Options = this.options.argon2 || {};
        return await argon2.hash(password, argon2Options); // Return hashed password
    }

    /**
     * Verifies a password against a hashed password using the specified algorithm.
     * @param password - The password to verify.
     * @param hashedPassword - The hashed password to compare against.
     * @param algorithm - The hashing algorithm used (default is Bcrypt).
     * @returns True if the password matches the hash, false otherwise.
     */
    public static async check(password: string, hashedPassword: string, algorithm: HashAlgorithm = HashAlgorithm.BCRYPT): Promise<boolean> {
        try {
            switch (algorithm) {
                case HashAlgorithm.BCRYPT:
                    return await this.bcryptCheck(password, hashedPassword);
                case HashAlgorithm.ARGON2:
                    return await this.argon2Check(password, hashedPassword);
                default:
                    throw new Error('Unsupported hashing algorithm');
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            throw new Error('Verification failed');
        }
    }

    /**
     * Verifies a password against a hashed password using Bcrypt.
     * @param password - The password to verify.
     * @param hashedPassword - The hashed password to compare against.
     * @returns True if the password matches the hash, false otherwise.
     */
    private static async bcryptCheck(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword); // Compare password with hashed password
    }

    /**
     * Verifies a password against a hashed password using Argon2.
     * @param password - The password to verify.
     * @param hashedPassword - The hashed password to compare against.
     * @returns True if the password matches the hash, false otherwise.
     */
    private static async argon2Check(password: string, hashedPassword: string): Promise<boolean> {
        return await argon2.verify(hashedPassword, password); // Verify password with hashed password
    }

    /**
     * Generates a random password of a specified length.
     * @param length - The length of the generated password (default is 12).
     * @returns A randomly generated password.
     */
    public static generateRandomPassword(length: number = 12): string {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex]; // Append random character to password
        }
        return password; // Return the generated password
    }

    /**
     * Validates the strength of a password based on specific criteria.
     * @param password - The password to validate.
     * @returns True if the password meets the strength criteria, false otherwise.
     */
    public static async validatePasswordStrength(password: string): Promise<boolean> {
        const minLength = 8; // Minimum length for the password
        const hasUpperCase = /[A-Z]/.test(password); // Check for uppercase letters
        const hasLowerCase = /[a-z]/.test(password); // Check for lowercase letters
        const hasNumbers = /\d/.test(password); // Check for numbers
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Check for special characters

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars; // Return true if all criteria are met
    }

    /**
     * Hashes a password and validates its strength in one operation.
     * @param password - The password to hash and validate.
     * @param algorithm - The hashing algorithm to use (default is Bcrypt).
     * @returns An object containing the hashed password and a validity flag.
     */
    public static async hashAndValidate(password: string, algorithm: HashAlgorithm = HashAlgorithm.BCRYPT): Promise<{ hashed: string; isValid: boolean }> {
        const hashed = await this.make(password, algorithm); // Hash the password
        const isValid = await this.check(password, hashed, algorithm); // Validate the hashed password
        return { hashed, isValid }; // Return the hashed password and validity
    }
}

export { Hash, HashAlgorithm };