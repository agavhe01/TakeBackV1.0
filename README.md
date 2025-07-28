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

## Database Schema (Supabase)

### Authentication Tables (Managed by Supabase Auth)
- `auth.users` - User authentication data

### Public Tables
```sql
-- Accounts table to store user profile information
CREATE TABLE public.accounts (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    nonprofit_name TEXT NOT NULL,
    ein TEXT NOT NULL,
    email_updates BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own account" ON public.accounts
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own account" ON public.accounts
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own account" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = id);
```

## Features

- **User Authentication**: Signup and login with Supabase Auth
- **Profile Management**: Store user data in both auth.users and public.accounts
- **Modern UI**: Built with Tailwind CSS and Lucide React icons
- **Form Validation**: React Hook Form with comprehensive validation
- **Responsive Design**: Mobile-first approach
- **JWT Tokens**: Secure authentication with JWT tokens

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
   python main.py
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

## Environment Variables

### Backend (.env)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `JWT_SECRET`: Secret key for JWT token generation

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., http://localhost:8000)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile (requires authentication)

## Pages

- `/` - Signup page (default route)
- `/onboarding` - Onboarding page (after successful signup)

## Components

- `SignupPage` - Main signup page layout
- `SignupForm` - Signup form with validation
- `FeatureCard` - Feature showcase on signup page
- `OnboardingPage` - Onboarding page
- `FormInput` - Reusable form input component
- `FormButton` - Reusable button component with loading state

## Authentication Flow

1. User fills out signup form
2. Frontend sends data to backend `/api/auth/signup` endpoint
3. Backend creates user in Supabase Auth
4. Backend inserts user data into `public.accounts` table
5. Backend returns JWT token
6. Frontend stores token and redirects to onboarding page

## Development

### Backend Development
- FastAPI with automatic API documentation at `http://localhost:8000/docs`
- CORS enabled for frontend communication
- JWT token-based authentication
- Supabase integration for database and auth

### Frontend Development
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React Hook Form for form management
- Lucide React for icons

## Deployment

### Backend Deployment
- Can be deployed to any Python hosting service (Railway, Heroku, etc.)
- Set environment variables in production
- Use production Supabase credentials

### Frontend Deployment
- Can be deployed to Vercel, Netlify, or any static hosting
- Set environment variables in deployment platform
- Update API URL to production backend URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.


SQL:-- Enable UUID generation (required for gen_random_uuid)
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


select * from accounts;