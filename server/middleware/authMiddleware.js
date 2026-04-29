import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect
 *
 * Express middleware that guards any route requiring authentication.
 * Reads the JWT from the HTTP-only cookie (not the Authorization header),
 * which protects against XSS attacks since JavaScript cannot read HTTP-only cookies.
 *
 * Flow:
 *  1. Read token from req.cookies.token
 *  2. Verify the token against JWT_SECRET
 *  3. Fetch the user from DB and attach to req.user
 *  4. Call next() to proceed, or return 401 on any failure
 */
const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: 'Not authenticated. Please log in.' });
        }

        // Verify signature and expiry
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (exclude password)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: 'User no longer exists.' });
        }

        req.user = user;
        next();
    } catch (error) {
        // Handles TokenExpiredError, JsonWebTokenError, etc.
        return res.status(401).json({
            success: false,
            message: 'Session expired or invalid. Please log in again.',
        });
    }
};

export default protect;
