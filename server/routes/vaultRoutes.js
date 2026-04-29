import express from 'express';
import { body } from 'express-validator';
import {
    getEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
} from '../controllers/vaultController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// All vault routes require the user to be authenticated
router.use(protect);

// ── Input validation rules ─────────────────────────────────────────────────────

const entryValidation = [
    body('siteName').trim().notEmpty().withMessage('Site name is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const updateValidation = [
    body('siteName')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Site name cannot be empty'),
    body('username')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Username cannot be empty'),
];

// ── Routes ─────────────────────────────────────────────────────────────────────

router.get('/', getEntries);
router.post('/', entryValidation, createEntry);
router.put('/:id', updateValidation, updateEntry);
router.delete('/:id', deleteEntry);
router.patch('/:id/favorite', toggleFavorite);

export default router;
