import mongoose from 'mongoose';

const VaultSchema = new mongoose.Schema(
    {
        // Each vault entry belongs to exactly one user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true, // Index for fast per-user queries
        },
        // Human-readable label, e.g. "GitHub", "Netflix"
        siteName: {
            type: String,
            required: [true, 'Site name is required'],
            trim: true,
            maxlength: [100, 'Site name cannot exceed 100 characters'],
        },
        // The URL of the site (optional but helpful)
        siteUrl: {
            type: String,
            trim: true,
            default: '',
        },
        // Username or email for the site account
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
        },
        // ⚠️ This field stores the AES-256 ENCRYPTED password.
        // It is NEVER stored in plain text. The encrypt/decrypt happens
        // in the controller via utils/encryption.js before save / before response.
        encryptedPassword: {
            type: String,
            required: [true, 'Password is required'],
        },
        // Optional notes (e.g., "recovery codes", "2FA backup")
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
            default: '',
        },
        // Category for grouping entries (Social, Work, Banking, etc.)
        category: {
            type: String,
            trim: true,
            default: 'General',
        },
        // Convenience flag — mark frequently accessed entries
        isFavorite: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Vault = mongoose.model('Vault', VaultSchema);
export default Vault;
