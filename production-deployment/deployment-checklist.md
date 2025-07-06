# Production Deployment Checklist

## 🎯 Overview
Complete production deployment guide for your content management application.

**Development Environment:** `https://uejgjytmqpcilwfrlpai.supabase.co`  
**Production Environment:** `https://agbcslwigqthrlxnqbmc.supabase.co`

---

## ✅ Phase 1: Database Setup (MANUAL - USER REQUIRED)

### 1.1 Database Schema Creation
**Status:** ⏳ **Requires User Action**

**Action Required:**
1. Go to [Production SQL Editor](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/sql/new)
2. Copy and run: `production-deployment/database-schema-export.sql`
3. Verify no errors in execution

**Expected Result:** All tables, enums, and initial data created

### 1.2 RLS Policies Setup  
**Status:** ⏳ **Requires User Action**

**Action Required:**
1. Go to [Production SQL Editor](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/sql/new)
2. Copy and run: `production-deployment/database-rls-policies.sql`  
3. Verify all policies are created

**Expected Result:** Row Level Security policies active on all tables

### 1.3 Database Functions Setup
**Status:** ⏳ **Requires User Action**

**Action Required:**
1. Go to [Production SQL Editor](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/sql/new)
2. Copy and run: `production-deployment/database-functions.sql`
3. Verify all functions and triggers are created

**Expected Result:** Security functions, triggers, and utilities active

### 1.4 Storage Buckets Setup
**Status:** ⏳ **Requires User Action**

**Action Required:**
1. Go to [Production SQL Editor](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/sql/new)
2. Copy and run: `production-deployment/storage-setup.sql`
3. Verify buckets created in [Storage Dashboard](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/storage/buckets)

**Expected Result:** 
- ✅ `knowledge-base-files` (public)
- ✅ `content-files` (private)  
- ✅ `content-derivatives` (public)

---

## ✅ Phase 2: Secrets Configuration (MANUAL - USER REQUIRED)

### 2.1 Edge Function Secrets
**Status:** ⏳ **Requires User Action**

**Action Required:**
1. Go to [Edge Function Secrets](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/settings/functions)
2. Add the following secrets:

| Secret Name | Value | Status |
|-------------|-------|---------|
| `SUPABASE_URL` | `https://agbcslwigqthrlxnqbmc.supabase.co` | ⏳ |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ⏳ | 
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ⏳ |
| `SUPABASE_DB_URL` | `postgresql://postgres:[password]@db.agbcslwigqthrlxnqbmc.supabase.co:5432/postgres` | ⏳ |
| `WORDPRESS_BASE_URL` | *Copy from dev environment* | ⏳ |
| `WORDPRESS_USERNAME` | *Copy from dev environment* | ⏳ |
| `WORDPRESS_APP_PASSWORD` | *Copy from dev environment* | ⏳ |
| `WORDPRESS_AUTHOR_EMAIL` | *Copy from dev environment* | ⏳ |

**Note:** You can copy WordPress secrets from your [development environment](https://supabase.com/dashboard/project/uejgjytmqpcilwfrlpai/settings/functions)

---

## ✅ Phase 3: Edge Functions Deployment (AUTOMATIC)

### 3.1 Function Deployment
**Status:** 🤖 **Handled by Lovable** 

**Functions to Deploy:**
- ✅ `health-check` - System monitoring
- ✅ `process-content` - Content processing  
- ✅ `process-idea-callback` - AI idea callbacks
- ✅ `wordpress-publish` - WordPress publishing
- ✅ `create-notification` - Notification management
- ✅ `notification-monitor` - Notification monitoring

**Automatic Process:** Lovable will deploy these when you push to GitHub or make changes.

---

## ✅ Phase 4: Authentication Setup (MANUAL - USER REQUIRED)

### 4.1 OAuth Configuration
**Status:** ⏳ **Requires User Action**

**Action Required:**
1. Go to [Auth Providers](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/auth/providers)
2. Configure Google OAuth with production redirect URLs
3. Update allowed redirect URLs for your production domain

**Expected URLs:**
- Site URL: `https://your-production-domain.com`
- Redirect URLs: `https://your-production-domain.com/auth/callback`

---

## ✅ Phase 5: Application Deployment (AUTOMATIC)

### 5.1 Environment Detection  
**Status:** ✅ **Configured**

The application automatically detects production vs development:
- **Development:** `localhost` domains → Dev Supabase
- **Production:** All other domains → Production Supabase

### 5.2 Code Deployment
**Status:** 🤖 **Handled by Lovable**

When you publish your app, it will automatically use the production configuration.

---

## ✅ Phase 6: Verification & Testing (USER TESTING)

### 6.1 Health Check Verification
**Action Required:**
```bash
curl https://agbcslwigqthrlxnqbmc.supabase.co/functions/v1/health-check
```

**Expected Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": true,
    "auth": true, 
    "storage": true,
    "wordpress": true
  }
}
```

### 6.2 Application Testing
**Test Checklist:**
- [ ] User registration/login works
- [ ] Content creation functions
- [ ] File uploads work
- [ ] WordPress publishing works
- [ ] Admin features accessible
- [ ] All pages load correctly

---

## ✅ Phase 7: Final Configuration (OPTIONAL)

### 7.1 Custom Domain Setup
**Status:** ⏳ **Optional**

If you want a custom domain:
1. Configure domain in Lovable project settings
2. Update OAuth redirect URLs
3. Update any hardcoded references

### 7.2 Monitoring Setup
**Status:** ✅ **Built-in**

Production monitoring is built into the application:
- Health checks run automatically
- Error logging is active
- Performance monitoring enabled

---

## 🚀 Deployment Summary

| Phase | Status | Who Does It |
|-------|--------|-------------|
| 1. Database Setup | ⏳ **You** | Run 4 SQL scripts in Supabase |
| 2. Secrets Config | ⏳ **You** | Add 8 secrets in dashboard |
| 3. Functions Deploy | 🤖 **Automatic** | Lovable handles this |
| 4. OAuth Setup | ⏳ **You** | Configure in Supabase dashboard |
| 5. App Deploy | 🤖 **Automatic** | Lovable handles this |
| 6. Testing | ⏳ **You** | Test all functionality |
| 7. Final Config | ⏳ **Optional** | Custom domain, etc. |

---

## 🆘 Getting Help

### Quick Links:
- [Production Project Dashboard](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc)
- [Production SQL Editor](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/sql/new)
- [Edge Function Secrets](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/settings/functions)
- [Auth Configuration](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/auth/providers)

### Troubleshooting:
1. **Database errors:** Check SQL execution in Supabase logs
2. **Function errors:** Check [function logs](https://supabase.com/dashboard/project/agbcslwigqthrlxnqbmc/functions)
3. **Auth issues:** Verify OAuth configuration and redirect URLs
4. **App errors:** Use health check endpoint to diagnose

---

## 🎉 Next Steps

Once deployment is complete:
1. ✅ Clean production database with no dev data
2. ✅ Secure configuration with proper secrets
3. ✅ Automatic environment detection
4. ✅ Full functionality in production
5. ✅ Built-in monitoring and health checks

**Ready to start? Begin with Phase 1: Database Setup!**