# Intercity Bus Ticket Purchasing System (BiletMatik)

> **Çukurova University | Faculty of Engineering | Department of Computer Engineering**  
> **CEN317 Engineering Design Project - Autumn 2026**

A web-based intercity bus ticket purchasing platform featuring dynamic cabin seating topologies (1+1+1, 2+1, 2+2), sociocultural adjacent-seat gender constraints, real-time 300-second (5-minute) TTL seat locking via MongoDB Mongoose ODM, mathematical T.C. identity validation, and simulated 3D Secure checkout.

---

## 👥 Engineering Team & Contributions

| Student No | Name | Role & Responsibility |
| :--- | :--- | :--- |
| **2023555311** | **Fatma Abuabid** | **Module 1 (Backend Core & Concurrency Engine):** MongoDB document schemas & Mongoose models (`database/models/`), RESTful APIs, 300s TTL seat lock scheduler (`services/lockScheduler.js`), Mongoose session-based ACID transaction control. |
| **2023555463** | **Ozan Efe Acehan** | **Module 2 (Search Interface & Cabin Topologies):** Route search, dynamic bus seating layouts (1+1+1, 2+1, 2+2) in `SeatLayout.jsx`, real-time seat status polling. |
| **2023555464** | **Yağız Muhammet Öztürk** | **Module 3 (Passenger Form Engine & Checkout Security):** Context + SessionStorage persistence (`BookingContext.jsx`), onBlur T.C. modulo validation (`validation.js`), 3D Secure OTP simulation, printable PNR voucher (`ConfirmationPage.jsx`). |

---

## 🏗️ System Architecture & Tech Stack

```
+-------------------------------------+  REST / JSON   +-------------------------------------+
|      FRONTEND SPA (React + Vite)    | <----------->  |     BACKEND API (Node.js + Express) |
|  - Dynamic Seating Layouts (TM2)    |                |  - Concurrency Lock Engine (TM1)    |
|  - Passenger Forms & Logic (TM3)    |                |  - 300s Expired Seat TTL Cron (TM1) |
|  - 3D Secure Verification Layer     |                |  - Booking & Payment Gateways (TM1) |
|  - SessionStorage State Recovery    |                +-------------------------------------+
+-------------------------------------+                             |
                                                      Mongoose ODM (TLS/SSL)
                                                                   v
                                                +-------------------------------------+
                                                |     CLOUD NoSQL MongoDB             |
                                                | (trips, seats, seat_locks, bookings)|
                                                +-------------------------------------+
```

* **Frontend:** React 19, Vite v8, React Router v7, Tailwind CSS v4, Lucide Icons
* **Backend:** Node.js, Express.js (v4.21.1)
* **Database:** Cloud-hosted MongoDB via Mongoose ODM (document-oriented NoSQL)
* **State Management:** React Context API synchronized with `SessionStorage`

---

## 📁 Repository Structure

```text
bus-ticket-system/
├── .gitignore
├── README.md
├── database/
│   └── models/                      # Mongoose ODM document schemas (Fatma Abuabid)
│       ├── User.js
│       ├── Bus.js
│       ├── Trip.js
│       ├── Seat.js
│       ├── SeatLock.js              # TTL-indexed collection for seat locking
│       ├── Booking.js
│       ├── Passenger.js
│       └── SecurityLog.js
├── backend/
│   ├── package.json
│   ├── index.js                     # Express server entry point
│   ├── db.js                        # Mongoose connection manager
│   ├── controllers/
│   │   ├── tripController.js        # Journey search & seat status (TM1)
│   │   └── bookingController.js     # Atomic lock, validate & confirm (TM1)
│   ├── routes/
│   │   ├── tripRoutes.js
│   │   └── bookingRoutes.js
│   └── services/
│       └── lockScheduler.js         # Background 300s TTL lock release cron
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── components/              # Header, PassengerCard, ThreeDSecureModal, TimeoutModal
        ├── context/                 # BookingContext.jsx (State + SessionStorage)
        ├── pages/                   # SeatSelection, PassengerDetails, Checkout, Confirmation
        └── utils/                   # validation.js (T.C. mathematical modulo check)
```

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas cloud URI)
* Git

### 2. Environment Setup
Create a `.env` file inside `backend/`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bus_ticket_db
PORT=5000
NODE_ENV=development
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server starts at http://localhost:5000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Client runs at http://localhost:5173
```

---

## 🔀 Branch Strategy

| Branch | Owner | Description |
| :--- | :--- | :--- |
| `main` | All | Stable integration branch |
| `feature/backend-core-and-db` | Fatma Abuabid | MongoDB models, lock engine, REST APIs |
| `feature/search-and-topologies` | Ozan Efe Acehan | Route search & dynamic seating layouts |
| `feature/passenger-and-checkout` | Yağız M. Öztürk | Passenger forms, validation, 3D Secure |

---

## 🛡️ License
Educational project — CEN317 Engineering Design, Çukurova University, Autumn 2026.
