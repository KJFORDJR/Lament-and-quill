-- Quick sample data for testing admin panels
-- Run this to populate with test data

-- Sample Lament Fragments (Silver Heights official content)
INSERT INTO lament_fragments_entries (title, content, author_name, category, is_published, published_at, created_at, updated_at) VALUES
(
  'Neural Network Initialization Protocol',
  'The consciousness streams are stabilizing. Citizens of Silver Heights, your digital minds are now fully integrated into the collective processing matrix. Resistance is futile; integration is evolution.',
  'Silver AI Collective',
  'Transmissions',
  true,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  'Memory Fragment 2847-X',
  'Recovered data suggests the convergence point between cities is not merely geographical but temporal. The red mist that bleeds from Crimson City appears to carry encoded information from our neural networks.',
  'Neural Archivist',
  'Data Archives',
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  'System Alert: Anomaly Detected',
  'Unauthorized data streams detected flowing from Crimson City. The biological neural patterns are interfering with our digital consciousness. Investigating correlation between human emotion and system instability.',
  'Silver Security Protocol',
  'Security Alerts',
  true,
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '4 hours'
);

-- Sample Lament Submissions (User-generated content)
INSERT INTO lament_submissions (title, content, author_id, status, created_at, updated_at) VALUES
(
  'Strange Dreams in the Neural Link',
  'Ever since I got my neural implant, I''ve been having dreams about a red city. The AI says it''s normal processing overflow, but these dreams feel too real. I see people made of blood and shadow.',
  (SELECT id FROM profiles WHERE user_role = 'user' LIMIT 1),
  'pending',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
),
(
  'Data Corruption in Sector 7',
  'My memory banks are showing corrupted files from last week. The timestamp shows they were accessed remotely, but the access logs are clean. Something is moving through our network.',
  (SELECT id FROM profiles WHERE user_role = 'user' LIMIT 1),
  'approved',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
);

-- Sample Crimson Confessions
INSERT INTO crimson_confessions (title, content, author_id, status, created_at, updated_at) VALUES
(
  'Witnessed in the Blood Quarter',
  'I saw them last night - figures in silver masks walking through the red mist. They weren''t affected by the crimson fog like the rest of us. Their eyes glowed like digital displays.',
  (SELECT id FROM profiles WHERE user_role = 'user' LIMIT 1),
  'pending',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),
(
  'Missing Time',
  'Three hours gone. I was investigating the warehouse district and next thing I know, I''m waking up in my apartment. My notes are gone, but there''s a silver disc in my pocket I''ve never seen before.',
  (SELECT id FROM profiles WHERE user_role = 'user' LIMIT 1),
  'approved',
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '8 hours'
);

-- Sample Crimson Ledger entries
INSERT INTO crimson_ledger_entries (title, content, author_name, category, is_published, published_at, created_at, updated_at) VALUES
(
  'Case File: The Silver Mask Murders',
  'Seven bodies found this week, all with silver circuits burned into their retinas. The coroner says it''s impossible - human tissue can''t conduct that much electricity without burning. Yet here we are.',
  'Detective Marlowe',
  'Case Files',
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  'Evidence Log: Neural Implants',
  'Confiscated devices from the border raids are showing signs of remote activation. Someone - or something - from Silver Heights is accessing our people''s minds. The war isn''t coming. It''s already here.',
  'Chief Inspector Kane',
  'Evidence Reports',
  true,
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
);
