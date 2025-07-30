# TakeBack V1.0

A credit/debit card management and spend management web application built with FastAPI, Next.js, React, TypeScript, PostgreSQL, Supabase, and Tailwind CSS.

## 🌐 **Live Application Links**

### 🎨 **Frontend (Next.js)**
**🔗 [https://takeback-agavhera.vercel.app/](https://takeback-agavhera.vercel.app/)**

### ⚙️ **Backend (FastAPI)**
**🔗 [https://takeback-backend-agavhera.vercel.app/](https://takeback-backend-agavhera.vercel.app/)**

---

TakeBack helps organizations manage their credit card spending through comprehensive budget tracking, virtual card issuance, and detailed transaction analytics. Users can create multiple budgets with different spending periods (weekly, monthly, quarterly), issue virtual cards linked to specific budgets, and track spending in real-time. The application provides detailed analytics on spending patterns, balance calculations, and policy enforcement for receipt requirements and spending thresholds. With its modular backend architecture and modern frontend, TakeBack offers a scalable solution for businesses looking to gain better control over their corporate spending.

## Project Structure

```
takeback/
├── backend/                 # FastAPI backend (modular structure)
│   ├── app/                 # Main application package
│   │   ├── main.py          # FastAPI app initialization
│   │   ├── config/          # Configuration management
│   │   │   ├── settings.py  # Environment variables & config
│   │   │   └── database.py  # Supabase client setup
│   │   ├── models/          # Pydantic data models
│   │   │   ├── auth.py      # User authentication models
│   │   │   ├── budget.py    # Budget models
│   │   │   ├── card.py      # Card models
│   │   │   ├── transaction.py # Transaction models
│   │   │   ├── policy.py    # Policy models
│   │   │   └── analytics.py # Analytics models
│   │   ├── services/        # Business logic layer
│   │   │   ├── auth_service.py         # Authentication logic
│   │   │   ├── budget_service.py       # Budget business logic
│   │   │   ├── card_service.py         # Card business logic
│   │   │   ├── transaction_service.py  # Transaction business logic
│   │   │   ├── policy_service.py       # Policy business logic
│   │   │   └── analytics_service.py    # Analytics business logic
│   │   ├── api/             # API route handlers
│   │   │   ├── auth.py      # Authentication endpoints
│   │   │   ├── budgets.py   # Budget endpoints
│   │   │   ├── cards.py     # Card endpoints
│   │   │   ├── transactions.py # Transaction endpoints
│   │   │   ├── policies.py  # Policy endpoints
│   │   │   └── analytics.py # Analytics endpoints
│   │   ├── middleware/      # Custom middleware
│   │   └── utils/           # Utility functions
│   │       └── jwt.py       # JWT token utilities
│   ├── run.py               # Development server entry point
│   ├── deploy.py            # Production deployment entry point
│   ├── main.py              # Legacy entry point (redirects to run.py)
│   ├── requirements.txt     # Python dependencies
│   ├── vercel.json          # Vercel deployment configuration
│   └── env.example          # Environment variables template
├── frontend/                # Next.js frontend
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── package.json         # Node.js dependencies
│   ├── vercel.json          # Vercel deployment configuration
│   └── env.local            # Frontend environment variables
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
   python3 -m venv venv
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

6. **Run the backend (Development):**
   ```bash
   # Option 1: Using the run.py script (recommended)
   python3 run.py
   
   # Option 2: Direct uvicorn command
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   
   # Option 3: Using the legacy main.py (redirects to run.py)
   python3 main.py   --> PROBLEMATIC SOMETIMES
   ```

   The server will start on `http://localhost:8000` with auto-reload enabled.

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

## Development vs Production

### Development Mode
- **Backend**: Uses `run.py` with auto-reload enabled
- **Frontend**: Uses `npm run dev` with hot reload
- **Database**: Direct connection to Supabase
- **Debug**: Full debug statements and error details

### Production Mode
- **Backend**: Uses `deploy.py` optimized for serverless
- **Frontend**: Static build with optimized assets
- **Database**: Same Supabase connection
- **Debug**: Minimal logging for performance

## API Documentation

Once the backend is running, you can access:
- **Interactive API Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/`
- **Debug Endpoints**: 
  - `http://localhost:8000/debug/config`
  - `http://localhost:8000/debug/user/{email}`

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
- Optionally assign a receipt to each transaction (one-to-one or none)
- View and select from all uploaded receipts when creating or editing a transaction

### Receipt Management
- Upload and manage receipts (images or documents)
- Each receipt includes name, amount, date of purchase, and file URL
- Receipts can be linked to transactions for audit and compliance

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

### Balance Calculations
- `GET /api/balances` - Get comprehensive balance information for all cards and budgets
- `GET /api/cards/{card_id}/balance` - Get detailed balance information for a specific card
- `GET /api/budgets/{budget_id}/balance` - Get detailed balance information for a specific budget

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
DROP TABLE IF EXISTS receipts CASCADE;

-- RECEIPTS: Store uploaded receipts
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(500),
    account_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL CHECK (name <> ''),
    type VARCHAR(50) CHECK (type IN ('image', 'pdf', 'document')),
    url VARCHAR(500) CHECK (url ~ '^https?://'),
    amount NUMERIC(10,2) CHECK (amount >= 0),
    date_added TIMESTAMP DEFAULT NOW(),
    date_of_purchase TIMESTAMP CHECK (date_of_purchase <= NOW())
);

-- ACCOUNTS: Admin account for each startup
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL CHECK (first_name <> '' AND length(first_name) >= 2),
    last_name VARCHAR(50) NOT NULL CHECK (last_name <> '' AND length(last_name) >= 2),
    date_of_birth DATE CHECK (date_of_birth <= CURRENT_DATE),
    address VARCHAR(200) CHECK (address IS NULL OR length(address) >= 10),
    zip_code VARCHAR(10) CHECK (zip_code IS NULL OR zip_code ~ '^\d{5}(-\d{4})?$'),
    ssn VARCHAR(11) CHECK (ssn IS NULL OR ssn ~ '^\d{3}-\d{2}-\d{4}$'),
    phone VARCHAR(15) NOT NULL CHECK (phone ~ '^\+?1?\d{10,14}$'),
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    organization_legal_name VARCHAR(100) NOT NULL CHECK (organization_legal_name <> '' AND length(organization_legal_name) >= 3),
    organization_ein_number VARCHAR(10) NOT NULL CHECK (organization_ein_number ~ '^\d{2}-\d{7}$'),
    created_at TIMESTAMP DEFAULT NOW()
);

-- BUDGETS: Track limits for account spending
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL CHECK (name <> '' AND length(name) >= 2),
    limit_amount NUMERIC(10,2) NOT NULL CHECK (limit_amount > 0),
    period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'weekly', 'quarterly')),
    require_receipts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CARDS: Issued cards linked to an account and optional budget
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL CHECK (name <> '' AND length(name) >= 2),
    status VARCHAR(20) NOT NULL CHECK (status IN ('issued', 'frozen', 'cancelled')),
    balance NUMERIC(10,2) DEFAULT 0 CHECK (balance >= 0),
    cardholder_name VARCHAR(100) CHECK (cardholder_name IS NULL OR (cardholder_name <> '' AND length(cardholder_name) >= 2)),
    cvv VARCHAR(4) CHECK (cvv IS NULL OR cvv ~ '^\d{3,4}$'),
    expiry VARCHAR(5) CHECK (expiry IS NULL OR expiry ~ '^\d{2}/\d{2}$'),
    zipcode VARCHAR(10) CHECK (zipcode IS NULL OR zipcode ~ '^\d{5}(-\d{4})?$'),
    address VARCHAR(200) CHECK (address IS NULL OR length(address) >= 10),
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
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    name VARCHAR(100) NOT NULL CHECK (name <> '' AND length(name) >= 2),
    description VARCHAR(500),
    category VARCHAR(50) CHECK (category IS NULL OR category IN ('food', 'transport', 'entertainment', 'utilities', 'shopping', 'health', 'education', 'other')),
    merchant VARCHAR(100) CHECK (merchant IS NULL OR length(merchant) >= 2),
    receipt_url VARCHAR(500) CHECK (receipt_url IS NULL OR receipt_url ~ '^https?://'),
    date TIMESTAMP DEFAULT NOW() CHECK (date <= NOW()),
    created_at TIMESTAMP DEFAULT NOW(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL
);

-- POLICIES: Optional per-account settings for memo thresholds
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL CHECK (name <> '' AND length(name) >= 2),
    description VARCHAR(500),
    memo_threshold NUMERIC(10,2) CHECK (memo_threshold IS NULL OR memo_threshold > 0),
    memo_prompt VARCHAR(200)
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_card_budget_id ON transactions(card_budget_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_card_budgets_card_id ON card_budgets(card_id);
CREATE INDEX idx_card_budgets_budget_id ON card_budgets(budget_id);
CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_receipts_account_id ON receipts(account_id);
CREATE INDEX idx_budgets_account_id ON budgets(account_id);
CREATE INDEX idx_cards_account_id ON cards(account_id);

-- Add receipt_id to transactions (if not already present)
ALTER TABLE transactions
ADD COLUMN receipt_id UUID REFERENCES receipts(id) ON DELETE SET NULL;

-- Create a view for account summary
CREATE VIEW account_summary AS
SELECT 
    a.id,
    a.first_name,
    a.last_name,
    a.email,
    a.organization_legal_name,
    COUNT(DISTINCT c.id) as total_cards,
    COUNT(DISTINCT b.id) as total_budgets,
    COUNT(DISTINCT t.id) as total_transactions,
    COALESCE(SUM(t.amount), 0) as total_spent
FROM accounts a
LEFT JOIN cards c ON a.id = c.account_id
LEFT JOIN budgets b ON a.id = b.account_id
LEFT JOIN card_budgets cb ON c.id = cb.card_id
LEFT JOIN transactions t ON cb.id = t.card_budget_id
GROUP BY a.id, a.first_name, a.last_name, a.email, a.organization_legal_name;

-- Create a function to validate card status changes
CREATE OR REPLACE FUNCTION validate_card_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent changing status to 'cancelled' if card has active transactions in the last 30 days
    IF NEW.status = 'cancelled' THEN
        IF EXISTS (
            SELECT 1 FROM transactions t
            JOIN card_budgets cb ON t.card_budget_id = cb.id
            WHERE cb.card_id = NEW.id 
            AND t.date >= NOW() - INTERVAL '30 days'
        ) THEN
            RAISE EXCEPTION 'Cannot cancel card with recent transactions';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for card status validation
CREATE TRIGGER card_status_validation
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION validate_card_status_change();

-- Create a function to check budget limits
CREATE OR REPLACE FUNCTION check_budget_limit()
RETURNS TRIGGER AS $$
DECLARE
    budget_limit NUMERIC(10,2);
    current_spent NUMERIC(10,2);
BEGIN
    -- Get budget limit
    SELECT b.limit_amount INTO budget_limit
    FROM budgets b
    JOIN card_budgets cb ON b.id = cb.budget_id
    WHERE cb.id = NEW.card_budget_id;
    
    -- Get current spent amount for this budget
    SELECT COALESCE(SUM(t.amount), 0) INTO current_spent
    FROM transactions t
    JOIN card_budgets cb ON t.card_budget_id = cb.id
    WHERE cb.budget_id = (SELECT budget_id FROM card_budgets WHERE id = NEW.card_budget_id)
    AND t.id != NEW.id; -- Exclude the current transaction
    
    -- Check if new transaction would exceed budget
    IF (current_spent + NEW.amount) > budget_limit THEN
        RAISE EXCEPTION 'Transaction would exceed budget limit of %', budget_limit;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget limit validation (NOT WORKING, CURRENTLY NOT ACTIVE ON SUPABASE)
CREATE TRIGGER budget_limit_validation
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION check_budget_limit();
```

IMPROVEMENTS TO CONSIDER 

* differentiate admin/viewer accounts and specify access levels
* user definded balance durations
* Langchain libraries to start AI functionality
* AI automitically fill transactions for you
* AI automaticaly suggests receipts when adding transactions
* Profiling on Dashboard to increase perfomance
    --> maybe REDUX to manage state will increase perfoamce, 
        avoid reliance on API reads and writes

- Multiple transaction import from csv
    --> pdf, image AI to parse transactions from statement

* Change UI and remove onboarding features

* notification and verification service

* security research to learn how to storely save credit card infomation