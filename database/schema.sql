-- ==============================================================================
-- CEN317 Engineering Design - Intercity Bus Ticket Purchasing System
-- Database Schema: PostgreSQL 15+ Relational Architecture
-- Module 1 (Backend Core & Concurrency Engine) - Fatma Abuabid
-- ==============================================================================

-- Drop tables if exists in reverse dependency order
DROP TABLE IF EXISTS security_logs CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS seat_locks CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Authentication & Role Management)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'passenger' CHECK (role IN ('passenger', 'admin', 'clerk')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Buses Table (Fleet & Dynamic Layout Types)
CREATE TABLE buses (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL,
    total_capacity INT NOT NULL,
    layout_type VARCHAR(10) NOT NULL CHECK (layout_type IN ('1+1+1', '2+1', '2+2')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Trips Table (Schedules & Routes)
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    bus_id INT NOT NULL REFERENCES buses(id) ON DELETE RESTRICT,
    origin VARCHAR(50) NOT NULL,
    destination VARCHAR(50) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL CHECK (base_fare > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Seats Table (Physical Cabin Grid Mapping)
CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    bus_id INT NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    seat_number INT NOT NULL,
    row_idx INT NOT NULL,
    col_idx INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_bus_seat UNIQUE (bus_id, seat_number)
);

-- 5. Seat Locks Table (Distributed TTL Concurrency Control)
CREATE TABLE seat_locks (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    seat_number INT NOT NULL,
    lock_token VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'LOCKED' CHECK (status IN ('LOCKED', 'RELEASED', 'COMMITTED')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_active_seat_lock UNIQUE (trip_id, seat_number)
);

-- Index for the TTL cron service (expires_at cleanup)
CREATE INDEX idx_seat_locks_expires ON seat_locks (expires_at) WHERE status = 'LOCKED';

-- 6. Bookings Table (Confirmed Reservations & Financial Records)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES trips(id) ON DELETE RESTRICT,
    pnr_code VARCHAR(20) UNIQUE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (payment_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Passengers Table (Passenger Manifest & Sociocultural Identity)
CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_number INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    tc_no VARCHAR(11) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('ERKEK', 'KADIN')),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Security Logs Table (Audit Trail & Lock Overrides)
CREATE TABLE security_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
