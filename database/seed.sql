USE CCMS;

-- ================================================
-- CCMS Seed Data — wipe existing + insert 20+ rows
-- ================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Notification;
TRUNCATE TABLE CaseActivity;
TRUNCATE TABLE Evidence;
TRUNCATE TABLE CrimeVictim;
TRUNCATE TABLE CaseFile;
TRUNCATE TABLE Victim;
TRUNCATE TABLE Crime;
TRUNCATE TABLE Location;
TRUNCATE TABLE Officer;
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- 1. OFFICERS (21 entries)
--    Admin  password : 123456
--    Others password : password123
-- ================================================
-- bcrypt hash for '123456'      : $2b$10$n.Fc.ULCV4/gI.Xq3XbkMeIjJqLKqk/5BtjRFLezYHH5.IiWyxIa
-- bcrypt hash for 'password123' : $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
INSERT INTO Officer (name, email, password_hash, role) VALUES
('Admin User',        'admin@ccms.gov',       '$2b$10$n.Fc.ULCV4/gI.Xq3XbkMeIjJqLKqk/5BtjRFLezYHH5.IiWyxIa', 'ADMIN'),
('Ravi Kumar',        'ravi.kumar@ccms.gov',  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Anita Sharma',      'anita.s@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'INVESTIGATOR'),
('Deepak Verma',      'deepak.v@ccms.gov',    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Priya Nair',        'priya.n@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'INVESTIGATOR'),
('Suresh Reddy',      'suresh.r@ccms.gov',    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Kavitha Menon',     'kavitha.m@ccms.gov',   '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Amit Singh',        'amit.s@ccms.gov',      '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Neha Gupta',        'neha.g@ccms.gov',      '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'INVESTIGATOR'),
('Vijay Patel',       'vijay.p@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Sunita Rao',        'sunita.r@ccms.gov',    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Manoj Tiwari',      'manoj.t@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Rekha Joshi',       'rekha.j@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'INVESTIGATOR'),
('Arjun Mehta',       'arjun.m@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Lakshmi Pillai',    'lakshmi.p@ccms.gov',   '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Ramesh Chandra',    'ramesh.c@ccms.gov',    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Geeta Bose',        'geeta.b@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'INVESTIGATOR'),
('Sanjay Dubey',      'sanjay.d@ccms.gov',    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Meena Krishnan',    'meena.k@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Harish Bansal',     'harish.b@ccms.gov',    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'OFFICER'),
('Pooja Agarwal',     'pooja.a@ccms.gov',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'INVESTIGATOR');

-- ================================================
-- 2. LOCATIONS (22 entries)
-- ================================================
INSERT INTO Location (area_name, latitude, longitude) VALUES
('Connaught Place, Delhi',       28.6329,  77.2195),
('Chandni Chowk, Delhi',         28.6506,  77.2304),
('Karol Bagh, Delhi',            28.6514,  77.1907),
('Saket, Delhi',                 28.5244,  77.2066),
('Dwarka, Delhi',                28.5921,  77.0460),
('Nehru Place, Delhi',           28.5490,  77.2509),
('Lajpat Nagar, Delhi',         28.5677,  77.2430),
('Greater Kailash, Delhi',       28.5482,  77.2410),
('Rohini, Delhi',                28.7360,  77.1211),
('Pitampura, Delhi',             28.7056,  77.1311),
('Janakpuri, Delhi',             28.6219,  77.0822),
('Vasant Kunj, Delhi',           28.5206,  77.1565),
('Malviya Nagar, Delhi',         28.5341,  77.2100),
('Patel Nagar, Delhi',           28.6481,  77.1670),
('Uttam Nagar, Delhi',           28.6203,  77.0574),
('Shahdara, Delhi',              28.6692,  77.2894),
('Mayur Vihar, Delhi',           28.6087,  77.2946),
('Noida Sector 18',              28.5700,  77.3218),
('Gurgaon Cyber City',           28.4950,  77.0886),
('Faridabad Sector 21',          28.3670,  77.3060),
('Sarojini Nagar, Delhi',        28.5754,  77.1934),
('Hauz Khas, Delhi',             28.5493,  77.2011);

-- ================================================
-- 3. CRIMES (22 entries)
-- ================================================
INSERT INTO Crime (crime_type, description, location_id, reported_at) VALUES
('THEFT',     'Mobile phone snatched near metro station',                   1,  '2026-01-05 09:15:00'),
('ASSAULT',   'Physical altercation outside bar on weekend night',          2,  '2026-01-07 22:30:00'),
('ROBBERY',   'Armed robbery at jewellery shop, suspect fled on bike',      3,  '2026-01-10 14:00:00'),
('FRAUD',     'Online UPI scam — victim lost ₹2.5 lakh',                   4,  '2026-01-12 10:45:00'),
('BURGLARY',  'House broken into while family was on vacation',             5,  '2026-01-15 03:20:00'),
('VANDALISM', 'Graffiti and broken windows at school premises',             6,  '2026-01-18 20:00:00'),
('ASSAULT',   'Fight between two groups outside cricket ground',            7,  '2026-01-20 18:45:00'),
('DRUG',      'Narcotics seized from vehicle at checkpoint',                8,  '2026-01-23 02:10:00'),
('THEFT',     'Car window smashed and laptop stolen at parking lot',        9,  '2026-01-25 17:30:00'),
('FRAUD',     'Fake investment scheme defrauded 15 people',                 10, '2026-01-28 11:00:00'),
('ROBBERY',   'Cashier threatened at bank ATM vestibule',                  11, '2026-02-02 20:15:00'),
('MURDER',    'Body discovered in abandoned plot, blunt force trauma',      12, '2026-02-05 06:30:00'),
('BURGLARY',  'Office computers stolen overnight from tech firm',           13, '2026-02-08 00:45:00'),
('THEFT',     'Pickpocket gang caught targeting commuters in metro',        14, '2026-02-10 08:00:00'),
('VANDALISM', 'Vehicle fire set deliberately in residential colony',        15, '2026-02-13 23:15:00'),
('DRUG',      'Significant heroin cache found in warehouse raid',           16, '2026-02-16 11:30:00'),
('ASSAULT',   'Domestic violence complaint — wife filed FIR',               17, '2026-02-18 14:00:00'),
('FRAUD',     'Impersonation of tax official to extort businesses',         18, '2026-02-20 09:00:00'),
('ROBBERY',   'Delivery rider robbed at knifepoint in parking area',       19, '2026-02-23 21:45:00'),
('THEFT',     'Bicycle stolen from school gate during assembly',            20, '2026-02-25 07:30:00'),
('BURGLARY',  'ATM machine tampered; skimming device found fitted',        21, '2026-03-01 05:00:00'),
('MURDER',    'Suspected honour killing — victim found in canal',          22, '2026-03-04 07:15:00');

-- ================================================
-- 4. VICTIMS (22 entries)
-- ================================================
INSERT INTO Victim (full_name, contact_number, address, age, gender) VALUES
('Rohan Mathur',     '9810001001', '12 Rose Avenue, Connaught Place, Delhi',    28, 'MALE'),
('Sunaina Kapoor',   '9810001002', '45 Lajpat Nagar Colony, Delhi',             34, 'FEMALE'),
('Tarun Ahluwalia',  '9810001003', '7 Rajouri Garden, Delhi',                   45, 'MALE'),
('Deepa Sood',       '9810001004', 'B-14 Model Town, Delhi',                    29, 'FEMALE'),
('Kiran Malhotra',   '9810001005', '3rd Floor, Dwarka Sector 10, Delhi',        52, 'FEMALE'),
('Mohammed Iqbal',   '9810001006', 'Old Delhi Lane 4, Chandni Chowk',           38, 'MALE'),
('Rashmi Tewari',    '9810001007', 'Flat 202 Saket Heights, Delhi',             27, 'FEMALE'),
('Pankaj Arora',     '9810001008', '22 Golf Link Road, Greater Kailash',        60, 'MALE'),
('Seema Devi',       '9810001009', 'Village Narela, North Delhi',               43, 'FEMALE'),
('Nikhil Saxena',    '9810001010', '5 Kailash Hills, East Delhi',               31, 'MALE'),
('Radha Krishnan',   '9810001011', 'A-Block Rohini Sector 11, Delhi',           55, 'FEMALE'),
('Ajay Bhardwaj',    '9810001012', '18 Pitampura Main Road, Delhi',             40, 'MALE'),
('Jaspreet Kaur',    '9810001013', 'E-219 Janakpuri, West Delhi',               24, 'FEMALE'),
('Firoz Khan',       '9810001014', 'Okhla Phase II, South Delhi',               36, 'MALE'),
('Vandana Saini',    '9810001015', 'Noida Sector 62, UP',                       32, 'FEMALE'),
('Arun Thakur',      '9810001016', 'DLF Phase 3, Gurgaon',                      48, 'MALE'),
('Uma Shankar',      '9810001017', 'Shahdara Extension, East Delhi',             65, 'MALE'),
('Pallavi Dubey',    '9810001018', 'Vasant Enclave, South-West Delhi',          29, 'FEMALE'),
('Rajan Chopra',     '9810001019', 'Mayur Vihar Phase 1, East Delhi',           41, 'MALE'),
('Asha Rani',        '9810001020', 'Uttam Nagar West, Delhi',                   37, 'FEMALE'),
('Dev Narayan',      '9810001021', 'Sarojini Nagar Market, Delhi',              50, 'MALE'),
('Gita Sharma',      '9810001022', 'Hauz Khas Village, South Delhi',            26, 'FEMALE');

-- ================================================
-- 5. CASE FILES (22 entries)
-- ================================================
INSERT INTO CaseFile (case_number, crime_id, title, assigned_officer_id, status, priority, station_id, created_by_officer_id) VALUES
('CASE-2026-001', 1,  'Metro Phone Snatch',             2,  'CLOSED',      'MEDIUM', 101, 1),
('CASE-2026-002', 2,  'Bar Fight Assault',              4,  'CLOSED',      'LOW',    102, 1),
('CASE-2026-003', 3,  'Jewellery Shop Robbery',         6,  'IN_PROGRESS', 'HIGH',   101, 2),
('CASE-2026-004', 4,  'UPI Fraud Investigation',        8,  'OPEN',        'MEDIUM', 103, 1),
('CASE-2026-005', 5,  'Dwarka Burglary',                10, 'IN_PROGRESS', 'MEDIUM', 104, 2),
('CASE-2026-006', 6,  'School Vandalism',               12, 'CLOSED',      'LOW',    102, 4),
('CASE-2026-007', 7,  'Cricket Ground Brawl',           14, 'CLOSED',      'LOW',    105, 1),
('CASE-2026-008', 8,  'Narcotics Checkpoint Seizure',   2,  'IN_PROGRESS', 'HIGH',   106, 1),
('CASE-2026-009', 9,  'Parking Lot Theft',              4,  'CLOSED',      'MEDIUM', 103, 2),
('CASE-2026-010', 10, 'Fake Investment Scheme',         6,  'IN_PROGRESS', 'HIGH',   107, 1),
('CASE-2026-011', 11, 'ATM Robbery Threat',             8,  'OPEN',        'HIGH',   108, 4),
('CASE-2026-012', 12, 'Abandoned Plot Murder',          3,  'IN_PROGRESS', 'HIGH',   109, 1),
('CASE-2026-013', 13, 'Tech Firm Office Burglary',      5,  'CLOSED',      'MEDIUM', 103, 2),
('CASE-2026-014', 14, 'Metro Pickpocket Gang',          7,  'IN_PROGRESS', 'MEDIUM', 110, 1),
('CASE-2026-015', 15, 'Arson Vehicle Fire',             9,  'OPEN',        'HIGH',   111, 4),
('CASE-2026-016', 16, 'Warehouse Heroin Raid',          11, 'IN_PROGRESS', 'HIGH',   106, 1),
('CASE-2026-017', 17, 'Domestic Violence — Mayur Vihar',13, 'CLOSED',      'MEDIUM', 112, 2),
('CASE-2026-018', 18, 'Tax Official Impersonation',    15, 'OPEN',        'MEDIUM', 107, 1),
('CASE-2026-019', 19, 'Delivery Rider Robbery',        17, 'OPEN',        'HIGH',   113, 4),
('CASE-2026-020', 20, 'School Bicycle Theft',           19, 'CLOSED',      'LOW',    114, 1),
('CASE-2026-021', 21, 'ATM Skimmer Device',             2,  'IN_PROGRESS', 'HIGH',   108, 2),
('CASE-2026-022', 22, 'Canal Honour Killing',           3,  'IN_PROGRESS', 'HIGH',   109, 1);

-- ================================================
-- 6. CRIME-VICTIM RELATIONS (22 entries)
-- ================================================
INSERT INTO CrimeVictim (crime_id, victim_id) VALUES
(1,  1),  (2,  2),  (3,  3),  (4,  4),  (5,  5),
(6,  6),  (7,  7),  (8,  8),  (9,  9),  (10, 10),
(11, 11), (12, 12), (13, 13), (14, 14), (15, 15),
(16, 16), (17, 17), (18, 18), (19, 19), (20, 20),
(21, 21), (22, 22);

-- ================================================
-- 7. EVIDENCE (22 entries)
-- ================================================
INSERT INTO Evidence (case_id, evidence_type, description, file_name, file_path, mime_type, file_size, uploaded_by_officer_id, status, created_at) VALUES
(1,  'IMAGE',    'CCTV screenshot of suspect near metro gate',      'cctv_001.jpg',   'uploads/cctv_001.jpg',   'image/jpeg', 524288,  2,  'VERIFIED',    '2026-01-06 10:00:00'),
(2,  'VIDEO',    'Bar brawl footage from security camera',          'bar_fight.mp4',  'uploads/bar_fight.mp4',  'video/mp4',  10485760, 4, 'VERIFIED',    '2026-01-08 09:30:00'),
(3,  'IMAGE',    'Photo of jewellery shop damage and broken glass', 'shop_dmg.jpg',   'uploads/shop_dmg.jpg',   'image/jpeg', 318000,  6,  'IN_ANALYSIS', '2026-01-11 11:00:00'),
(4,  'DOCUMENT', 'Bank transaction records PDF — UPI fraud chain',  'bank_txn.pdf',   'uploads/bank_txn.pdf',   'application/pdf', 204800, 8, 'PENDING', '2026-01-13 14:00:00'),
(5,  'IMAGE',    'Fingerprints lifted from window sill',            'fingerprints.jpg','uploads/fingerprints.jpg','image/jpeg', 142336, 10, 'IN_ANALYSIS','2026-01-16 08:00:00'),
(6,  'IMAGE',    'Graffiti photographs from all angles',            'graffiti.jpg',   'uploads/graffiti.jpg',   'image/jpeg', 453000,  12, 'VERIFIED',    '2026-01-19 13:00:00'),
(7,  'VIDEO',    'Witness mobile phone footage of cricket brawl',   'brawl_vid.mp4',  'uploads/brawl_vid.mp4',  'video/mp4',  20971520, 14,'VERIFIED',    '2026-01-21 07:45:00'),
(8,  'IMAGE',    'Photo of narcotics packaged in vehicle seat',     'narco_pkg.jpg',  'uploads/narco_pkg.jpg',  'image/jpeg', 285000,  2,  'VERIFIED',    '2026-01-24 06:00:00'),
(9,  'IMAGE',    'Parking CCTV of vehicle break-in moment',         'parking_cctv.jpg','uploads/parking_cctv.jpg','image/jpeg',619000, 4,  'VERIFIED',    '2026-01-26 10:00:00'),
(10, 'DOCUMENT', 'Fraudulent investment scheme brochure (scan)',    'scheme_brochure.pdf','uploads/scheme_brochure.pdf','application/pdf',307200,6,'IN_ANALYSIS','2026-01-29 11:00:00'),
(11, 'VIDEO',    'ATM lobby camera footage of robbery attempt',     'atm_cam.mp4',    'uploads/atm_cam.mp4',    'video/mp4',  15728640, 8, 'PENDING',     '2026-02-03 09:00:00'),
(12, 'IMAGE',    'Crime scene photos — abandoned plot',             'murder_scene.jpg','uploads/murder_scene.jpg','image/jpeg',1048576,3,  'IN_ANALYSIS', '2026-02-06 08:30:00'),
(13, 'IMAGE',    'Office door lock forcibly broken — photo',        'office_break.jpg','uploads/office_break.jpg','image/jpeg',392000,  5,  'VERIFIED',    '2026-02-09 08:00:00'),
(14, 'VIDEO',    'Metro platform CCTV — pickpocket in action',      'metro_pick.mp4', 'uploads/metro_pick.mp4', 'video/mp4',  31457280, 7, 'IN_ANALYSIS', '2026-02-11 12:00:00'),
(15, 'IMAGE',    'Burned vehicle exterior photographs',             'arson_car.jpg',  'uploads/arson_car.jpg',  'image/jpeg', 763000,  9,  'PENDING',     '2026-02-14 07:00:00'),
(16, 'IMAGE',    'Heroin cache laid out with officer ID card scale','heroin_cache.jpg','uploads/heroin_cache.jpg','image/jpeg',512000,  11, 'VERIFIED',    '2026-02-17 10:00:00'),
(17, 'DOCUMENT', 'Medical examination report — domestic assault',  'med_report.pdf', 'uploads/med_report.pdf', 'application/pdf',153600,13,'VERIFIED',    '2026-02-19 09:00:00'),
(18, 'DOCUMENT', 'Forged tax notice used during extortion',        'forged_tax.pdf', 'uploads/forged_tax.pdf', 'application/pdf',204800,15,'IN_ANALYSIS', '2026-02-21 11:30:00'),
(19, 'IMAGE',    'Map of robbery location with CCTV coverage',     'loc_map.jpg',    'uploads/loc_map.jpg',    'image/jpeg', 230000,  17, 'PENDING',     '2026-02-24 10:00:00'),
(20, 'IMAGE',    'Bicycle serial number from school records',       'bike_serial.jpg','uploads/bike_serial.jpg','image/jpeg', 102400,  19, 'VERIFIED',    '2026-02-26 09:30:00'),
(21, 'IMAGE',    'Close-up of skimming device on ATM card slot',   'atm_skim.jpg',   'uploads/atm_skim.jpg',   'image/jpeg', 409600,  2,  'IN_ANALYSIS', '2026-03-02 08:30:00'),
(22, 'IMAGE',    'Crime scene photos — canal bank, victim found',  'canal_scene.jpg','uploads/canal_scene.jpg','image/jpeg', 819200,  3,  'IN_ANALYSIS', '2026-03-05 09:00:00');

-- ================================================
-- 8. CASE ACTIVITY / TIMELINE (22 entries)
-- ================================================
INSERT INTO CaseActivity (case_id, activity_type, notes, actor_officer_id, created_at) VALUES
(1,  'CASE_CREATED',    'Case opened after metro snatch FIR filed',                 1,  '2026-01-05 10:00:00'),
(2,  'CASE_CREATED',    'FIR lodged by bar patrons, witnesses recorded',            1,  '2026-01-07 23:00:00'),
(3,  'CASE_CREATED',    'Case opened; CCTV review initiated',                       2,  '2026-01-10 15:00:00'),
(4,  'CASE_CREATED',    'Cyber cell notified; bank KYC records requested',          1,  '2026-01-12 12:00:00'),
(5,  'CASE_CREATED',    'FIR filed by homeowner; forensic team deployed',           2,  '2026-01-15 09:00:00'),
(1,  'STATUS_CHANGED',  'Status updated to IN_PROGRESS after CCTV review',         2,  '2026-01-08 11:00:00'),
(1,  'CASE_CLOSED',     'Suspect identified and arrested; case closed',             2,  '2026-01-20 16:00:00'),
(3,  'EVIDENCE_UPLOADED','CCTV screenshots added to evidence locker',              6,  '2026-01-11 12:00:00'),
(3,  'OFFICER_ASSIGNED','Senior officer Suresh Reddy assigned to robbery case',    1,  '2026-01-11 09:00:00'),
(12, 'CASE_CREATED',    'Murder case registered; forensic team at scene',          1,  '2026-02-05 08:00:00'),
(12, 'EVIDENCE_UPLOADED','Crime scene photos and autopsy report uploaded',         3,  '2026-02-06 10:00:00'),
(12, 'STATUS_CHANGED',  'Status changed to IN_PROGRESS; suspect shortlisted',     3,  '2026-02-10 14:00:00'),
(16, 'CASE_CREATED',    'Warehouse raid successful; 3 arrests made',               1,  '2026-02-16 13:00:00'),
(16, 'EVIDENCE_UPLOADED','Heroin cache photographed and logged into evidence',    11,  '2026-02-17 11:00:00'),
(8,  'CASE_CREATED',    'Checkpoint seizure case opened; vehicles impounded',      1,  '2026-01-23 04:00:00'),
(8,  'STATUS_CHANGED',  'Transferred to narcotics division for investigation',     2,  '2026-01-25 09:00:00'),
(22, 'CASE_CREATED',    'Murder case opened; forensic divers deployed at canal',   1,  '2026-03-04 09:00:00'),
(22, 'OFFICER_ASSIGNED','Lead investigator Anita Sharma assigned',                 1,  '2026-03-04 10:00:00'),
(22, 'EVIDENCE_UPLOADED','Scene photographs sent to forensic lab',                 3,  '2026-03-05 10:00:00'),
(10, 'STATUS_CHANGED',  'SIT formed; victim statements recorded',                  6,  '2026-02-01 10:00:00'),
(14, 'STATUS_CHANGED',  'Gang members identified; warrants issued',                7,  '2026-02-15 13:00:00'),
(21, 'EVIDENCE_UPLOADED','Skimmer device sent to digital forensics lab',           2,  '2026-03-02 09:30:00');

-- ================================================
-- 9. NOTIFICATIONS (22 entries)
-- ================================================
INSERT INTO Notification (officer_id, message, is_read, created_at) VALUES
(2,  'New case CASE-2026-001 assigned to you.',                         FALSE, '2026-01-05 10:05:00'),
(4,  'New case CASE-2026-002 assigned to you.',                         TRUE,  '2026-01-07 23:05:00'),
(6,  'New case CASE-2026-003 assigned to you — HIGH priority.',         FALSE, '2026-01-10 15:05:00'),
(8,  'New case CASE-2026-004 assigned; cyber cell on standby.',         TRUE,  '2026-01-12 12:05:00'),
(10, 'Case CASE-2026-005 assigned — forensic team arranged.',           FALSE, '2026-01-15 09:05:00'),
(2,  'Evidence uploaded for case CASE-2026-001.',                       TRUE,  '2026-01-06 10:10:00'),
(6,  'Evidence uploaded for case CASE-2026-003.',                       FALSE, '2026-01-11 12:10:00'),
(3,  'You have been assigned as lead investigator for CASE-2026-012.',  FALSE, '2026-02-05 08:10:00'),
(11, 'New HIGH priority case CASE-2026-016 assigned to you.',           FALSE, '2026-02-16 13:10:00'),
(3,  'Evidence submitted for CASE-2026-022 review.',                    FALSE, '2026-03-05 10:10:00'),
(2,  'CASE-2026-008 transferred to narcotics division.',               TRUE,  '2026-01-25 09:10:00'),
(7,  'Warrants issued — CASE-2026-014 updated to IN_PROGRESS.',         FALSE, '2026-02-15 13:10:00'),
(13, 'CASE-2026-017 closed after victim settlement.',                   TRUE,  '2026-02-19 11:00:00'),
(15, 'CASE-2026-018 requires your statement on extortion attempt.',     FALSE, '2026-02-21 12:00:00'),
(1,  'System alert: 3 HIGH priority cases pending review.',             FALSE, '2026-03-10 08:00:00'),
(1,  'Weekly summary: 22 cases total, 6 OPEN, 8 IN_PROGRESS, 8 CLOSED.',TRUE, '2026-03-07 09:00:00'),
(9,  'You have been reassigned from CASE-2026-009 to CASE-2026-015.',   FALSE, '2026-02-14 08:00:00'),
(17, 'New case CASE-2026-019 assigned. Victim statement pending.',      FALSE, '2026-02-23 22:00:00'),
(19, 'CASE-2026-020 closed — suspect apprehended.',                     TRUE,  '2026-02-28 10:00:00'),
(2,  'CASE-2026-021 evidence sent to digital forensics lab.',           FALSE, '2026-03-02 10:00:00'),
(4,  'Reminder: CASE-2026-009 court date is next week.',                TRUE,  '2026-03-12 09:00:00'),
(6,  'SIT formed for CASE-2026-010; your attendance required Monday.',  FALSE, '2026-02-01 11:00:00');

-- ================================================
-- TEST LOGIN ACCOUNT  (run standalone if needed)
--   Email    : pragadesh@ccms.gov
--   Password : Admin@123
-- ================================================
-- bcrypt hash for 'Admin@123' = $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO Officer (name, email, password_hash, role)
VALUES ('Pragadesh Admin', 'pragadesh@ccms.gov',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'ADMIN')
ON DUPLICATE KEY UPDATE
  password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  role = 'ADMIN';

SELECT 'Seed complete.' AS status,
  (SELECT COUNT(*) FROM Officer)      AS officers,
  (SELECT COUNT(*) FROM Location)     AS locations,
  (SELECT COUNT(*) FROM Crime)        AS crimes,
  (SELECT COUNT(*) FROM Victim)       AS victims,
  (SELECT COUNT(*) FROM CaseFile)     AS cases,
  (SELECT COUNT(*) FROM Evidence)     AS evidence,
  (SELECT COUNT(*) FROM CaseActivity) AS activities,
  (SELECT COUNT(*) FROM Notification) AS notifications;
