# TripPilot AI — Next-Generation Intelligent Travel Booking Platform

TripPilot AI is a production-ready, full-stack travel booking application with an original brand, original UI layout, and dark-mode glassmorphic aesthetics. It combines real-time flight and hotel search, day-by-day smart itinerary builder, live budget optimization, and safe mock payments — powered by the **xAI Grok API** with seamless database fallbacks.

---

## 🌟 Key Highlights

- **Original Design System**: Dark-first glassmorphism, smooth micro-interactions, responsive card grids, and ambient gradient glows.
- **xAI Grok Integration**: Conversational travel assistant, day-by-day AI itinerary generation, 1-click itinerary modifications (Cheaper, Adventure, Family, Reduce Travel, Luxury), and budget optimization.
- **Robust Security**:
  - `GROK_API_KEY` is loaded strictly on the Flask server and never exposed to the client.
  - Server-side price recalculation — client-submitted totals are never trusted.
  - Idempotency keys on payments and bookings to eliminate double-charges.
  - JWT authentication with secure password hashing (`bcrypt`).
- **Comprehensive Data Seed**: Realistic destinations (Goa, Delhi, Mumbai, Kerala, Manali, Dubai, Bangkok, Singapore, Paris, Tokyo, London, New York), 200+ flights, 26 verified hotel properties, promotional coupons, and pre-configured demo users.

---

## 📁 Repository Structure

```
trippilot/
├── backend/
│   ├── app/
│   │   ├── routes/          # Flask Blueprints (auth, search, bookings, payments, itineraries, budgets, ai, admin)
│   │   ├── services/        # Business logic (ai_service, auth_service, booking_service, search_service, payment_service)
│   │   ├── utils/           # db.py, helpers.py, validators.py
│   │   └── __init__.py      # Flask app factory with CORS & JWT
│   ├── tests/               # Pytest suite
│   ├── config.py            # App configurations
│   ├── seed.py              # MongoDB Atlas seed script
│   ├── run.py               # Application entrypoint
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Layout, Search, Flight, Hotel, AI, Common)
│   │   ├── context/         # AuthContext, CartContext, ThemeContext
│   │   ├── hooks/           # useAuth, useCart, useTheme, useDebounce
│   │   ├── pages/           # 13 Main pages + Admin subpages
│   │   ├── routes/          # AppRouter, ProtectedRoute
│   │   ├── services/        # Axios API clients
│   │   └── types/           # Full TypeScript schema interfaces
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites

- **Python 3.10+**
- **Node.js 18+** & **npm**
- **MongoDB Atlas** or local MongoDB instance

---

### 2. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `trippilot/.env` (copy from `.env.example`):
   ```bash
   cp ../.env.example ../.env
   ```
   > Add your real `GROK_API_KEY=xai-...` to enable live Grok AI. If left empty, TripPilot AI will seamlessly operate using intelligent database-backed fallbacks.

5. Seed the database with destinations, flights, hotels, and demo users:
   ```bash
   python seed.py
   ```

6. Start the Flask backend server:
   ```bash
   python run.py
   ```
   The backend API will be live at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend UI will be running at `http://localhost:5173`.

---

## 🌐 Internationalization

The project now includes a **translation generation script** that automatically translates all UI strings into the supported languages (`ar`, `bn`, `de`, `es`, `fr`, `gu`, `hi`, `kn`, `ml`, `mr`, `pa`, `ta`, `te`).

- Run `npm run generate-translations` to fetch translations via the free LibreTranslate API and update each locale file under `src/i18n/locales/`.
- The script preserves existing translations and only adds missing keys.
- After running, restart the dev server to see the full site change language via the selector.

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin Superuser** | `admin@trippilot.ai` | `Admin@123456` |
| **Demo Traveller** | `demo@trippilot.ai` | `Demo@123456` |

*You can also click the quick pre-fill buttons on the Login page.*

---

## 🎁 Included Promotional Coupons

- `PILOT20` — 20% off first flight or hotel reservation (up to ₹5,000)
- `GOABEACH` — Flat ₹2,000 discount on Goa beachfront stays
- `FLYAWAY15` — 15% discount on all international flights

---

## 🧪 Testing Backend APIs

Run the automated Pytest test suite:
```bash
cd backend
./venv/bin/pytest tests/ -v
```

---

## 🛡️ License

Original architecture & design. Built for TripPilot AI.
