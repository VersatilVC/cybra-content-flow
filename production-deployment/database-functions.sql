-- ===================================================================
-- PRODUCTION DATABASE FUNCTIONS - MAIN ORCHESTRATOR
-- Version: 2.0.0-security-hardened  
-- Date: 2025-07-09
-- Target: Clean Production Environment
-- ===================================================================

-- Note: Run this AFTER running database-rls-policies.sql
-- This will create all database functions, triggers, and utilities

-- Import all function definitions
\i production-deployment/database-auth-functions.sql
\i production-deployment/database-user-management.sql
\i production-deployment/database-utility-functions.sql
\i production-deployment/database-vector-functions.sql
\i production-deployment/database-triggers.sql

-- ===================================================================
-- DATABASE FUNCTIONS SETUP COMPLETE
-- ===================================================================
--
-- Next step: Run storage-setup.sql to create storage buckets
-- ===================================================================