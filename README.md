# Intercity Bus Ticket Purchasing System (BiletMatik)

> **Çukurova University | Faculty of Engineering | Department of Computer Engineering**  
> **CEN317 Engineering Design Project - Autumn 2026**

A web-based intercity bus ticket purchasing platform featuring dynamic cabin seating topologies (1+1+1, 2+1, 2+2), sociocultural adjacent-seat gender constraints, real-time 300-second (5-minute) TTL seat locking, mathematical T.C. identity validation, and simulated 3D Secure checkout.

---

## 👥 Engineering Team & Contributions

| Student No | Name | Role & Responsibility |
| :--- | :--- | :--- |
| **2023555311** | **Fatma Abuabid** | **Module 1 (Backend Core & Concurrency Engine):** PostgreSQL normalized schema, RESTful APIs, 300s TTL seat lock scheduler, ACID transaction control. |
| **2023555463** | **Ozan Efe Acehan** | **Module 2 (Search Interface & Cabin Topologies):** Route search, dynamic bus seating layouts (1+1+1, 2+1, 2+2), seat status polling. |
| **2023555464** | **Yağız Muhammet Öztürk** | **Module 3 (Passenger Form Engine & Checkout Security):** Context + SessionStorage persistence, onBlur T.C. modulo validation, 3D Secure OTP simulation, printable PNR voucher. |

---

## 🏗️ System Architecture & Tech Stack

* **Frontend:** React 19, Vite v8, React Router v7, Tailwind CSS v4, Lucide Icons
* **Backend:** Node.js, Express.js (v4.21.1), Node-Cron
* **Database:** Relational PostgreSQL with foreign keys and ACID concurrency isolation
* **State Management:** Custom React Context synchronized with `SessionStorage` for zero-loss reload tolerance (F5)

---

## 📁 Repository Structure

```text
bus-ticket-system/
├── .gitignore
├── README.md
├── database/
│   └── schema.sql                 # 8 normalized PostgreSQL tables
├── backend/
│   ├── package.json
│   ├── index.js                   # Express server entry point
│   ├── db.js                      # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── tripController.js      # Journey search & seating queries
│   │   └── bookingController.js   # Atomic seat locking & booking commit
│   ├── routes/
│   │   ├── tripRoutes.js
│   │   └── bookingRoutes.js
│   └── services/
│       └── lockScheduler.js       # Background 300s TTL lock release
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── components/            # Header, PassengerCard, ThreeDSecureModal, TimeoutModal
        ├── context/               # BookingContext.jsx (State + SessionStorage)
        ├── pages/                 # SeatSelection, PassengerDetails, Checkout, Confirmation
        └── utils/                 # validation.js (T.C. mathematical modulo check)
```

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
* Git

### 2. Database Setup
```bash
# Connect to your local PostgreSQL instance and execute the schema:
psql -U postgres -d bus_ticket_db -f database/schema.sql
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

## 🛡️ License
This project is developed solely for educational purposes within the scope of the **CEN317 Engineering Design** course at Çukurova University.
