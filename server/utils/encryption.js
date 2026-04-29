import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Helper: get the key buffer at call time (after dotenv has already loaded).
// We trim() to handle Windows CRLF line endings where dotenv may include a
// trailing \r in the value, making a 32-char key appear 33 chars long.
const getKey = () => {
    const raw = process.env.ENCRYPTION_KEY;
    const key = raw?.trim();
    if (!key || key.length !== 32) {
        throw new Error(`ENCRYPTION_KEY must be exactly 32 characters (got ${key?.length ?? 0})`);
    }
    return Buffer.from(key, 'utf8');
};

/**
 * Encrypts a plain-text string using AES-256-CBC.
 * A fresh random IV is generated per call so identical passwords
 * produce different ciphertext each time — no patterns in the DB.
 *
 * Stored format in MongoDB: "iv_hex:encrypted_hex"
 *
 * @param {string} plainText - The password to encrypt
 * @returns {string} "iv:encryptedHex"
 */
export const encrypt = (plainText) => {
    if (!plainText) throw new Error('Encryption input cannot be empty');

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts an AES-256-CBC ciphertext string.
 *
 * @param {string} cipherText - "iv:encryptedHex" from MongoDB
 * @returns {string} Original plain-text password
 */
export const decrypt = (cipherText) => {
    if (!cipherText) throw new Error('Decryption input cannot be empty');

    const [ivHex, encrypted] = cipherText.split(':');
    if (!ivHex || !encrypted) throw new Error('Invalid ciphertext format');

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};
