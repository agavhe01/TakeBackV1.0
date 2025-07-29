# TakeBack V1.0

A credit management and spend management web application built with FastAPI, Next.js, Supabase, and Tailwind CSS.

## Project Structure

```
takeback/
├── backend/                 # FastAPI backend
│   ├── main.py            # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── env.example       # Environment variables template
├── frontend/              # Next.js frontend
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── package.json      # Node.js dependencies
│   └── env.local         # Frontend environment variables
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file from the example:
   ```bash
   cp env.example .env
   ```

5. Update the `.env` file with your Supabase credentials and JWT secret.

6. Run the backend:
   ```bash
   source venv/bin/activate && python main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your environment variables.

4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

```sql
-- Enable UUID generation (required for gen_random_uuid)
create extension if not exists "pgcrypto";

-- Drop tables if re-running
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- ACCOUNTS: Admin account for each startup
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    address TEXT ,           -- Full address as a single field
    zip_code TEXT,
    ssn TEXT,               -- For now, plaintext; should encrypt/mask in prod
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    organization_legal_name TEXT NOT NULL,
    orginazation_ein_number TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- BUDGETS: Track limits for account spending
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    limit_amount NUMERIC(10,2) NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'quarterly')),
    require_receipts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CARDS: Issued cards linked to an account and optional budget
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('issued', 'frozen', 'cancelled')),
    balance NUMERIC(10,2) DEFAULT 0,
    cardholder_name TEXT,
    cvv TEXT,
    expiry TEXT,
    zipcode TEXT,
    address TEXT,
    budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TRANSACTIONS: Purchases made using a card
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    name TEXT NOT NULL,
    date TIMESTAMP DEFAULT NOW()
);

-- POLICIES: Optional per-account settings for memo thresholds
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    memo_threshold NUMERIC(10,2),
    memo_prompt TEXT
);
```

## Bugs

1. Sign up/in --> password and some fields text not aligned in input field 
