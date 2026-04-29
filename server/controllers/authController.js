import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateUserDEK } from '../utils/encryption.js';

// Helper: artificial delay to slow down brute force (Progressive Backoff)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Helper: Create & Send JWT via HTTP-only Cookie ───────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const cookieOptions = {
        httpOnly: true, // JavaScript cannot access this cookie — blocks XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' required for cross-domain cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    };

    res
        .status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
        });
};


// ─── @route  POST /api/auth/signup ────────────────────────────────────────────
// @desc   Register a new user
// @access Public
export const signup = async (req, res, next) => {
    try {
        // Check for validation errors from express-validator (defined in routes)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if email is already registered
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        // Generate the Data Encryption Key (DEK) for the new user
        const { storedDek } = generateUserDEK();

        // Create user — password is hashed by the pre-save hook in User model
        const user = await User.create({ name, email, password, encryptedDek: storedDek });
        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error); // Forward to global error handler
    }
};


// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
// @desc   Log in an existing user
// @access Public
export const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        // Fetch user including password and lockout fields
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

        if (!user) {
            // Delay to prevent timing attacks where invalid users return faster
            await delay(1000);
            return res
                .status(401)
                .json({ success: false, message: 'Invalid email or password.' });
        }

        // Check if the user is currently locked out
        if (user.isTemporarilyLocked()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(429).json({
                success: false,
                message: `Account temporarily locked due to multiple failed attempts. Try again in ${minutesLeft} minutes.`,
            });
        }

        // Progressive Backoff: Delay response if there are already multiple failed attempts
        if (user.loginAttempts >= 5) {
            await delay(2000); // 2 second penalty
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            user.loginAttempts += 1;
            
            // Trigger temporary lockout on 10th failure
            if (user.loginAttempts >= 10) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
            }
            await user.save();

            return res
                .status(401)
                .json({ success: false, message: 'Invalid email or password.' });
        }

        // Successful login: reset attempts and lockout
        if (user.loginAttempts > 0) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};


// ─── @route  POST /api/auth/logout ────────────────────────────────────────────
// @desc   Log out by clearing the auth cookie
// @access Private
export const logout = (req, res) => {
    res
        .clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .status(200)
        .json({ success: true, message: 'Logged out successfully.' });
};


// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// @desc   Return the currently logged-in user's profile
// @access Private (requires protect middleware)
export const getMe = async (req, res) => {
    // req.user is already set by the protect middleware
    res.status(200).json({
        success: true,
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
    });
};
