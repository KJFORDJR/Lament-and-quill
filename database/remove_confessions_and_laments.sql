-- =============================================
-- REMOVE ALL CONFESSIONS AND LAMENT TABLES
-- =============================================
-- This script completely removes all confession and lament-related tables,
-- their dependencies, policies, triggers, indexes, and related data.
-- WARNING: This will permanently delete all confession and lament data!

-- Start transaction
BEGIN;

-- =============================================
-- 0. CHECK WHAT TABLES ACTUALLY EXIST
-- =============================================

-- Display what confession/lament tables currently exist
DO $$
DECLARE
    table_record RECORD;
BEGIN
    RAISE NOTICE '=== CHECKING EXISTING TABLES ===';
    
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE '%confession%' OR table_name LIKE '%lament%')
        ORDER BY table_name
    LOOP
        RAISE NOTICE 'Found table: %', table_record.table_name;
    END LOOP;
    
    RAISE NOTICE '=== END TABLE CHECK ===';
END $$;

-- =============================================
-- 1. DROP POLICIES FIRST (to avoid dependency issues)
-- =============================================

-- Drop policies for crimson_confessions (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crimson_confessions' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can create confessions" ON crimson_confessions;
        DROP POLICY IF EXISTS "Approved confessions viewable by all" ON crimson_confessions;
        RAISE NOTICE 'Dropped policies for crimson_confessions table';
    ELSE
        RAISE NOTICE 'Table crimson_confessions does not exist - skipping policies';
    END IF;
END $$;
-- Drop policies for crimson_confessions_submissions (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crimson_confessions_submissions' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own submissions" ON crimson_confessions_submissions;
        DROP POLICY IF EXISTS "Users can insert their own submissions" ON crimson_confessions_submissions;
        DROP POLICY IF EXISTS "Users can update their own pending submissions" ON crimson_confessions_submissions;
        DROP POLICY IF EXISTS "Admins can view all submissions" ON crimson_confessions_submissions;
        DROP POLICY IF EXISTS "Admins can update submission status" ON crimson_confessions_submissions;
        RAISE NOTICE 'Dropped policies for crimson_confessions_submissions table';
    ELSE
        RAISE NOTICE 'Table crimson_confessions_submissions does not exist - skipping policies';
    END IF;
END $$;

-- Drop policies for crimson_confessions_tips (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crimson_confessions_tips' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view all tips" ON crimson_confessions_tips;
        DROP POLICY IF EXISTS "Users can insert their own tips" ON crimson_confessions_tips;
        DROP POLICY IF EXISTS "Users can delete their own tips" ON crimson_confessions_tips;
        RAISE NOTICE 'Dropped policies for crimson_confessions_tips table';
    ELSE
        RAISE NOTICE 'Table crimson_confessions_tips does not exist - skipping policies';
    END IF;
END $$;

-- Drop policies for lament_submissions (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lament_submissions' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can create submissions" ON lament_submissions;
        DROP POLICY IF EXISTS "Approved submissions viewable by all" ON lament_submissions;
        DROP POLICY IF EXISTS "Users can view their own lament submissions" ON lament_submissions;
        DROP POLICY IF EXISTS "Users can create lament submissions" ON lament_submissions;
        DROP POLICY IF EXISTS "Users can update their own lament submissions" ON lament_submissions;
        DROP POLICY IF EXISTS "Admins can view all lament submissions" ON lament_submissions;
        DROP POLICY IF EXISTS "Admins can update all lament submissions" ON lament_submissions;
        DROP POLICY IF EXISTS "Admins can delete lament submissions" ON lament_submissions;
        RAISE NOTICE 'Dropped policies for lament_submissions table';
    ELSE
        RAISE NOTICE 'Table lament_submissions does not exist - skipping policies';
    END IF;
END $$;

-- =============================================
-- 2. DROP TRIGGERS (to avoid trigger dependency issues)
-- =============================================

-- Drop triggers for crimson confessions (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crimson_confessions' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_crimson_confessions_updated_at ON crimson_confessions;
        RAISE NOTICE 'Dropped triggers for crimson_confessions table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'crimson_confessions_submissions' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_crimson_confessions_submissions_updated_at ON crimson_confessions_submissions;
        RAISE NOTICE 'Dropped triggers for crimson_confessions_submissions table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lament_submissions' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_lament_submissions_updated_at ON lament_submissions;
        RAISE NOTICE 'Dropped triggers for lament_submissions table';
    END IF;
END $$;

-- =============================================
-- 3. DROP INDEXES (to avoid index dependency issues)
-- =============================================

-- Drop all confession/lament related indexes safely
DROP INDEX IF EXISTS idx_crimson_confessions_status;
DROP INDEX IF EXISTS idx_crimson_confessions_tips;
DROP INDEX IF EXISTS idx_crimson_confessions_submissions_status;
DROP INDEX IF EXISTS idx_crimson_confessions_submissions_author;
DROP INDEX IF EXISTS idx_crimson_confessions_tips_submission;
DROP INDEX IF EXISTS idx_crimson_confessions_tips_tipper;
DROP INDEX IF EXISTS idx_lament_submissions_status;
DROP INDEX IF EXISTS idx_lament_submissions_tips;
DROP INDEX IF EXISTS idx_lament_submissions_author;

-- =============================================
-- 4. REMOVE TIPS TABLE REFERENCES (clean up first)
-- =============================================

-- Delete all tips related to confessions and laments (only if tips table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tips' AND table_schema = 'public') THEN
        DELETE FROM tips WHERE submission_type IN ('crimson_confession', 'lament_submission');
        RAISE NOTICE 'Cleaned up tips table references';
    ELSE
        RAISE NOTICE 'Tips table does not exist - skipping cleanup';
    END IF;
END $$;

-- =============================================
-- 5. DROP CONFESSION/LAMENT SPECIFIC TABLES
-- =============================================

-- Drop tables only if they exist
DROP TABLE IF EXISTS crimson_confessions_tips CASCADE;
DROP TABLE IF EXISTS crimson_confessions_submissions CASCADE;
DROP TABLE IF EXISTS crimson_confessions CASCADE;
DROP TABLE IF EXISTS lament_submissions CASCADE;

-- Log what was actually dropped
DO $$
BEGIN
    RAISE NOTICE 'Attempted to drop all confession and lament tables (CASCADE used for safety)';
END $$;

-- =============================================
-- 6. CLEAN UP TIPS TABLE CONSTRAINTS
-- =============================================

-- Remove the submission_type constraint that includes confession/lament types (only if tips table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tips' AND table_schema = 'public') THEN
        -- Remove the constraint if it exists
        ALTER TABLE tips DROP CONSTRAINT IF EXISTS tips_submission_type_check;
        RAISE NOTICE 'Removed submission_type constraint from tips table';
        
        -- Note: You may want to add a new constraint here if tips table is used for other purposes
        -- Example: ALTER TABLE tips ADD CONSTRAINT tips_submission_type_check CHECK (submission_type IN ('forum_post', 'other_type'));
    ELSE
        RAISE NOTICE 'Tips table does not exist - skipping constraint cleanup';
    END IF;
END $$;

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
