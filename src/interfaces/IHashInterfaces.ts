/**
 * Interface representing options for Argon2 hashing.
 */
export interface Argon2Options {
    type?: 0 | 1 | 2; // 0 = Argon2d, 1 = Argon2i, 2 = Argon2id
    memory?: number;
    time?: number;
    parallelism?: number;
    hashLength?: number;
}

/**
 * Interface representing options for hashing algorithms.
 */
export interface HashOptions {
    bcrypt?: {
        saltRounds?: number;
    };
    argon2?: Argon2Options;
}