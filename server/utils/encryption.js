import crypto from 'crypto';

const ALGORITHM_GCM = 'aes-256-gcm';
const ALGORITHM_CBC = 'aes-256-cbc';

// ── KEK (Key Encryption Key) Management ───────────────────────────────────────
// We derive a strict 32-byte KEK from the environment variable using SHA-256
// to ensure it is always the correct length, regardless of the raw string length.
const getKEK = () => {
    const raw = process.env.ENCRYPTION_KEY;
    if (!raw) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    return crypto.createHash('sha256').update(raw).digest();
};

// ── DEK (Data Encryption Key) Lifecycle ───────────────────────────────────────

/**
 * Generates a unique 32-byte DEK for a new user, and encrypts it with the global KEK.
 * @returns {Object} { plaintextDek: Buffer, storedDek: string }
 */
export const generateUserDEK = () => {
    const dek = crypto.randomBytes(32); // Plaintext Data Encryption Key
    const iv = crypto.randomBytes(12);  // GCM recommended IV length

    const cipher = crypto.createCipheriv(ALGORITHM_GCM, getKEK(), iv);
    let encryptedDek = cipher.update(dek).toString('hex');
    encryptedDek += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
        plaintextDek: dek,
        storedDek: `${iv.toString('hex')}:${authTag}:${encryptedDek}`
    };
};

/**
 * Decrypts a user's stored DEK using the global KEK.
 * @param {string} storedDek - The encrypted DEK string from the DB
 * @returns {Buffer} The plaintext 32-byte DEK Buffer
 */
export const decryptUserDEK = (storedDek) => {
    if (!storedDek) throw new Error('Stored DEK is missing');
    const parts = storedDek.split(':');
    if (parts.length !== 3) throw new Error('Invalid DEK format');

    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv(ALGORITHM_GCM, getKEK(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let dek = decipher.update(encryptedHex, 'hex');
    dek = Buffer.concat([dek, decipher.final()]);
    return dek;
};

/**
 * Safely destroys a DEK Buffer in memory.
 * @param {Buffer} dekBuffer - The buffer to zero out
 */
export const destroyDEK = (dekBuffer) => {
    if (dekBuffer && Buffer.isBuffer(dekBuffer)) {
        dekBuffer.fill(0);
    }
};

// ── Vault Encryption ──────────────────────────────────────────────────────────

/**
 * Encrypts a vault password using the user's specific DEK via AES-256-GCM.
 * @param {string} plainText - The vault password to encrypt
 * @param {Buffer} userDek - The plaintext DEK of the user
 * @returns {string} "ivHex:authTagHex:encryptedHex"
 */
export const encryptVault = (plainText, userDek) => {
    if (!plainText) throw new Error('Encryption input cannot be empty');
    if (!userDek || !Buffer.isBuffer(userDek)) throw new Error('Invalid user DEK provided');

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM_GCM, userDek, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts a vault password. Supports falling back to legacy AES-256-CBC if 
 * the ciphertext lacks an auth tag, ensuring backward compatibility.
 * @param {string} cipherText - The stored ciphertext string
 * @param {Buffer} userDek - The plaintext DEK of the user
 * @returns {string} The decrypted plain-text password
 */
export const decryptVault = (cipherText, userDek) => {
    if (!cipherText) throw new Error('Decryption input cannot be empty');

    const parts = cipherText.split(':');

    // ── V2: AES-256-GCM (3 parts: IV : AuthTag : Ciphertext)
    if (parts.length === 3) {
        if (!userDek || !Buffer.isBuffer(userDek)) throw new Error('User DEK required for V2 decryption');

        const [ivHex, authTagHex, encryptedHex] = parts;
        const decipher = crypto.createDecipheriv(ALGORITHM_GCM, userDek, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    // ── V1: Legacy AES-256-CBC (2 parts: IV : Ciphertext) using Global KEK
    // For a student project, allowing migration. Old entries use the global KEK.
    else if (parts.length === 2) {
        const [ivHex, encryptedHex] = parts;

        // Note: We trim in case of CRLF line endings from old dotenv loads
        const legacyKeyRaw = process.env.ENCRYPTION_KEY?.trim();
        if (!legacyKeyRaw || legacyKeyRaw.length !== 32) {
            throw new Error('Legacy CBC decryption failed: ENCRYPTION_KEY must be 32 chars');
        }
        const legacyKey = Buffer.from(legacyKeyRaw, 'utf8');

        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM_CBC, legacyKey, iv);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    throw new Error('Unrecognized ciphertext format');
};
