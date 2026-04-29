# 🛡️ PassOp - Advanced Secure Password Manager

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)
![Security](https://img.shields.io/badge/Security-AES--256--GCM-red?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

PassOp is a production-grade, secure password manager built with the MERN stack (MongoDB, Express, React, Node.js). Engineered with a defense-in-depth approach, it moves beyond standard tutorial projects by implementing a **Two-Tier Server-Side Key Hierarchy (Envelope Encryption)** using AES-256-GCM, stateful progressive backoff to mitigate brute-force attacks, and strict HTTP security configurations.

## 🚀 Key Features

- **Envelope Encryption Architecture:** Utilizes a global Key Encryption Key (KEK) to encrypt unique Data Encryption Keys (DEKs) generated per user. Vault entries are encrypted via AES-256-GCM using the unique DEKs.
- **Robust Authentication:** JWT-based authentication delivered via `Secure`, `HttpOnly`, and `SameSite=Strict` cookies to neutralize XSS and CSRF.
- **Account-Level Defense:** Combines IP-based rate limiting with a database-backed progressive backoff and temporary lockout mechanism to thwart credential stuffing and distributed brute-force attacks.
- **API Hardening:** Protected by `helmet` for secure HTTP headers, strict environment variable startup validation, and CORS restrictions.
- **Beautiful UI:** Responsive dashboard with real-time password strength estimation and vault management.

## 🛡️ Threat Model & Security Decisions

### Threat: Database Compromise (SQLi/NoSQLi or Backup Leak)
**Mitigation:** Vault passwords are encrypted using AES-256-GCM. To prevent a single point of failure, we utilize a two-tier key hierarchy. A global Key Encryption Key (KEK) is stored strictly in environment variables. Each user is assigned a unique Data Encryption Key (DEK) stored encrypted in the database. The KEK is required to decrypt the DEK, which is then used to decrypt the vault. This drastically reduces the blast radius of a potential key compromise and enables seamless KEK rotation without massive database downtime.

### Threat: Credential Stuffing & Targeted Brute Force
**Mitigation:** While basic IP-based rate limiting stops generic scripts, modern attackers use botnets with rotating IPs. PassOp tracks `loginAttempts` per username. Upon repeated failures, it triggers **Progressive Backoff** (artificial delays to throttle automation) and eventually a **Temporary Lockout**. This balances brute-force prevention with mitigating intentional Denial-of-Service (DoS) attacks against legitimate user accounts.

### Threat: Memory Scraping Attacks
**Mitigation:** Plaintext DEKs are **never** cached across sessions or requests. When a vault request is processed, the DEK is decrypted into a Node Buffer, utilized, and immediately zeroed out (`buffer.fill(0)`) before V8 garbage collection. This ensures the window of plaintext exposure in memory is reduced to milliseconds.

### Security Decision: Server-Side vs Zero-Knowledge
*Why didn't we use true Zero-Knowledge (ZK)?*
True Zero-Knowledge architecture requires that the server never sees the plaintext password or the derivation key. Keys must be derived locally via the WebCrypto API, and only ciphertext is transmitted. While this is the gold standard for password managers, it severely limits usability—specifically, it makes server-side password recovery impossible and complicates cross-device synchronization. For this iteration, we prioritized a robust **Server-Side Key Hierarchy** to balance high security with UX simplicity.

## 📂 Project Structure

```text
PassOp/
├── client/                 # React 19 Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Navbar, Cards)
│   │   ├── pages/          # Dashboard, Login, Signup
│   │   └── index.css       # Tailwind 4 configurations
├── server/                 # Node.js Express Backend
│   ├── config/             # MongoDB connection logic
│   ├── controllers/        # Core business logic (Auth, Vault)
│   ├── middleware/         # JWT Auth guards, Rate Limiters
│   ├── models/             # Mongoose schemas (User, Vault)
│   ├── routes/             # API routing
│   └── utils/              # Cryptography (DEK/KEK generation, AES-256-GCM)
└── README.md
```

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS 4, Lucide React, Axios.
- **Backend:** Node.js, Express, Mongoose.
- **Security:** AES-256-GCM, bcryptjs (hashing), jsonwebtoken, express-rate-limit, helmet.
- **Database:** MongoDB Atlas.

## 📦 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### 2. Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` directory. The `ENCRYPTION_KEY` is used as the global KEK.
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   ENCRYPTION_KEY=your_strong_global_kek_passphrase
   CLIENT_ORIGIN=http://localhost:5173
   ```
4. Start the server: `npm run dev`

### 3. Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`

## 🔮 Future Improvements

- **Key Management Service (KMS):** Offload KEK management to a dedicated HSM like AWS KMS or HashiCorp Vault.
- **Refresh Tokens:** Transition from long-lived JWTs to short-lived JWTs with opaque, rotating Refresh Tokens stored in Redis for granular session invalidation.
- **Zod Validation:** Migrate from `express-validator` to strict Zod schema parsing for enhanced type safety and NoSQLi prevention.

## 📄 License
This project is licensed under the MIT License.
