-- Script to remove all sample/test data from the database
-- This will clear out hardcoded sample data so only real user submissions remain

-- Remove sample lament fragments entries
DELETE FROM lament_fragments_entries 
WHERE author_name IN ('Silver AI Collective', 'Neural Archivist', 'Silver Security Protocol');

-- Remove sample lament submissions (ones without real user IDs or with test content)
DELETE FROM lament_submissions 
WHERE content LIKE '%Ever since I got my neural implant%'
   OR content LIKE '%My memory banks are showing corrupted files%'
   OR title LIKE '%Strange Dreams in the Neural Link%'
   OR title LIKE '%Data Corruption in Sector 7%';

-- Remove sample crimson confessions  
DELETE FROM crimson_confessions
WHERE content LIKE '%I saw them last night - figures in silver masks%'
   OR content LIKE '%Three hours gone. I was investigating%'
   OR title LIKE '%Witnessed in the Blood Quarter%'
   OR title LIKE '%Missing Time%';

-- Remove sample crimson ledger entries
DELETE FROM crimson_ledger_entries
WHERE author_name IN ('Detective Marlowe', 'Chief Inspector Kane')
   OR title LIKE '%Case File: The Silver Mask Murders%'
   OR title LIKE '%Evidence Log: Neural Implants%';

-- Remove any tips associated with sample data
DELETE FROM tips 
WHERE submission_type IN ('lament_submission', 'crimson_confession')
  AND submission_id NOT IN (
    SELECT id FROM lament_submissions 
    UNION 
    SELECT id FROM crimson_confessions
  );

-- Display cleanup results
SELECT 
  (SELECT COUNT(*) FROM lament_fragments_entries) as fragments_remaining,
  (SELECT COUNT(*) FROM lament_submissions) as lament_submissions_remaining,
  (SELECT COUNT(*) FROM crimson_confessions) as crimson_confessions_remaining,
  (SELECT COUNT(*) FROM crimson_ledger_entries) as crimson_ledger_remaining,
  (SELECT COUNT(*) FROM tips) as tips_remaining;
