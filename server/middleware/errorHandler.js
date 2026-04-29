/**
 * errorHandler.js
 *
 * Global Express error handler — MUST be registered LAST in server.js.
 * Any route or middleware that calls next(error) lands here.
 * Returns a consistent JSON shape so the frontend always knows what to expect.
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Server Error:', err.stack || err.message);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // ── Mongoose Specific Error Handling ──────────────────────────────────────

    // Duplicate key (e.g., email already registered)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `An account with this ${field} already exists.`;
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join('. ');
    }

    // Invalid MongoDB ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ID format: ${err.value}`;
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Only include stack trace in development — never expose in production
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;
