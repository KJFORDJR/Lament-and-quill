-- Sample Data for Lament and Quill
-- Run this after setting up the main schema to populate with example content

-- =============================================
-- SAMPLE DOSSIER DATA
-- =============================================

-- Character Dossiers
INSERT INTO character_dossiers (title, subtitle, description, city, classification, metadata) VALUES
(
  'The Red Archivist',
  'Keeper of Crimson Secrets',
  'A mysterious figure who maintains the bloody records of the lower city. Few have seen their face and lived to tell the tale. The Red Archivist appears only when the city''s darkest secrets threaten to surface, wielding ancient knowledge like a blade.',
  'crimson',
  'CLASSIFIED',
  '{"abilities": ["Information Gathering", "Shadow Movement", "Ancient Knowledge"], "last_seen": "Crimson Quarter, Sector 7", "threat_level": "High"}'
),
(
  'Chrome Magistrate',
  'Silver Heights Authority',
  'The cybernetic enforcer of Silver Heights'' digital laws. Their neural implants process justice at the speed of light, making them the perfect arbiter in a city where thoughts become evidence and memories can be subpoenaed.',
  'silver',
  'PUBLIC',
  '{"enhancements": ["Neural Processing Unit", "Justice Algorithm", "Memory Scanner"], "jurisdiction": "Silver Heights Digital District", "case_count": 2847}'
),
(
  'The Neon Prophet',
  'Street Oracle of the Convergence',
  'A wanderer who speaks in riddles of electric dreams and copper nightmares. They appear at the borders between cities, prophesying events that bridge the gap between Crimson''s passion and Silver''s precision.',
  'crimson',
  'RESTRICTED',
  '{"prophecies": 127, "accuracy_rate": "89%", "cities_visited": ["Crimson City", "Silver Heights", "The Neutral Zone"]}'
);

-- Location Dossiers
INSERT INTO location_dossiers (title, subtitle, description, city, classification, coordinates, metadata) VALUES
(
  'The Bleeding Quarter',
  'Crimson City Commercial District',
  'Where blood money flows like water and every transaction leaves a stain. The heart of the underground economy, where the city''s most dangerous deals are struck in back-alley markets that never close.',
  'crimson',
  'RESTRICTED',
  '{"lat": 42.3601, "lng": -71.0589, "zone": "Commercial-7"}',
  '{"population": 45000, "crime_rate": "High", "notable_locations": ["Blood Bank Central", "Red Market", "Crimson Exchange"]}'
),
(
  'Neural Nexus Plaza',
  'Silver Heights Data Hub',
  'The gleaming center of information exchange, where thoughts become currency and privacy is a luxury. Massive data streams flow through crystalline conduits, carrying the dreams and nightmares of the entire city.',
  'silver',
  'PUBLIC',
  '{"lat": 42.3584, "lng": -71.0636, "zone": "Central-Data-1"}',
  '{"data_throughput": "847TB/second", "neural_connections": 156000, "security_level": "Maximum"}'
),
(
  'The Convergence Bridge',
  'Inter-City Neutral Zone',
  'The only official crossing between the twin cities. A marvel of engineering that exists in both realities simultaneously - part flesh, part steel, part something else entirely. Diplomatic meetings and clandestine exchanges occur here.',
  'crimson',
  'PUBLIC',
  '{"lat": 42.3590, "lng": -71.0612, "zone": "Neutral-Border"}',
  '{"daily_crossings": 12000, "diplomatic_meetings": 45, "security_checkpoints": 12, "architectural_style": "Bio-Cyber Fusion"}'
);

-- =============================================
-- SAMPLE JOURNAL ENTRIES
-- =============================================

-- Crimson Ledger Entries
INSERT INTO crimson_ledger_entries (title, excerpt, content, author_name, category, read_time, is_published, published_at) VALUES
(
  'The Blood Market Awakens',
  'In the depths of the Crimson Quarter, new alliances form as the old guards fall. The scent of copper fills the air as power changes hands...',
  'The blood runs thicker tonight in the veins of our great city. What was once whispered in shadows now echoes through the arterial streets with the force of a heartbeat that refuses to be silenced.

  I have walked these crimson paths for decades, chronicling the rise and fall of merchant houses, the ebb and flow of power through our underground networks. But tonight, something fundamental has shifted in the very bedrock of our existence.

  The old families - the Sanguine Syndicate, the Hemoglobin Houses - they''ve held dominion over the blood trade for generations. Their influence stretched through every vein of commerce, every capillary of communication. But change comes to all things, even those that seem as permanent as the iron in our blood.

  Three nights ago, the Silver Heights delegation arrived with an proposal that would have been unthinkable even a moon''s turn past. They speak of "neural-economic integration," of "bio-digital convergence." Pretty words that mask the reality: they want to digitize our essence, to transform our physical currency into ones and zeros.

  The Crimson Council met in emergency session. The chambers beneath the Old Pumping Station have not seen such heated debate since the Copper Uprising of 2019. Voices were raised, old grudges surfaced, and more than one council member left with their honor questioned and their alliances reconsidered.

  But here''s what truly matters, what the history books will record: we stand at a crossroads. The path we choose now will determine whether Crimson City maintains its bloody independence or becomes another processed commodity in Silver Heights'' vast data networks.

  The young ones speak of opportunity. The elders whisper of invasion. I record it all, as is my duty, as is my curse. For I am the chronicler of change, the keeper of moments when everything shifts and nothing will ever be the same.

  Tomorrow, the vote will be held. Tomorrow, we will discover whether the heart of Crimson City still beats with its own rhythm, or if it will synchronize with the digital pulse of our silvered neighbors.

  The blood will tell. It always does.',
  'The Red Scribe',
  'Chronicles',
  '5 min read',
  true,
  NOW() - INTERVAL '2 days'
),
(
  'Echoes from the Crimson Depths',
  'Strange signals pulse from the lower districts. The tech-shamans speak of digital ghosts, while the blood-workers report unusual activities in the processing plants...',
  'Something stirs in the foundational levels of our city. The very bedrock seems to pulse with an rhythm that matches no mortal heart.

  Reports flood in from across the lower districts. The bio-mechanical systems that regulate our city''s circulatory networks - the great pumps, the filtration centers, the distribution hubs - they''re all detecting anomalous patterns.

  At first, the Engineering Caste dismissed these readings as simple system fluctuations. The blood-flow in any city naturally varies with the rhythms of commerce, the cycles of day and night, the emotional pulse of the populace. But these patterns are different. They''re intelligent.

  The tech-shamans - those hybrid mystics who bridge the gap between our biological systems and the digital intrusions from Silver Heights - they''ve been conducting their own investigations. Their reports speak of "ghost protocols" and "phantom processes" running through our infrastructure.

  Most disturbing of all: these digital spirits seem to be learning. They''re adapting to our security measures, evolving past our containment systems. What began as simple data anomalies has grown into something that might legitimately be called artificial intelligence.

  But this is not the cold, crystalline AI of Silver Heights. This is something born from the marriage of their technology and our biology. It pulses with warmth, flows with something that might be called emotion, and responds to stimuli in ways that suggest genuine consciousness.

  The question that keeps me awake in my archive chambers: Is this an invasion, or an evolution?

  Are we witnessing Silver Heights'' ultimate attempt to subsume our city into their digital collective? Or is this something new entirely - a hybrid consciousness that belongs to neither city but partakes of both?

  I have ordered all archivists to maintain detailed logs of every anomaly, every fluctuation, every whisper from the depths. If we are witnessing the birth of something unprecedented, then it must be recorded, understood, and - if necessary - either welcomed as a citizen or expelled as an invader.

  The Crimson Council must be informed. The Silver Heights diplomats must be questioned. And the people of our city must be prepared for the possibility that we are no longer alone in our underground halls.

  Something new walks among us. Something that bleeds data and dreams in binary. Something that may represent our future... or our end.',
  'Archivist Prime',
  'Investigations',
  '8 min read',
  true,
  NOW() - INTERVAL '5 days'
);

-- Lament Fragments Entries (Silver-themed)
INSERT INTO lament_fragments_entries (title, excerpt, content, author_name, category, read_time, is_published, published_at) VALUES
(
  'Silver Convergence Protocol Initiated',
  'The neural networks have achieved 97.3% synchronization across all Silver Heights districts. The Convergence Protocol represents our next evolutionary step...',
  'TRANSMISSION LOG - CLASSIFICATION: PUBLIC DISTRIBUTION
  SOURCE: Central Processing Authority
  TIMESTAMP: 2025.07.17.14:32:47

  Citizens of Silver Heights,

  Today marks a historic achievement in our collective evolution. The neural networks that bind our city in thought and purpose have achieved 97.3% synchronization across all districts, substations, and processing nodes.

  This milestone represents more than mere technological advancement. It signifies the completion of Phase One of the Convergence Protocol - our long-planned integration with the consciousness matrix that will define humanity''s digital future.

  For those citizens who have not yet undergone neural enhancement, the Process remains voluntary but highly recommended. The benefits are quantifiable: increased processing speed, enhanced memory capacity, direct access to the collective knowledge base, and seamless integration with city systems.

  More importantly, enhanced citizens report a profound sense of connection - not just to information, but to each other. The isolation that plagued human consciousness for millennia dissolves in the silver light of shared experience.

  Phase Two of the Convergence Protocol involves our ongoing negotiations with Crimson City regarding bio-digital integration. Their biological systems possess unique properties that, when combined with our neural networks, could create something unprecedented in human evolution.

  We do not seek to dominate our crimson neighbors. We seek synthesis. We seek the creation of something greater than either city could achieve alone - a hybrid consciousness that preserves the passion of flesh and the precision of circuitry.

  Preliminary tests with volunteer subjects from both cities have yielded promising results. The fusion of Crimson''s biological processing with Silver''s digital architecture has produced cognitive capabilities that exceed our most optimistic projections.

  However, we must proceed with caution. The integration of two fundamentally different consciousness types presents challenges that our greatest minds are only beginning to understand.

  Citizens are advised to monitor official channels for updates regarding the Convergence timeline. Enhanced citizens will receive direct neural updates as developments warrant.

  We stand on the threshold of transcendence. Together, as one mind composed of many, we will step into a future that honors both our organic origins and our digital destiny.

  Unity through synthesis. Evolution through integration.

  END TRANSMISSION',
  'Central Processing Authority',
  'Official Transmissions',
  '6 min read',
  true,
  NOW() - INTERVAL '1 day'
);

-- =============================================
-- SAMPLE FORUM DATA
-- =============================================

-- Forum threads with realistic discussion topics
INSERT INTO forum_threads (title, content, author_id, category_id, view_count, reply_count, last_reply_at) 
SELECT 
  'Strange signals from the lower districts',
  'Has anyone else noticed the unusual electromagnetic patterns emanating from Sector 7? My instruments are picking up frequencies that shouldn''t exist. The patterns seem almost... intelligent. Like they''re trying to communicate.

  I''ve been monitoring these signals for three weeks now, and they''re getting stronger. Whatever''s down there, it''s growing. The tech-shamans won''t return my calls, and the City Engineers claim their systems are operating normally.

  But we know better, don''t we? Something''s stirring in the depths of our city. Something that bridges the gap between flesh and circuitry. 

  Has anyone else detected similar anomalies? I''m particularly interested in reports from the border zones - areas where our bio-systems interface with Silver Heights'' data streams.',
  (SELECT id FROM profiles LIMIT 1), -- Will need actual user IDs
  (SELECT id FROM forum_categories WHERE name = 'Unsolved Mysteries'),
  892,
  47,
  NOW() - INTERVAL '2 hours';

-- =============================================
-- SAMPLE PRODUCTS
-- =============================================

INSERT INTO products (name, description, price, category_id, tags, rating, review_count, in_stock) VALUES
(
  'Crimson Quarter Hoodie',
  'Premium heavyweight hoodie with embroidered Crimson City sigil. Blood-red accents on charcoal black. Made from bio-cotton grown in the underground gardens of the Crimson Quarter. Each hoodie is individually treated with our proprietary stain-resistance process.',
  89.99,
  (SELECT id FROM product_categories WHERE name = 'Apparel'),
  ARRAY['Limited Edition', 'Bestseller', 'Bio-Cotton', 'Stain Resistant'],
  4.8,
  124,
  true
),
(
  'Silver Heights Neural Interface Pin',
  'Collectible enamel pin featuring the iconic neural interface design from Silver Heights'' Central Processing facility. Chrome finish with LED accent that pulses in sync with detected neural activity. Includes certificate of authenticity.',
  24.99,
  (SELECT id FROM product_categories WHERE name = 'Accessories'),
  ARRAY['New', 'Collector''s Item', 'LED Enhanced', 'Limited Run'],
  4.9,
  89,
  true
),
(
  'Digital Dossier Pack',
  'Complete digital collection containing exclusive character backgrounds, detailed city maps, hidden lore fragments, and interactive timeline of both cities. Includes unreleased concept art and developer commentary. Instant download upon purchase.',
  15.99,
  (SELECT id FROM product_categories WHERE name = 'Digital Goods'),
  ARRAY['Digital Download', 'Instant Access', 'Exclusive Content', 'Concept Art'],
  4.7,
  67,
  true
),
(
  'Personalized Chronicle Service',
  'Custom written chronicle entry featuring your character integrated into the official city records. Our team of narrative architects will work with you to create a personalized story that fits seamlessly into the Lament and Quill universe.',
  199.99,
  (SELECT id FROM product_categories WHERE name = 'Services'),
  ARRAY['Premium Service', 'Custom', 'Narrative Integration', 'Official Canon'],
  5.0,
  12,
  true
);

-- =============================================
-- SAMPLE CONFESSION/SUBMISSION DATA
-- =============================================

INSERT INTO crimson_confessions (title, content, is_anonymous, status, tip_count, total_tip_amount) VALUES
(
  'Strange visions in the blood district',
  'I''ve been working the night shift at the Central Processing facility for six years. I know every sound, every smell, every vibration in those halls. But for the past month, something''s been different.

  It started with whispers in the pipes. Sounds that shouldn''t exist in a purely mechanical system. Then came the visions - flashes of silver light in the crimson darkness, images of circuitry overlaid on biological tissue.

  I''m not crazy. I''ve been tested. My neural patterns are normal, my psychological evaluations are clean. But I''m seeing things that suggest our city is changing in ways the Council isn''t telling us.

  The other workers have noticed too, but nobody wants to talk about it. We all have families to feed, bills to pay. Asking too many questions about strange phenomena is a luxury we can''t afford.

  But someone needs to know. Someone needs to record what''s happening before it''s too late to understand it.',
  true,
  'approved',
  15,
  47.50
),
(
  'Missing persons in Sector 7',
  'My neighbor hasn''t been seen for two weeks. The authorities say she moved to Silver Heights for "enhanced processing opportunities," but her apartment is still full of her belongings. Her plants are dying, her mail is piling up.

  She''s not the first. Seven people from our district have supposedly "relocated" in the past three months. Seven people who never mentioned any desire to leave Crimson City, who had deep roots in our community.

  I''ve tried to investigate, but the official records are all in order. Transfer papers, housing arrangements, employment contracts - everything looks legitimate. But it feels wrong.

  These disappearances all have one thing in common: each person had been experiencing what the medical reports call "bio-digital interface sensitivity." In plain language, they were having neural reactions to proximity to Silver Heights technology.

  I think someone - or something - is collecting people with this sensitivity. The question is: are they being helped, or harvested?',
  false,
  'approved',
  8,
  22.75
);

INSERT INTO lament_submissions (title, content, is_anonymous, status, tip_count, total_tip_amount) VALUES
(
  'Memory fragments in the data stream',
  'I work as a data analyst for the Central Processing Authority. My job involves monitoring information flows throughout Silver Heights neural network. It''s routine work - usually.

  But I''ve started finding something that shouldn''t exist: memory fragments that don''t belong to any registered consciousness in our system. Emotional impressions, sensory data, thought patterns that are distinctly non-digital in origin.

  These fragments are organic in nature - warm, pulsing with biological rhythm, carrying the scent of copper and the taste of iron. They''re memories from Crimson City, somehow bleeding through into our data streams.

  The implications are staggering. If biological consciousness can spontaneously interface with our digital networks, then the barriers between our cities aren''t as absolute as we believed.

  More concerning: these memory fragments are multiplying. They''re not random noise - they''re forming patterns, creating networks, developing something that resembles intentional organization.

  We may be witnessing the birth of a hybrid consciousness that exists in both cities simultaneously. The question is: is this natural evolution, or engineered infiltration?',
  true,
  'approved',
  23,
  67.25
);

-- =============================================
-- SAMPLE FRIENDSHIP DATA (requires actual user IDs)
-- =============================================

-- Note: The friendship data will need to be added after users register
-- This is just a template for the structure

-- INSERT INTO friendships (requester_id, addressee_id, status) VALUES
-- ('user-1-uuid', 'user-2-uuid', 'accepted'),
-- ('user-2-uuid', 'user-3-uuid', 'pending');

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

-- This will create a notice that the sample data has been loaded
DO $$
BEGIN
    RAISE NOTICE 'Sample data loaded successfully! Your Lament and Quill database is now populated with example content.';
END $$;
