import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import vaultRoutes from './routes/vaultRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { authLimiter, vaultLimiter, globalLimiter } from './middleware/rateLimiter.js';

// Load environment variables FIRST — before everything else
dotenv.config();

// ─── Startup Validation ───────────────────────────────────────────────────────
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'ENCRYPTION_KEY'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`❌ FATAL: Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1); // Crash early, crash loudly
}

// Connect to MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy (required for rate limiting behind load balancers/reverse proxies)
app.set('trust proxy', 1);

// ─── Middleware ────────────────────────────────────────────────────────────────

// Secure HTTP headers
app.use(helmet());

// CORS: only allow requests from the React frontend
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true, // Required to allow cookies to be sent cross-origin
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse HTTP-only cookies (used for JWT auth)
app.use(cookieParser());

// ─── Rate Limiting ────────────────────────────────────────────────────────────

// Global limiter: applied to ALL /api routes as a safety net
app.use('/api/', globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Auth routes get the strictest limit (10 req / 15 min) — brute-force protection
app.use('/api/auth', authLimiter, authRoutes);

// Vault routes get a relaxed limit (100 req / 10 min) — normal CRUD usage
app.use('/api/vault', vaultLimiter, vaultRoutes);

// Health check endpoint — useful for deployment & debugging
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'PassOp API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
// Catches any route that doesn't match the above definitions
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be LAST — Express identifies it as an error handler via the 4 arguments
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ PassOp server running on http://localhost:${PORT}`);
});
