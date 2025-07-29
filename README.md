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
DROP TABLE IF EXISTS card_budgets CASCADE;

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

-- CARD_BUDGETS: Junction table for many-to-many relationship between cards and budgets
CREATE TABLE card_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(card_id, budget_id)
);

-- TRANSACTIONS: Purchases made using a specific card-budget combination
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_budget_id UUID NOT NULL REFERENCES card_budgets(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    merchant TEXT,
    receipt_url TEXT,
    date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
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


-- Create indexes for better performance
CREATE INDEX idx_transactions_card_budget_id ON transactions(card_budget_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_card_budgets_card_id ON card_budgets(card_id);
CREATE INDEX idx_card_budgets_budget_id ON card_budgets(budget_id);

select * from accounts;


```

## Features

### Budget Management
- Create and manage multiple budgets with different periods (weekly, monthly, quarterly)
- Set spending limits and receipt requirements
- Track budget usage and remaining amounts

### Card Management
- Create virtual cards with multiple budget associations
- Assign multiple budgets to a single card
- Calculate total spending limit based on combined budgets
- View budget breakdown for each card

### Transaction Tracking
- Record transactions against specific card-budget combinations
- Add, edit, and delete transactions
- Track spending against budget limits and by budget breakdown

## API Endpoints

### Cards
- `GET /api/cards` - Get all cards with associated budgets
- `POST /api/cards` - Create a new card with budget associations
- `PUT /api/cards/{card_id}` - Update a card and its budget associations
- `DELETE /api/cards/{card_id}` - Delete a card

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create a new budget
- `PUT /api/budgets/{budget_id}` - Update a budget
- `DELETE /api/budgets/{budget_id}` - Delete a budget

### Transactions
- `GET /api/transactions` - Get all transactions (optionally filter by card, budget, or card_budget)
- `POST /api/transactions` - Create a new transaction (requires card_budget_id)
- `PUT /api/transactions/{transaction_id}` - Update a transaction
- `DELETE /api/transactions/{transaction_id}` - Delete a transaction

## Recent Updates

### Multiple Budgets per Card
- Cards can now be associated with multiple budgets
- Total spending limit is calculated as the sum of all associated budgets
- Budget breakdown is displayed in the cards dashboard
- Card creation/editing modal shows selectable budgets as checkboxes

### Transactions Linked to Card-Budget
- Transactions now reference a unique card-budget combination
- Transaction CRUD supported via API and UI
- Transactions can be filtered and managed by card, budget, or both



Bugs:

budgets --> spent doesnt mean anything

cards --> balance coult be updated and budget spents could be visualized

dashboard -->

deployment --> 