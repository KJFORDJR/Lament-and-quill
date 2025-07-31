-- =============================================
-- REMOVE ALL CONFESSIONS AND LAMENT TABLES
-- =============================================
-- This script completely removes all confession and lament-related tables,
-- their dependencies, policies, triggers, indexes, and related data.
-- WARNING: This will permanently delete all confession and lament data!

-- Start transaction
BEGIN;

-- =============================================
-- 1. DROP POLICIES FIRST (to avoid dependency issues)
-- =============================================

-- Drop policies for crimson_confessions
DROP POLICY IF EXISTS "Users can create confessions" ON crimson_confessions;
DROP POLICY IF EXISTS "Approved confessions viewable by all" ON crimson_confessions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON crimson_confessions_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON crimson_confessions_submissions;
DROP POLICY IF EXISTS "Users can update their own pending submissions" ON crimson_confessions_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON crimson_confessions_submissions;
DROP POLICY IF EXISTS "Admins can update submission status" ON crimson_confessions_submissions;
DROP POLICY IF EXISTS "Users can view all tips" ON crimson_confessions_tips;
DROP POLICY IF EXISTS "Users can insert their own tips" ON crimson_confessions_tips;
DROP POLICY IF EXISTS "Users can delete their own tips" ON crimson_confessions_tips;

-- Drop policies for lament_submissions
DROP POLICY IF EXISTS "Users can create submissions" ON lament_submissions;
DROP POLICY IF EXISTS "Approved submissions viewable by all" ON lament_submissions;
DROP POLICY IF EXISTS "Users can view their own lament submissions" ON lament_submissions;
DROP POLICY IF EXISTS "Users can create lament submissions" ON lament_submissions;
DROP POLICY IF EXISTS "Users can update their own lament submissions" ON lament_submissions;
DROP POLICY IF EXISTS "Admins can view all lament submissions" ON lament_submissions;
DROP POLICY IF EXISTS "Admins can update all lament submissions" ON lament_submissions;
DROP POLICY IF EXISTS "Admins can delete lament submissions" ON lament_submissions;

-- =============================================
-- 2. DROP TRIGGERS (to avoid trigger dependency issues)
-- =============================================

-- Drop triggers for crimson confessions
DROP TRIGGER IF EXISTS update_crimson_confessions_updated_at ON crimson_confessions;
DROP TRIGGER IF EXISTS update_crimson_confessions_submissions_updated_at ON crimson_confessions_submissions;

-- Drop triggers for lament submissions
DROP TRIGGER IF EXISTS update_lament_submissions_updated_at ON lament_submissions;

-- =============================================
-- 3. DROP INDEXES (to avoid index dependency issues)
-- =============================================

-- Drop confession-related indexes
DROP INDEX IF EXISTS idx_crimson_confessions_status;
DROP INDEX IF EXISTS idx_crimson_confessions_tips;
DROP INDEX IF EXISTS idx_crimson_confessions_submissions_status;
DROP INDEX IF EXISTS idx_crimson_confessions_submissions_author;
DROP INDEX IF EXISTS idx_crimson_confessions_tips_submission;
DROP INDEX IF EXISTS idx_crimson_confessions_tips_tipper;

-- Drop lament-related indexes
DROP INDEX IF EXISTS idx_lament_submissions_status;
DROP INDEX IF EXISTS idx_lament_submissions_tips;
DROP INDEX IF EXISTS idx_lament_submissions_author;

-- =============================================
-- 4. REMOVE TIPS TABLE REFERENCES (clean up first)
-- =============================================

-- Delete all tips related to confessions and laments
DELETE FROM tips WHERE submission_type IN ('crimson_confession', 'lament_submission');

-- =============================================
-- 5. DROP CONFESSION/LAMENT SPECIFIC TABLES
-- =============================================

-- Drop crimson confession tip tables first (due to foreign key constraints)
DROP TABLE IF EXISTS crimson_confessions_tips CASCADE;

-- Drop crimson confession submission tables
DROP TABLE IF EXISTS crimson_confessions_submissions CASCADE;

-- Drop main crimson confessions table
DROP TABLE IF EXISTS crimson_confessions CASCADE;

-- Drop lament submission tables
DROP TABLE IF EXISTS lament_submissions CASCADE;

-- =============================================
-- 6. CLEAN UP TIPS TABLE CONSTRAINTS
-- =============================================

-- Remove the submission_type constraint that includes confession/lament types
ALTER TABLE tips DROP CONSTRAINT IF EXISTS tips_submission_type_check;

-- Add new constraint without confession/lament types (if tips table still exists and has other uses)
-- Note: Only add this if the tips table is used for other purposes
-- ALTER TABLE tips ADD CONSTRAINT tips_submission_type_check 
-- CHECK (submission_type IN ('forum_post', 'other_type')); -- adjust as needed

-- =============================================
-- 7. REMOVE ANY RELATED FUNCTIONS
-- =============================================

-- Drop any functions related to confessions/laments
DROP FUNCTION IF EXISTS update_confession_tips() CASCADE;
DROP FUNCTION IF EXISTS update_lament_tips() CASCADE;
DROP FUNCTION IF EXISTS calculate_confession_stats() CASCADE;
DROP FUNCTION IF EXISTS calculate_lament_stats() CASCADE;

-- =============================================
-- 8. CLEAN UP PROFILE STATS (if they track confession/lament counts)
-- =============================================

-- Reset any profile columns that might track confession/lament statistics
-- (Uncomment and adjust if your profiles table has these columns)
-- UPDATE profiles SET confession_count = 0, lament_count = 0 WHERE confession_count > 0 OR lament_count > 0;

-- =============================================
-- 9. CLEAN UP SYSTEM CONFIG (if it references these features)
-- =============================================

-- Remove any system configuration related to confessions/laments
-- (Uncomment if your system_config has specific settings for these features)
-- UPDATE system_config SET confessions_enabled = false, laments_enabled = false;

-- =============================================
-- 10. VERIFICATION QUERIES
-- =============================================

-- Check that tables are gone
DO $$
DECLARE
    confession_tables INTEGER;
    lament_tables INTEGER;
BEGIN
    -- Count remaining confession tables
    SELECT COUNT(*) INTO confession_tables
    FROM information_schema.tables 
    WHERE table_name LIKE '%confession%' 
    AND table_schema = 'public';
    
    -- Count remaining lament tables  
    SELECT COUNT(*) INTO lament_tables
    FROM information_schema.tables 
    WHERE table_name LIKE '%lament%' 
    AND table_schema = 'public';
    
    -- Report results
    RAISE NOTICE 'Remaining confession tables: %', confession_tables;
    RAISE NOTICE 'Remaining lament tables: %', lament_tables;
    
    IF confession_tables = 0 AND lament_tables = 0 THEN
        RAISE NOTICE '✅ SUCCESS: All confession and lament tables have been removed!';
    ELSE
        RAISE NOTICE '⚠️  WARNING: Some tables may still exist. Check manually.';
    END IF;
END $$;

-- =============================================
-- 11. FINAL CLEANUP VERIFICATION
-- =============================================

-- List any remaining objects that might reference confessions/laments
SELECT 
    'TABLE' as object_type,
    table_name as object_name
FROM information_schema.tables 
WHERE (table_name LIKE '%confession%' OR table_name LIKE '%lament%')
AND table_schema = 'public'

UNION ALL

SELECT 
    'INDEX' as object_type,
    indexname as object_name
FROM pg_indexes 
WHERE (indexname LIKE '%confession%' OR indexname LIKE '%lament%')
AND schemaname = 'public'

UNION ALL

SELECT 
    'FUNCTION' as object_type,
    routine_name as object_name
FROM information_schema.routines 
WHERE (routine_name LIKE '%confession%' OR routine_name LIKE '%lament%')
AND routine_schema = 'public';

-- Commit transaction
COMMIT;

-- =============================================
-- SUMMARY
-- =============================================
-- This script has removed:
-- 1. crimson_confessions table and all related data
-- 2. crimson_confessions_submissions table and all related data  
-- 3. crimson_confessions_tips table and all related data
-- 4. lament_submissions table and all related data
-- 5. All related policies, triggers, indexes, and constraints
-- 6. All tip records referencing confession/lament submissions
-- 7. Any related functions
-- 
-- The following core tables remain intact:
-- ✅ profiles
-- ✅ friendships  
-- ✅ character_dossiers
-- ✅ location_dossiers
-- ✅ crimson_ledger_entries (admin journals)
-- ✅ lament_fragments_entries (admin journals)
-- ✅ forum system (categories, threads, replies)
-- ✅ merchandise system (products, orders, etc.)
-- ✅ tips table (cleaned of confession/lament references)
-- 
-- Next steps:
-- 1. Update your application code to remove confession/lament functionality
-- 2. Update admin panels to remove confession/lament management
-- 3. Update navigation and UI to remove confession/lament links
-- 4. Consider running VACUUM FULL to reclaim disk space
