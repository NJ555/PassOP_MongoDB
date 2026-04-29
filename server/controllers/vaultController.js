import { validationResult } from 'express-validator';
import Vault from '../models/Vault.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// ─── @route  GET /api/vault ───────────────────────────────────────────────────
// @desc   Get all vault entries for the logged-in user
// @access Private
export const getEntries = async (req, res, next) => {
    try {
        const entries = await Vault.find({ user: req.user._id }).sort({
            createdAt: -1,
        });

        // Decrypt each password before sending to the client
        const decryptedEntries = entries.map((entry) => {
            const obj = entry.toObject();
            try {
                obj.password = decrypt(entry.encryptedPassword);
            } catch {
                obj.password = ''; // Fail safely — don't crash the whole list
            }
            delete obj.encryptedPassword; // Never expose raw ciphertext to frontend
            return obj;
        });

        res.status(200).json({ success: true, data: decryptedEntries });
    } catch (error) {
        next(error);
    }
};


// ─── @route  POST /api/vault ──────────────────────────────────────────────────
// @desc   Add a new vault entry
// @access Private
export const createEntry = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { siteName, siteUrl, username, password, notes, category } = req.body;

        // Encrypt BEFORE saving — zero-knowledge principle
        const encryptedPassword = encrypt(password);

        const entry = await Vault.create({
            user: req.user._id,
            siteName,
            siteUrl,
            username,
            encryptedPassword,
            notes,
            category,
        });

        // Return decrypted version to frontend for immediate UI update
        const responseEntry = entry.toObject();
        responseEntry.password = password;
        delete responseEntry.encryptedPassword;

        res.status(201).json({ success: true, data: responseEntry });
    } catch (error) {
        next(error);
    }
};


// ─── @route  PUT /api/vault/:id ───────────────────────────────────────────────
// @desc   Update an existing vault entry
// @access Private
export const updateEntry = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // Find the entry and make sure it belongs to this user
        const entry = await Vault.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: 'Entry not found.' });
        }

        const { siteName, siteUrl, username, password, notes, category, isFavorite } =
            req.body;

        // Update fields if provided
        if (siteName !== undefined) entry.siteName = siteName;
        if (siteUrl !== undefined) entry.siteUrl = siteUrl;
        if (username !== undefined) entry.username = username;
        if (notes !== undefined) entry.notes = notes;
        if (category !== undefined) entry.category = category;
        if (isFavorite !== undefined) entry.isFavorite = isFavorite;

        // Only re-encrypt if a new password was actually sent
        if (password) {
            entry.encryptedPassword = encrypt(password);
        }

        await entry.save();

        const responseEntry = entry.toObject();
        responseEntry.password = password || decrypt(entry.encryptedPassword);
        delete responseEntry.encryptedPassword;

        res.status(200).json({ success: true, data: responseEntry });
    } catch (error) {
        next(error);
    }
};


// ─── @route  DELETE /api/vault/:id ────────────────────────────────────────────
// @desc   Delete a vault entry
// @access Private
export const deleteEntry = async (req, res, next) => {
    try {
        const entry = await Vault.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: 'Entry not found.' });
        }

        res.status(200).json({ success: true, message: 'Entry deleted.' });
    } catch (error) {
        next(error);
    }
};


// ─── @route  PATCH /api/vault/:id/favorite ────────────────────────────────────
// @desc   Toggle the isFavorite flag on an entry
// @access Private
export const toggleFavorite = async (req, res, next) => {
    try {
        const entry = await Vault.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: 'Entry not found.' });
        }

        entry.isFavorite = !entry.isFavorite;
        await entry.save();

        res.status(200).json({ success: true, isFavorite: entry.isFavorite });
    } catch (error) {
        next(error);
    }
};
