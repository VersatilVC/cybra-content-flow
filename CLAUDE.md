# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with HMR (Vite)
- `npm run build` - Build for production
- `npm run build:dev` - Build with development mode settings
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

### Installation
- `npm i` - Install all dependencies

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for React
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Google OAuth via Supabase Auth
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router v6 with lazy loading
- **File Storage**: Supabase Storage with RLS policies

### Application Structure

#### Main Entry Points
- `src/main.tsx` - Application bootstrap
- `src/App.tsx` - Root component with routing and providers
- `src/pages/` - Main page components (lazy-loaded)
- `src/components/` - Reusable UI components

#### Key Architectural Patterns

**Authentication Flow:**
- Uses `OptimizedAuthContext` for performance-optimized auth state
- Google OAuth through Supabase with session management
- Protected routes with role-based access (admin-only routes exist)
- Session recovery and validation built-in

**Data Layer:**
- Supabase client in `src/integrations/supabase/client.ts`
- API services in `src/services/` for business logic
- Type definitions in `src/types/` for TypeScript safety
- Row Level Security policies enforce data isolation

**UI Architecture:**
- Consistent component structure with shadcn/ui base components
- Performance optimizations with lazy loading and memory management
- Error boundaries and loading states throughout
- Responsive design with Tailwind CSS

### Core Application Domains

#### Content Management System
- **Content Ideas**: AI-generated content suggestions and review workflow
- **Content Briefs**: Detailed content specifications and requirements
- **Content Items**: Final content pieces with derivatives (social posts, ads, etc.)
- **General Content**: Flexible content creation with multiple content types

#### Publishing & Integration
- **WordPress Integration**: Secure publishing through edge functions
- **PR Management**: Press release and journalist management
- **Webhook System**: Automated notifications and integrations

#### Admin & Management
- **User Management**: Admin-only user administration
- **Feedback System**: User feedback collection and management
- **Notification System**: Real-time notifications with Supabase realtime

### Security Architecture

**Production-Ready Security:**
- All credentials stored in environment variables/Supabase secrets
- No hardcoded URLs - centralized configuration in `src/config/environment.ts`
- WordPress API calls through secure edge functions only
- Comprehensive security testing in `src/utils/securityTests.ts`
- Row Level Security policies on all database tables

**Authentication Security:**
- Dynamic OAuth redirect URLs (no hardcoded values)
- Secure session management with automatic token refresh
- Account linking for multiple auth providers
- Protected route system with admin role checks

### Performance Optimizations
- Lazy-loaded routes and components
- Query cache optimization with TanStack Query
- Memory management hooks and optimization
- Progressive image loading
- Virtualized lists for large datasets

### Database Schema
- Supabase migrations in `supabase/migrations/`
- Edge functions in `supabase/functions/` for secure server-side operations
- Storage buckets for file management with proper RLS policies

## Working with This Codebase

### Component Conventions
- Use shadcn/ui base components from `src/components/ui/`
- Follow existing component patterns in domain-specific folders
- Implement proper loading states and error boundaries
- Use TypeScript strictly - types defined in `src/types/`

### State Management
- Use TanStack Query for server state
- Custom hooks in `src/hooks/` for business logic
- Context providers for global state (auth, performance monitoring)

### API Integration
- All external APIs through Supabase edge functions
- Service files in `src/services/` abstract API calls
- Type-safe database operations with generated types

### Security Best Practices
- Never hardcode credentials or URLs
- Use centralized configuration from `src/config/environment.ts`
- All sensitive operations through authenticated edge functions
- Test security with utilities in `src/utils/securityValidation.ts`

### Deployment
- Production deployment checklist in `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- Security validation report in `SECURITY_VALIDATION_REPORT.md`
- Comprehensive monitoring and backup procedures implemented

## Important Files & Directories

### Configuration
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration with path aliases

### Core Directories
- `src/components/` - UI components organized by domain
- `src/pages/` - Main application pages
- `src/services/` - API service layers
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions and helpers
- `src/contexts/` - React context providers
- `supabase/` - Database schema and edge functions

The application is production-ready with enterprise-grade security, comprehensive monitoring, and robust error handling throughout.