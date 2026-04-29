# PassOp - Secure Password Manager

PassOp is a premium, secure, and modern password manager built with the MERN stack (MongoDB, Express, React, Node.js). It features AES-256 encryption for vault entries and robust authentication with JWT and HTTP-only cookies.

## 🚀 Features

- **Secure Vault:** All passwords are encrypted using AES-256-CBC before storage.
- **Robust Auth:** JWT-based authentication with secure, HTTP-only, and SameSite-compliant cookies.
- **Rate Limiting:** Protection against brute-force attacks on authentication and vault APIs.
- **Production-Ready:** Configured for deployment behind reverse proxies with `trust proxy` enabled.
- **Beautiful UI:** Responsive dashboard with password strength estimation and favorite toggling.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS 4, Lucide React, Axios.
- **Backend:** Node.js, Express, Mongoose.
- **Security:** bcryptjs (hashing), crypto (AES-256), jsonwebtoken, express-rate-limit.
- **Database:** MongoDB Atlas.

## 📦 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)

### 2. Backend Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` directory and add the following:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   ENCRYPTION_KEY=your_32_character_aes_key
   CLIENT_ORIGIN=http://localhost:5173
   ```
4. Start the server: `npm run dev`

### 3. Frontend Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`

## 🔒 Security Implementation

- **Data Privacy:** Passwords are encrypted using a global 32-character key stored in environment variables.
- **CSRF Protection:** SameSite cookie attributes prevent Cross-Site Request Forgery.
- **XSS Mitigation:** HTTP-only cookies prevent client-side scripts from accessing authentication tokens.
- **Brute Force Protection:** Strict rate limits on `/api/auth` (10 requests per 15 minutes).

## 📄 License

This project is licensed under the MIT License.
