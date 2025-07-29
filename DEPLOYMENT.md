# TakeBack Deployment Guide

This guide covers deploying both the frontend and backend to Vercel.

## Prerequisites

1. Vercel account
2. Supabase project with database configured
3. Environment variables set up

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
```

## Backend Deployment

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

4. **Update CORS settings:**
   - After deployment, update the `ALLOWED_ORIGINS` in `backend/app/config/settings.py`
   - Replace `"https://your-frontend-domain.vercel.app"` with your actual frontend domain

## Frontend Deployment

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

## Post-Deployment

1. **Test the API endpoints:**
   - Health check: `https://your-backend-domain.vercel.app/`
   - Debug config: `https://your-backend-domain.vercel.app/debug/config`

2. **Update frontend configuration:**
   - Replace all hardcoded localhost URLs with the new config system
   - Test all functionality

3. **Monitor logs:**
   - Check Vercel function logs for any errors
   - Monitor Supabase for database connections

## Troubleshooting

### Common Issues

1. **CORS errors:**
   - Ensure `ALLOWED_ORIGINS` includes your frontend domain
   - Check that the wildcard `"*"` is working

2. **Environment variables not loading:**
   - Verify variables are set in Vercel dashboard
   - Check that variable names match exactly

3. **Database connection issues:**
   - Verify Supabase credentials
   - Check network connectivity

4. **Build failures:**
   - Ensure all dependencies are in requirements.txt
   - Check Python version compatibility

### Debugging

1. **Backend logs:**
   ```bash
   vercel logs your-backend-project
   ```

2. **Frontend logs:**
   ```bash
   vercel logs your-frontend-project
   ```

## Security Notes

⚠️ **Important:** The current configuration allows all origins (`"*"`) for minimal security. For production:

1. Replace `"*"` with specific domains
2. Implement proper CORS policies
3. Add rate limiting
4. Use HTTPS only
5. Implement proper authentication middleware

## File Structure After Deployment

```
takeback/
├── frontend/
│   ├── config.ts          # API configuration
│   ├── vercel.json        # Frontend deployment config
│   └── .env.local         # Local environment variables
├── backend/
│   ├── vercel.json        # Backend deployment config
│   ├── deploy.py          # Deployment script
│   └── requirements.txt   # Python dependencies
└── DEPLOYMENT.md         # This guide
```

## Next Steps

1. Replace all hardcoded API calls with the new config system
2. Test all functionality in production
3. Set up monitoring and logging
4. Implement proper security measures
5. Set up CI/CD pipelines 