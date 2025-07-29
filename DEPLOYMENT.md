# TakeBack Deployment Guide

This guide covers deploying both the frontend and backend to Vercel using the new modular structure.

## Prerequisites

1. Vercel account
2. Supabase project with database configured
3. Environment variables set up
4. Vercel CLI installed (`npm install -g vercel`)

## Project Structure

```
takeback/
├── backend/                 # FastAPI backend (modular)
│   ├── app/                # Main application package
│   │   ├── main.py         # FastAPI app initialization
│   │   ├── config/         # Configuration management
│   │   ├── models/         # Pydantic data models
│   │   ├── services/       # Business logic layer
│   │   ├── api/            # API route handlers
│   │   └── utils/          # Utility functions
│   ├── run.py              # Development entry point
│   ├── deploy.py           # Production deployment entry point
│   ├── main.py             # Legacy entry point (backward compatibility)
│   ├── vercel.json         # Vercel deployment configuration
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── vercel.json        # Frontend deployment configuration
│   └── package.json       # Node.js dependencies
└── DEPLOYMENT.md          # This guide
```

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app
```

### Backend (Vercel Environment Variables)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
PROJECT_NAME=TakeBack
VERSION=1.0.0
```

## Backend Deployment

### Automatic Deployment (Recommended)

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Update backend for deployment"
   git push origin main
   ```

2. **Vercel will automatically deploy using:**
   - Entry point: `deploy.py`
   - Configuration: `vercel.json`
   - Build command: `python3 deploy.py`

### Manual Deployment

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add the environment variables listed above

### Backend Entry Points

The backend has multiple entry points for different use cases:

- **Development**: `python3 run.py` (with auto-reload)
- **Production**: `python3 deploy.py` (optimized for serverless)
- **Legacy**: `python3 main.py` (backward compatibility)

## Frontend Deployment

### Automatic Deployment

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Update frontend for deployment"
   git push origin main
   ```

### Manual Deployment

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Update API URL:**
   - In `frontend/config.ts`, update the production URL:
   ```typescript
   BASE_URL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production'
       ? 'https://your-backend-domain.vercel.app'  // Update this
       : 'http://localhost:8000'),
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Set environment variables:**
   - Add `NEXT_PUBLIC_API_URL` in Vercel dashboard

## Deployment Architecture

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

## Post-Deployment Verification

### 1. Backend Health Checks

Test these endpoints after deployment:

```bash
# Health check
curl https://your-backend-domain.vercel.app/

# Debug configuration
curl https://your-backend-domain.vercel.app/debug/config

# API documentation
curl https://your-backend-domain.vercel.app/docs
```

### 2. Frontend Functionality

1. **Test all pages load correctly**
2. **Verify API calls work**
3. **Check authentication flow**
4. **Test CRUD operations**

### 3. Database Connectivity

1. **Check Supabase logs**
2. **Verify environment variables**
3. **Test database operations**

## Environment Configuration

### Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Backend Entry | `run.py` | `deploy.py` |
| Auto-reload | ✅ Enabled | ❌ Disabled |
| Debug Logging | ✅ Full | ⚠️ Minimal |
| CORS Origins | `["*"]` | Specific domains |
| Error Details | ✅ Full | ⚠️ Sanitized |

### CORS Configuration

The backend is configured with permissive CORS for development. For production:

1. **Update `backend/app/config/settings.py`:**
   ```python
   ALLOWED_ORIGINS = [
       "https://your-frontend-domain.vercel.app",
       "https://your-custom-domain.com"
   ]
   ```

2. **Remove wildcard `"*"` for security**

## Troubleshooting

### Common Issues

1. **CORS errors:**
   - Ensure `ALLOWED_ORIGINS` includes your frontend domain
   - Check that the wildcard `"*"` is working
   - Verify domain matches exactly (including protocol)

2. **Environment variables not loading:**
   - Verify variables are set in Vercel dashboard
   - Check that variable names match exactly
   - Restart deployment after adding variables

3. **Database connection issues:**
   - Verify Supabase credentials
   - Check network connectivity
   - Test connection locally first

4. **Build failures:**
   - Ensure all dependencies are in requirements.txt
   - Check Python version compatibility
   - Verify import paths in modular structure

5. **Import errors:**
   - Check that all `__init__.py` files exist
   - Verify you're running from the correct directory
   - Test imports locally first

### Debug Commands

```bash
# Test backend imports
cd backend
python3 -c "from app.main import app; print('✅ Backend imports successfully')"

# Test environment variables
python3 -c "from app.config.settings import settings; print(f'SUPABASE_URL: {settings.SUPABASE_URL}')"

# Test database connection
python3 -c "from app.config.database import supabase; print('✅ Database connected')"
```

### Logging and Monitoring

1. **Backend logs:**
   ```bash
   vercel logs your-backend-project
   ```

2. **Frontend logs:**
   ```bash
   vercel logs your-frontend-project
   ```

3. **Real-time monitoring:**
   - Use Vercel dashboard for function logs
   - Monitor Supabase for database activity
   - Set up error tracking (Sentry, etc.)

## Security Considerations

⚠️ **Important:** The current configuration allows all origins (`"*"`) for minimal security. For production:

1. **Replace `"*"` with specific domains**
2. **Implement proper CORS policies**
3. **Add rate limiting**
4. **Use HTTPS only**
5. **Implement proper authentication middleware**
6. **Add input validation**
7. **Implement proper error handling**

## Performance Optimization

### Backend
- Use connection pooling for database
- Implement caching (Redis)
- Optimize database queries
- Add compression middleware

### Frontend
- Optimize bundle size
- Implement lazy loading
- Add service worker for caching
- Use CDN for static assets

## Next Steps

1. **Replace all hardcoded API calls** with the new config system
2. **Test all functionality** in production environment
3. **Set up monitoring and logging** for production
4. **Implement proper security measures**
5. **Set up CI/CD pipelines** for automated deployment
6. **Add comprehensive testing** (unit, integration, e2e)
7. **Implement backup and recovery** procedures
8. **Set up performance monitoring** and alerting

## File Structure After Deployment

```
takeback/
├── frontend/
│   ├── config.ts          # API configuration
│   ├── vercel.json        # Frontend deployment config
│   └── .env.local         # Local environment variables
├── backend/
│   ├── app/               # Modular application structure
│   ├── vercel.json        # Backend deployment config
│   ├── deploy.py          # Production deployment script
│   ├── run.py             # Development script
│   ├── main.py            # Legacy entry point
│   └── requirements.txt   # Python dependencies
└── DEPLOYMENT.md         # This guide
``` 