# Production Edge Functions Deployment Guide

## Overview
This guide covers deploying all edge functions to your production Supabase environment.

## Prerequisites
- Production Supabase project created
- Database schema, RLS policies, functions, and storage setup completed
- Supabase CLI installed locally (for manual deployment if needed)

## Edge Functions to Deploy

### 1. Health Check Function
**File:** `supabase/functions/health-check/index.ts`
**Purpose:** System health monitoring and status checks
**URL:** `https://your-prod-project.supabase.co/functions/v1/health-check`

### 2. Process Content Function  
**File:** `supabase/functions/process-content/index.ts`
**Purpose:** Content processing and AI content generation
**URL:** `https://your-prod-project.supabase.co/functions/v1/process-content`

### 3. Process Idea Callback Function
**File:** `supabase/functions/process-idea-callback/index.ts` 
**Purpose:** Handle AI-generated content idea callbacks
**URL:** `https://your-prod-project.supabase.co/functions/v1/process-idea-callback`

### 4. WordPress Publish Function
**File:** `supabase/functions/wordpress-publish/index.ts`
**Purpose:** Secure WordPress content publishing
**URL:** `https://your-prod-project.supabase.co/functions/v1/wordpress-publish`

### 5. Create Notification Function
**File:** `supabase/functions/create-notification/index.ts`
**Purpose:** System notification creation and management
**URL:** `https://your-prod-project.supabase.co/functions/v1/create-notification`

### 6. Notification Monitor Function
**File:** `supabase/functions/notification-monitor/index.ts`
**Purpose:** Monitor and track notification delivery
**URL:** `https://your-prod-project.supabase.co/functions/v1/notification-monitor`

## Automatic Deployment (Recommended)

**Lovable automatically deploys edge functions when you:**
1. Push changes to your connected GitHub repository
2. Make changes in the Lovable editor

The functions will be automatically deployed to your production Supabase project.

## Manual Deployment (If Needed)

If you need to deploy manually using Supabase CLI:

```bash
# Login to Supabase CLI
supabase login

# Link to your production project
supabase link --project-ref agbcslwigqthrlxnqbmc

# Deploy all functions
supabase functions deploy

# Or deploy individual functions
supabase functions deploy health-check
supabase functions deploy process-content
supabase functions deploy process-idea-callback
supabase functions deploy wordpress-publish
supabase functions deploy create-notification
supabase functions deploy notification-monitor
```

## Required Secrets Configuration

After deployment, configure these secrets in your production Supabase project:

### Go to: https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/settings/functions

**Required Secrets:**
- `SUPABASE_URL`: `https://agbcslwigqthrlxnqbmc.supabase.co`
- `SUPABASE_ANON_KEY`: `[your-production-anon-key]`
- `SUPABASE_SERVICE_ROLE_KEY`: `[your-production-service-role-key]`
- `SUPABASE_DB_URL`: `postgresql://postgres:[password]@db.agbcslwigqthrlxnqbmc.supabase.co:5432/postgres`
- `WORDPRESS_BASE_URL`: `[your-wordpress-site-url]`
- `WORDPRESS_USERNAME`: `[your-wordpress-username]`
- `WORDPRESS_APP_PASSWORD`: `[your-wordpress-app-password]`
- `WORDPRESS_AUTHOR_EMAIL`: `[your-wordpress-author-email]`

## Verification Steps

### 1. Test Health Check
```bash
curl https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/health-check
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-06T...",
  "version": "2.0.0-security-hardened",
  "services": {
    "database": true,
    "auth": true,
    "storage": true,
    "wordpress": true
  }
}
```

### 2. Test Function Logs
Check function logs in Supabase dashboard:
- https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/functions/health-check/logs
- https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/functions/process-content/logs
- https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/functions/wordpress-publish/logs

### 3. Test WordPress Integration
Use the application's content publishing feature to verify WordPress integration works.

## Troubleshooting

### Common Issues:

1. **Function deployment fails**
   - Check Supabase CLI is logged in correctly
   - Verify project linking: `supabase status`
   - Check function syntax and imports

2. **Secrets not accessible**
   - Verify secrets are set in production dashboard
   - Check secret names match exactly (case-sensitive)
   - Restart functions after setting secrets

3. **Database connection issues**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check database URL format
   - Ensure RLS policies allow function access

4. **WordPress publishing fails**
   - Verify WordPress credentials in secrets
   - Check WordPress site accessibility
   - Test WordPress API endpoints manually

### Getting Help:
- Check function logs in Supabase dashboard
- Use the health check endpoint for system status
- Monitor error logs and notifications in the application

## Security Notes

- All functions use CORS headers for secure cross-origin requests
- Secrets are stored securely in Supabase environment
- Database access is controlled by RLS policies
- WordPress publishing goes through secure edge function only

## Next Steps

After edge functions are deployed and verified:
1. Test all application functionality
2. Set up monitoring and alerting
3. Configure custom domain (optional)
4. Update OAuth redirect URLs for production domain
5. Perform final security audit