# LinkIQ 🔗 — Smarter Links. Deeper Insights.

LinkIQ is a production-grade, full-stack **Link Intelligence Platform** designed for developers, creators, and businesses to create smart shortened links, set custom expiration dates, and view comprehensive, real-time analytics reports.

Built with a modern stack, custom design systems, and visual excellence, LinkIQ is designed to demonstrate interview-ready architecture and clean engineering patterns.

---

## 🚀 Key Features

- **Link Shortening & Custom Aliases**: Shorten links instantly with custom slug generation and collision detection.
- **Dynamic Analytics Dashboard**: Track total links, total clicks, active links, and daily activity.
- **Detailed Click Analytics**: View charts for click trends over the past 30 days, device type breakdowns, browser breakdown, and top referral countries.
- **Dynamic QR Codes**: Auto-generates downloadable QR codes for all shortened links inside the dashboard.
- **Secure Authentication**: Built with JWT and bcrypt password hashing.
- **Clean Architecture & Design**: Built with modular controllers, input validation middleware, global error handling, HSL variables, and dark mode aesthetics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS (v4) with custom tokens and animations
- **Routing**: React Router DOM (v6)
- **Charts**: Recharts (with responsive containers)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **QR Codes**: qrcode.react

### Backend
- **Server**: Node.js & Express
- **Database**: MongoDB (Atlas) & Mongoose ODM
- **Security**: JWT (JSON Web Tokens), bcryptjs
- **User Agent Parser**: ua-parser-js
- **IP Geolocation**: geoip-lite
- **Unique IDs**: NanoID

---

## 📁 Repository Structure

```text
linkIQ/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controller logic (auth, url, analytics, redirects)
│   ├── middleware/      # Authentication & global error middleware
│   ├── models/          # Mongoose database models (User, Url, Visit)
│   ├── routes/          # API endpoint router mappings
│   ├── scripts/         # DB seeders and scripts
│   ├── utils/           # Shared loggers, constants, and helpers
│   └── validators/      # Route body schema validation
└── frontend/
    ├── src/
    │   ├── components/  # Layout blocks, private routing guards, UI cards
    │   ├── context/     # Auth global state provider
    │   ├── pages/       # Login, signup, dashboard, links list, analytics
    │   ├── services/    # Centralized Axios services (api, auth, urls, analytics)
    │   └── utils/       # Utility date/number formatters
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster or running local MongoDB instance

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Fill in your environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random secret string
   - `JWT_EXPIRY`: Token duration (e.g., `7d`)
   - `PORT`: Server port (defaults to `5000`)
   - `CLIENT_URL`: Client application URL (e.g., `http://localhost:5173`)
5. Run the database seed script to import demo links and mock click analytics:
   ```bash
   npm run seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`. You can log in using the seeded account details:
   - **Email**: `demo@linkiq.com`
   - **Password**: `password123`

---

## 🏁 Hackathon Submission

This project is a part of a hackathon run by https://katomaran.com
