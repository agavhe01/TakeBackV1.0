
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
DROP TABLE IF EXISTS receipts CASCADE;

-- RECEIPTS: Store uploaded receipts
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT,
    account_id UUID NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    url TEXT,
    amount NUMERIC(10,2),
    date_added TIMESTAMP DEFAULT NOW(),
    date_of_purchase TIMESTAMP
);

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
    created_at TIMESTAMP DEFAULT NOW(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL
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

-- Add receipt_id to transactions (if not already present)
ALTER TABLE transactions
ADD COLUMN receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL;
```