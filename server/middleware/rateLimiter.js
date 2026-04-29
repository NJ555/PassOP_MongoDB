import rateLimit from 'express-rate-limit';

// ── Helper: build a limiter ────────────────────────────────────────────────────
const makeLimiter = ({ windowMs, max, message }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,   // Send RateLimit-* response headers (RFC draft 7)
        legacyHeaders: false,     // Disable X-RateLimit-* legacy headers
        message: { success: false, message },
        handler(req, res, next, options) {
            res.status(429).json(options.message);
        },
    });

// ── Auth limiter ───────────────────────────────────────────────────────────────
// 10 login/signup attempts per 15 minutes per IP
// Protects against brute-force and credential stuffing attacks
export const authLimiter = makeLimiter({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,
    message: 'Too many authentication attempts. Please wait 15 minutes and try again.',
});

// ── Vault API limiter ─────────────────────────────────────────────────────────
// 100 requests per 10 minutes per IP
// Relaxed — allows normal CRUD usage while preventing automated scraping
export const vaultLimiter = makeLimiter({
    windowMs: 10 * 60 * 1000,  // 10 minutes
    max: 100,
    message: 'Too many vault requests. Please slow down and try again shortly.',
});

// ── Global fallback limiter ───────────────────────────────────────────────────
// 200 requests per 15 minutes — catches any route not covered above
export const globalLimiter = makeLimiter({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this IP. Please try again later.',
});
