# STYLECYCLE — Campus Thrift & Circular Clothing Exchange Marketplace

> **"Wear More. Waste Less."**  
> A full-stack, peer-to-peer campus circular economy platform built for university students across campuses (Presidency University, RVCE, PES University, BMSCE, IISc Bangalore).

---

## 🌟 Overview

**STYLECYCLE** connects college peers to buy, sell, exchange, and reuse pre-loved apparel, shoes, textbooks, gear, and accessories within verified campus communities. The platform eliminates wasteful fast fashion and helps students save money while reducing textile waste, freshwater consumption, and carbon emissions.

---

## 🚀 Key Features

### 1. 🛡️ Phase 1 — Student Authentication & College Verification
- **Institutional Identity**: Student registration with campus selector and institutional domain auto-verification (`.edu`, `.ac.in`, `.edu.in`).
- **Email OTP Verification**: Real 6-digit campus verification codes with automatic 10-minute expiration and resend capabilities.
- **Forgot & Reset Password**: Secure token-based password recovery powered by cryptographic SHA-256 hashing.
- **Role-Based Guards**: Protected routes, student access validation, and platform administrator controls (`protect`, `adminOnly`, `verifiedStudentOnly`).
- **Verified Badges**: Awarded upon verified student status along with starting campus reputation scores.

### 2. 🛍️ Phase 2 — Advanced Marketplace & Categorization
- **Comprehensive Taxonomy**:
  - `Clothing`, `Shoes`, `Accessories`, `Bags`, `Books`, `Electronics`, `Stationery`, `Sports equipment`, `Other`.
- **Rich Listing Details**: Multiple product images, subcategory, brand, original retail price, selling price, condition, size, color, exchange preferences, and designated campus pickup spot.
- **Listing Types**: Support for **For Sale**, **For Exchange**, and **Both**.
- **Multi-Attribute Search & Filters**: Search suggestions, product name & brand queries, price slider, condition, sizing, college filters, verified sellers only, and availability.
- **Dynamic Sorting**: Newest, oldest, lowest price, highest price, most popular, and most viewed.
- **Listing Lifecycle Management**: Edit, delete, pause listing, reactivate, mark sold, and report listing for moderation.

### 3. ❤️ Phase 3 — Wishlist & In-App Notification Center
- **Saved Campus Finds**: Dedicated Wishlist page to save and track pre-loved items with one-click bookmarking.
- **Event-Driven Notifications**: Notification bell with unread badge counter and real-time alerts for:
  - New instant messages
  - Purchase and exchange proposals
  - Seller approvals / rejections
  - Price offers and counter-offers
  - Campus pickup scheduling updates
  - Transaction completion confirmations
- **Read State Controls**: Mark individual notifications as read or mark all as read.

### 4. 💬 Phase 4 — Real-Time Chat & In-Conversation Negotiation
- **Real-Time WebSockets**: Instant peer-to-peer messaging powered by Socket.IO.
- **Online Presence & Typing Indicators**: Real-time telemetry showing when trading partners are active and typing.
- **In-Chat Price Negotiation**: Buyers and sellers can propose price offers, accept, reject, or make counter-offers directly inside the chat thread.
- **In-Chat Exchange Proposals**: Propose trading items with product card previews embedded in conversation.
- **Safety & Moderation**: Integrated user blocking and conversation reporting.

### 5. 🔄 Phase 5 — Smart Swap Reciprocal Matching Engine
- **Automated Reciprocal Matching**: Scans mutual preferences (e.g., Student A offers a jacket and seeks sneakers; Student B offers sneakers and seeks a jacket) and computes a compatibility score (0%–100%).
- **Multi-Factor Scoring Weights**: Evaluates category synergy, tokenized and semantic description overlap, condition distance, and price ratio symmetry.
- **Explainable Match Tiers**: Classified into Perfect, Strong, and Partial matches with factor breakdowns.
- **What-If Simulator**: Interactive playground to simulate wanted categories, brands, and custom weights without changing live listings.

### 6. 🤝 Phase 6 — Purchases, Transactions & Campus Pickup
- **Structured Transaction Lifecycle**: Request -> Seller Approval -> Product Reservation -> Completion / Cancellation.
- **Flexible Payment Architecture**:
  - Cash on Campus Pickup
  - UPI Payment
  - Online Payment Gateway (Test Mode)
- **Safe Campus Pickup Scheduling**: Synchronized date and time proposals for pre-approved meeting spots (Library, Cafeteria, Main Gate).
- **Digital Handshake & QR Pass**: Dynamic pass generation and code verification verifying physical item inspection before funds or sustainability points clear.

### 7. 📊 Phase 7 — Seller Analytics & Student Profiles
- **Student Seller Analytics**:
  - Active, sold, exchanged, and paused listing counters.
  - Total earnings, average selling price, and cumulative product view telemetry.
  - Category breakdown and most viewed listings insights.
- **Public Student Profiles**:
  - Verified student badge, college affiliation, member tenure, and seller trust rating.
  - Sustainability footprint: items diverted from landfills, CO₂ emissions prevented, and eco points earned.
  - Privacy controls to toggle public visibility of ratings and transaction history.

### 8. 💱 Dual-Currency Support (Default: ₹ INR)
- Seamless top-bar toggle between **₹ INR (Indian Rupees)** and **$ USD (US Dollars)** with automatic site-wide currency formatting.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React-Leaflet, Leaflet, QRCode.react, React Router 6, Socket.IO Client, Axios |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose, JWT, bcryptjs, Helmet, CORS, Nodemailer, Express-Validator |
| **Database** | MongoDB Atlas Cloud Database |
| **Mapping** | OpenStreetMap, Leaflet Engine |
| **AI & Matching** | TF-IDF Tokenization, Vector Cosine Similarity Engine, Explainable Reciprocal Matching |

---

## 📂 Project Structure

```
STYLECYCLE/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── api/                # API modules (auth, listing, feature, user, message, etc.)
│   │   ├── components/         # Navbar, ProductCard, CampusMeetupMap, QrExchangeVerificationModal, etc.
│   │   ├── context/            # AuthContext, CurrencyContext
│   │   ├── layouts/            # MainLayout
│   │   ├── pages/              # Home, Marketplace, ListingDetails, Wishlist, Messages, Dashboard, etc.
│   │   └── utils/              # formatCurrency, formatDate
│   └── package.json
│
├── server/                     # Express & Socket.IO Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js with DNS fallback)
│   │   ├── controllers/        # auth, listing, message, request, dashboard, user, review
│   │   ├── middleware/         # authMiddleware, errorMiddleware, validateRequest
│   │   ├── models/             # User, Listing, Request, Message, Review, Notification
│   │   ├── routes/             # authRoutes, listingRoutes, requestRoutes, messageRoutes, etc.
│   │   ├── services/           # emailService, exchangeMatchingService, aiService
│   │   ├── socket.js           # Real-time WebSocket handlers
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server bootstrap & HTTP server
│   ├── scripts/
│   │   └── seed.js             # Campus database seeder
│   └── package.json
│
├── package.json                # Monorepo root scripts (concurrently)
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** connection string or local MongoDB instance

### 2. Installation
Install all monorepo dependencies across root, client, and server:
```bash
npm run install:all
```

### 3. Environment Configuration

**`server/.env`:**
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secure_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Database Seeding (Optional)
Populate your database with demo student profiles and active campus listings:
```bash
npm run seed
```

### 5. Running the Application
Launch both the backend API and frontend client with a single command:
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **API Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 👥 Demo Student Credentials

| Role | Name | Email | Password | College |
|---|---|---|---|---|
| **Admin** | Sanskar Bhanderi | `sanskarbhanderi08@gmail.com` | `password123` | IISc Bangalore |
| **Student** | Dev Patel | `dev@presidencyuniversity.in` | `password123` | Presidency University |
| **Student** | Ananya Sharma | `ananya@rvce.edu.in` | `password123` | RVCE Bengaluru |
| **Student** | Rohan Mehta | `rohan@pes.edu` | `password123` | PES University |
| **Student** | Pooja Iyer | `pooja@bmsce.ac.in` | `password123` | BMSCE Bengaluru |

*(One-click demo login buttons are also provided on the sign-in page).*

---

## 🔒 Security & Campus Safety

- **Designated Public Zones**: All handovers are scheduled in safe public campus spots (Libraries, Student Centers, Main Gates).
- **Physical QR Handshake**: Digital confirmation prevents premature fund or item release.
- **Institutional Email Validation**: Ensures only verified university peers participate in exchange networks.
- **Privacy Controls**: Students have granular control over public visibility of their ratings and transaction history.

---

## 📄 License
ISC License © 2026 STYLECYCLE Engineering Team.
