# STYLECYCLE — Campus Thrift & Circular Clothing Exchange Marketplace

> **"Wear More. Waste Less."**  
> A peer-to-peer campus circular economy platform built for university students across Bangalore (Presidency University, RVCE, PES University, BMSCE, IISc Bangalore).

---

## 🌟 Overview

**STYLECYCLE** (formerly ReClothing) connects college peers to buy, sell, and swap pre-loved apparel, shoes, textbooks, and accessories within verified campus communities. The platform eliminates wasteful fast fashion and helps students save money while reducing textile waste, freshwater consumption, and CO₂ emissions.

---

## 🚀 Key Features

### 1. 🤖 AI-Powered Smart Listing & Pricing Assistant
- **Automated Cataloging**: Input an item name or hint (e.g., *Nike Air Force 1*, *Denim Jacket*, *CS Algorithms Textbook*) to automatically identify category, condition, item description, and size.
- **Fair Campus Pricing**: Intelligent valuation engine recommends reasonable student resale prices in **₹ INR** and **$ USD**.

### 2. 🔄 AI-Powered Smart Exchange Matching
- Scans student exchange preferences and finds compatible pairs (e.g., Student A has a jacket and wants sneakers; Student B has sneakers and wants a jacket).
- Generates a **compatibility score (68%–99%)** with explanations and direct trade proposal actions.

### 3. 🛡️ Verified Campus Student System
- Institutional email OTP authentication for verified student badges.
- Anti-fraud student trust scores (0–100) and reputation badges (*Trusted Seller*, *Eco Champion*, *Top Exchange Partner*).

### 4. 💬 Real-Time Campus Chat (Socket.IO)
- Instant peer messaging tied directly to marketplace listings.
- Live online/offline presence indicators and typing telemetry.

### 5. 📍 Interactive Campus Meetup Map (Leaflet & OpenStreetMap)
- Interactive map pinned to verified safe public meeting hubs across Bengaluru:
  - **Presidency University**: Central Courtyard & Canteen (Itgalpur)
  - **RVCE**: Central Library & Food Court Plaza
  - **PES University**: Food Court & OAT (Ring Road)
  - **BMSCE**: Bull Temple Gate & Sports Complex
  - **IISc Bangalore**: Central Library & Coffee House

### 6. 🏆 Real-Time Campus Leaderboard
- Real-time rankings table with top 3 podium champions (🥇 #1, 🥈 #2, 🥉 #3).
- Instant live updates powered by Socket.IO when trades and handshakes complete.

### 7. 📲 QR Handshake Pass
- When a pickup request is accepted, both students receive a digital QR Handshake Pass with a unique passcode.
- Handover confirmation marks items sold/exchanged and credits sustainability points to both student profiles.

### 8. 💱 Dual-Currency Support (Default: ₹ INR)
- Seamless top-bar segmented currency switcher between **₹ INR (Indian Rupees)** and **$ USD (US Dollars)**.
- Formats prices throughout cards, details, offers, and forms.

### 9. 🎭 Mascot Emoji Student Profiles
- Clean, aesthetic emoji profile avatars (`🦁`, `🦊`, `🦉`, `🐼`, `🐨`) with pastel badge frames in place of generic stock photos.

### 10. 🔍 Multi-Attribute Instant Search & Filters
- Unified search bar checks titles, descriptions, categories, sizes, conditions, and exchange preferences simultaneously.
- Filters for price range, condition, category, and listing type (*For Sale* vs. *For Exchange*).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React-Leaflet, Leaflet, QRcode.react, React Router 6, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose, JWT, bcryptjs, Helmet, CORS |
| **Database** | MongoDB Atlas Cloud Database |
| **Mapping** | OpenStreetMap, Leaflet Engine |
| **AI Services** | Semantic Classification & Valuation Engine, Gemini Vision API integration |

---

## 📂 Project Architecture

```
STYLECYCLE/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── api/                # Axios API modules (listing, feature, user, message, etc.)
│   │   ├── components/         # Navbar, UserAvatar, CampusMeetupMap, QrExchangeVerificationModal, AiListingAssistant, ProductCard
│   │   ├── context/            # AuthContext, CurrencyContext (INR default)
│   │   ├── pages/              # Home, Marketplace, Leaderboard, ExchangeMatching, ListingDetails, CreateListing, Messages, Profile, Dashboard
│   │   └── utils/              # formatCurrency, formatDate
│   └── package.json
│
├── server/                     # Express & Socket.IO Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js)
│   │   ├── controllers/        # authController, listingController, messageController, dashboardController
│   │   ├── middleware/         # authMiddleware, errorMiddleware
│   │   ├── models/             # User, Listing, Request, Message, Review, Notification
│   │   ├── routes/             # authRoutes, listingRoutes, featureRoutes, messageRoutes, dashboardRoutes
│   │   ├── services/           # aiService.js, exchangeMatchingService.js
│   │   ├── socket.js           # Real-time WebSocket server
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server bootstrap & HTTP server
│   ├── scripts/
│   │   └── seed.js             # Bangalore campus database seeder
│   └── package.json
│
├── package.json                # Monorepo root scripts (concurrently)
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** account or local MongoDB instance

### 2. Installation
Clone the repository and install all dependencies:
```bash
npm run install:all
```

### 3. Environment Setup
Configure your environment variables in `server/.env`:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret_key
CLIENT_URL=http://localhost:5173
# Optional: GEMINI_API_KEY=your_gemini_api_key
```

And in `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Database Seeding (Bangalore Campuses)
Seed demo users, listings, messages, and reviews:
```bash
npm run seed
```

### 5. Run the Application
Launch both client and server concurrently:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 👥 Demo Credentials

| Role | Name | Email | Password | Campus |
|---|---|---|---|---|
| **Admin** | Sanskar Bhanderi | `sanskarbhanderi08@gmail.com` | `password123` | IISc Bangalore |
| **Student** | Dev Patel | `dev@presidencyuniversity.in` | `password123` | Presidency University |
| **Student** | Ananya Sharma | `ananya@rvce.edu.in` | `password123` | RVCE Bengaluru |
| **Student** | Rohan Mehta | `rohan@pes.edu` | `password123` | PES University |
| **Student** | Pooja Iyer | `pooja@bmsce.ac.in` | `password123` | BMSCE Bengaluru |

*(One-click demo buttons are available on the Login page).*

---

## 🔒 Security & Campus Safety
- **No Online Financial Transactions**: Prevents credit card scams. All exchanges occur as physical handshakes in designated campus public zones.
- **QR Handshake Pass**: Digital proof-of-handover verifies item reception in person.
- **Public Pickup Points Only**: Library plazas, dining halls, and student centers with active CCTV coverage.
- **Institutional Verification**: OTP verification required for the Verified Student badge.

---

## 📄 License
ISC License © 2026 STYLECYCLE Engineering Team.
