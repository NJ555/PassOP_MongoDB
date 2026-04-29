import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never return password in query results by default
        },
    },
    { timestamps: true }
);

// ─── Pre-save Hook ─────────────────────────────────────────────────────────────
// Automatically hash the password before saving a new or updated user
UserSchema.pre('save', async function (next) {
    // Only hash if the password field was actually modified (avoids re-hashing)
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12); // 12 rounds = strong but not too slow
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── Instance Method ───────────────────────────────────────────────────────────
// Compare a plain-text candidate password against the stored hashed password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
