# 🥭 Nikhila Foods — Full Stack Online Food Store

> **Authentic Indian Food Store with Blinkit-Style Mobile Login, Real-Time Doorstep Delivery Tracking, Firebase Firestore Database, and Razorpay Payment Gateway.**

---

## 🌟 Key Features

### 1. 🥭 Premium Food Categories
- **Juicy Mangoes**: Naturally tree-ripened Banganapalli, Ratnagiri Alphonso (Hapus), Gir Kesar, and Dasheri mangoes packed in cushioned eco-crates.
- **Traditional Pickles**: Grandma's authentic Andhra Avakaya, Gongura Leaf, Country Tomato Garlic, and Sun-Aged Lemon pickles cured in cold-pressed oil and ceramic jars.
- **Pure Cooking Oils**: Wood-pressed (Chekku/Ghani) Groundnut, Sesame (Til), Mustard, and Extra Virgin Coconut oils.

### 2. 📱 Blinkit-Style Phone Number & OTP Login
- Fast, passwordless mobile authentication with Indian `🇮🇳 +91` flag prefix.
- 4-digit split OTP verification with auto-advance and test OTP hint (`1234`).
- Profile auto-completion for new users and auto-fill delivery address at checkout.

### 3. 🚚 Live Doorstep Delivery Tracking (Core Theme)
- Step-by-step real-time delivery pipeline:
  `Order Confirmed` ➔ `Packed with Fresh Seal` ➔ `Delivery Partner Assigned` ➔ `Out for Delivery` ➔ `Delivered`.
- Assigned delivery executive card with driver name, vehicle details, rating, and direct phone link.
- Interactive fast-forward delivery simulator.

### 4. 🔥 Google Firebase Cloud Firestore Database
- Project ID: `nikhilafoods-38dc6`
- Real-time order synchronization using Firestore `onSnapshot` listeners.
- Cloud storage for `orders`, `users`, and `products` collections with resilient fallback.

### 5. 💳 Razorpay Payment Gateway Integration
- Secure online payments supporting:
  - **UPI** (Google Pay, PhonePe, Paytm, BHIM, Cred)
  - **Credit & Debit Cards** (Visa, Mastercard, RuPay)
  - **NetBanking** (50+ Indian banks)
  - **Cash on Delivery (COD)** with doorstep verification
- Cryptographic HMAC-SHA256 signature verification.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express, CORS, Morgan
- **Database**: Google Cloud Firestore (Firebase SDK v10)
- **Payment Gateway**: Razorpay SDK & Node.js API
- **State Management**: React Context API (`CartContext`, `AuthContext`)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/skasif18-mahammad/fooddelivery.git
cd fooddelivery
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Start the backend:
```bash
node server.js
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

The application will be running at **http://localhost:5173**!

---

## 📁 Project Structure

```
c:/buisness/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # UI Components (Hero, Navbar, OrderTracker, CheckoutModal, etc.)
│   │   ├── context/            # CartContext and AuthContext
│   │   ├── services/           # firestoreService.js and razorpayService.js
│   │   ├── firebase.js         # Firebase Cloud Firestore config
│   │   ├── App.jsx             # Main Application Component
│   │   └── main.jsx            # Entry Point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend Express API
│   ├── data/                   # Seed data (products.json, orders.json, users.json)
│   ├── routes/                 # Express routes (products.js, orders.js, auth.js, payment.js)
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Backend Entry Point
│
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 📄 License
MIT License. Handcrafted for **Nikhila Foods**.
