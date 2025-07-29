# TakeBack V1.0

A credit management and spend management web application built with FastAPI, Next.js, Supabase, and Tailwind CSS.

## Project Structure

```
takeback/
├── backend/                 # FastAPI backend (modular structure)
│   ├── app/                # Main application package
│   │   ├── main.py         # FastAPI app initialization
│   │   ├── config/         # Configuration management
│   │   │   ├── settings.py # Environment variables & config
│   │   │   └── database.py # Supabase client setup
│   │   ├── models/         # Pydantic data models
│   │   │   ├── auth.py     # User authentication models
│   │   │   ├── budget.py   # Budget models
│   │   │   ├── card.py     # Card models
│   │   │   ├── transaction.py # Transaction models
│   │   │   ├── policy.py   # Policy models
│   │   │   └── analytics.py # Analytics models
│   │   ├── services/       # Business logic layer
│   │   │   ├── auth_service.py     # Authentication logic
│   │   │   ├── budget_service.py   # Budget business logic
│   │   │   ├── card_service.py     # Card business logic
│   │   │   ├── transaction_service.py # Transaction business logic
│   │   │   ├── policy_service.py   # Policy business logic
│   │   │   └── analytics_service.py # Analytics business logic
│   │   ├── api/            # API route handlers
│   │   │   ├── auth.py     # Authentication endpoints
│   │   │   ├── budgets.py  # Budget endpoints
│   │   │   ├── cards.py    # Card endpoints
│   │   │   ├── transactions.py # Transaction endpoints
│   │   │   ├── policies.py # Policy endpoints
│   │   │   └── analytics.py # Analytics endpoints
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   │       └── jwt.py      # JWT token utilities
│   ├── run.py              # Development server entry point
│   ├── deploy.py           # Production deployment entry point
│   ├── main.py             # Legacy entry point (redirects to run.py)
│   ├── requirements.txt    # Python dependencies
│   ├── vercel.json         # Vercel deployment configuration
│   └── env.example         # Environment variables template
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── package.json       # Node.js dependencies
│   ├── vercel.json        # Vercel deployment configuration
│   └── env.local          # Frontend environment variables
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
   python3 main.py
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

## Deployment

### Backend Deployment (Vercel)

The backend is configured for serverless deployment on Vercel:

1. **Automatic Deployment:**
   - Push to your main branch triggers automatic deployment
   - Vercel uses `deploy.py` as the entry point for production
   - Configuration is in `backend/vercel.json`

2. **Manual Deployment:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy from backend directory
   cd backend
   vercel --prod
   ```

3. **Environment Variables:**
   - Set all required environment variables in Vercel dashboard
   - Use the same variables as in your `.env` file
   - Required variables: `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`

### Frontend Deployment (Vercel)

The frontend is also configured for Vercel deployment:

1. **Automatic Deployment:**
   - Push to main branch triggers automatic deployment
   - Configuration is in `frontend/vercel.json`

2. **Manual Deployment:**
   ```bash
   # Deploy from frontend directory
   cd frontend
   vercel --prod
   ```

3. **Environment Variables:**
   - Set `NEXT_PUBLIC_API_URL` to your backend URL
   - Configure any other frontend-specific variables

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Vercel)      │◄──►│   (Vercel)      │
│                 │    │                 │
│  Next.js App    │    │  FastAPI App    │
│  Static Hosting │    │ Serverless Fn   │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Supabase      │
                       │   (Database)    │
                       │   PostgreSQL    │
                       └─────────────────┘
```

### Environment Configuration

#### Backend Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Application Settings
PROJECT_NAME=TakeBack
VERSION=1.0.0
```

#### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
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

### Balance Calculations
- `GET /api/balances` - Get comprehensive balance information for all cards and budgets
- `GET /api/cards/{card_id}/balance` - Get detailed balance information for a specific card
- `GET /api/budgets/{budget_id}/balance` - Get detailed balance information for a specific budget

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

### Enhanced Balance Calculations
- Real-time balance calculations based on actual transaction data
- Cards display calculated spent amounts vs. total budget limits
- Expandable balance details show breakdown by individual budgets
- Budget column simplified to show single budget name or count of multiple budgets
- Balance tab shows remaining amounts with color-coded indicators (green for remaining, red for over limit)
- Support for period-based budget tracking (monthly, weekly, quarterly)
- Visual progress bars for total balance and individual budget usage
- Color-coded progress indicators (green/yellow/red based on usage percentage)
- Real-time balance fetching in card modals with detailed breakdown

### Interactive Dashboard
- Personalized welcome message with user's first name
- Quick action buttons for "Manage Payments" and "Issue Card"
- Account balances section with visual progress bars for each card
- Clickable card balances that open detailed pie chart modals
- Interactive pie charts showing budget breakdown with percentages
- Cards summary section with count of active cards
- Navigation to cards page with visual indicators
- Real-time data fetching from balance calculation APIs

### Personal Settings Management
- Comprehensive user profile management modal
- Editable fields: phone, address, ZIP code, SSN
- Read-only fields: first name, last name, date of birth, email, organization legal name, organization EIN number, account ID, created date
- Real-time profile updates via API integration
- Form validation and success feedback
- Secure SSN input with password field type
- Visual icons for different field types
- Responsive design with proper form layout
