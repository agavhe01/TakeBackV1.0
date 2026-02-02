-- =============================================================================
-- Seed data restored from production backup (2025-08-12)
-- All user passwords reset to: password123
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Section A: Auth users
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change_confirm_status,
  phone, phone_change, phone_change_token,
  email_change, reauthentication_token,
  is_sso_user, is_anonymous
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '32e7dfb4-2608-4022-8ae0-b74c5910e7ae',
    'authenticated', 'authenticated',
    'agavhera@gmail.com',
    '$2a$10$tVf.884/mqsPKMJGClW0eu0kB7ECi/Mw5MHQGJSDb/hwcCEACkl7e',
    '2025-07-29 02:48:16.714453+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"sub": "32e7dfb4-2608-4022-8ae0-b74c5910e7ae", "email": "agavhera@gmail.com", "phone": "617617617", "last_name": "Gavhera", "first_name": "Anesu", "email_verified": true, "phone_verified": false, "organization_legal_name": "Full Stacker''s"}',
    NULL, '2025-07-29 02:48:16.695051+00', '2025-08-05 15:11:19.34328+00',
    '', '', '', '', 0,
    NULL, '', '', '', '',
    false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '3186bf0f-d169-4a0b-99f0-f11e62fb9606',
    'authenticated', 'authenticated',
    'test@gmail.com',
    '$2a$10$tVf.884/mqsPKMJGClW0eu0kB7ECi/Mw5MHQGJSDb/hwcCEACkl7e',
    '2025-07-30 13:45:39.07149+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"sub": "3186bf0f-d169-4a0b-99f0-f11e62fb9606", "email": "test@gmail.com", "phone": "123123123", "last_name": "Test", "first_name": "John", "email_verified": true, "phone_verified": false, "organization_legal_name": "John Test Full Stackers"}',
    NULL, '2025-07-30 13:45:39.028159+00', '2025-07-30 19:23:06.690573+00',
    '', '', '', '', 0,
    NULL, '', '', '', '',
    false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '76db28de-25b2-4196-b4ee-d32bcb9a2a6a',
    'authenticated', 'authenticated',
    'aidansunbury@gmail.com',
    '$2a$10$tVf.884/mqsPKMJGClW0eu0kB7ECi/Mw5MHQGJSDb/hwcCEACkl7e',
    '2025-07-30 19:19:46.041234+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"sub": "76db28de-25b2-4196-b4ee-d32bcb9a2a6a", "email": "aidansunbury@gmail.com", "phone": "9254515546", "last_name": "Sunbury", "first_name": "Aidan", "email_verified": true, "phone_verified": false, "organization_legal_name": "test"}',
    NULL, '2025-07-30 19:19:45.97677+00', '2025-07-30 19:19:46.090008+00',
    '', '', '', '', 0,
    NULL, '', '', '', '',
    false, false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '835b90a3-c512-4e4a-a71e-fbf6774bc00a',
    'authenticated', 'authenticated',
    'tgavhera@gmail.com',
    '$2a$10$tVf.884/mqsPKMJGClW0eu0kB7ECi/Mw5MHQGJSDb/hwcCEACkl7e',
    '2025-08-03 02:15:56.099683+00',
    '{"provider": "email", "providers": ["email"]}',
    '{"sub": "835b90a3-c512-4e4a-a71e-fbf6774bc00a", "email": "tgavhera@gmail.com", "phone": "1231231234", "last_name": "Gavhera", "first_name": "Tawanda", "email_verified": true, "phone_verified": false, "organization_legal_name": "tawize"}',
    NULL, '2025-08-03 02:15:56.083921+00', '2025-08-03 02:15:56.114383+00',
    '', '', '', '', 0,
    NULL, '', '', '', '',
    false, false
  )
ON CONFLICT (id) DO NOTHING;

-- Also insert identities so Supabase auth works correctly
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES
  ('32e7dfb4-2608-4022-8ae0-b74c5910e7ae', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae',
   '{"sub": "32e7dfb4-2608-4022-8ae0-b74c5910e7ae", "email": "agavhera@gmail.com"}',
   'email', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', '2025-07-29 02:48:16.695051+00',
   '2025-07-29 02:48:16.695051+00', '2025-07-29 02:48:16.695051+00'),
  ('3186bf0f-d169-4a0b-99f0-f11e62fb9606', '3186bf0f-d169-4a0b-99f0-f11e62fb9606',
   '{"sub": "3186bf0f-d169-4a0b-99f0-f11e62fb9606", "email": "test@gmail.com"}',
   'email', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', '2025-07-30 13:45:39.028159+00',
   '2025-07-30 13:45:39.028159+00', '2025-07-30 13:45:39.028159+00'),
  ('76db28de-25b2-4196-b4ee-d32bcb9a2a6a', '76db28de-25b2-4196-b4ee-d32bcb9a2a6a',
   '{"sub": "76db28de-25b2-4196-b4ee-d32bcb9a2a6a", "email": "aidansunbury@gmail.com"}',
   'email', '76db28de-25b2-4196-b4ee-d32bcb9a2a6a', '2025-07-30 19:19:45.97677+00',
   '2025-07-30 19:19:45.97677+00', '2025-07-30 19:19:45.97677+00'),
  ('835b90a3-c512-4e4a-a71e-fbf6774bc00a', '835b90a3-c512-4e4a-a71e-fbf6774bc00a',
   '{"sub": "835b90a3-c512-4e4a-a71e-fbf6774bc00a", "email": "tgavhera@gmail.com"}',
   'email', '835b90a3-c512-4e4a-a71e-fbf6774bc00a', '2025-08-03 02:15:56.083921+00',
   '2025-08-03 02:15:56.083921+00', '2025-08-03 02:15:56.083921+00')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Section B: Public tables (FK-safe insert order)
-- ---------------------------------------------------------------------------

-- accounts (4 rows)
INSERT INTO accounts (id, first_name, last_name, date_of_birth, address, zip_code, ssn, phone, email, organization_legal_name, orginazation_ein_number, created_at) VALUES
  ('32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Isheanesu', 'Gavera', '2025-07-13', E'2 Miller Ave\nMedford\nMA', '02155', '123-45-4535', '12312312361', 'agavhera@gmail.com', 'Full Stacker''s', '12-3456789', '2025-07-29 02:48:16.836153'),
  ('3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'John', 'Test', '2025-07-30', E'35 Sunset St\nMedford\nMA', '02155', '123-456-789', '123123123', 'test@gmail.com', 'John Test Full Stackers', '12-3456789', '2025-07-30 13:45:39.158298'),
  ('76db28de-25b2-4196-b4ee-d32bcb9a2a6a', 'Aidan', 'Sunbury', '2025-07-09', '22', '3333333', '124567896', '9292545155444454515546', 'aidansunbury@gmail.com', 'testtest', '12-3456789', '2025-07-30 19:19:46.17328'),
  ('835b90a3-c512-4e4a-a71e-fbf6774bc00a', 'Tawanda', 'Gavhera', '2025-08-05', '2 Capen St', '12345', '123-45-6789', '1231231234', 'tgavhera@gmail.com', 'tawize', '12-3456789', '2025-08-03 02:15:56.292636')
ON CONFLICT (id) DO NOTHING;

-- budgets (9 rows)
INSERT INTO budgets (id, account_id, name, limit_amount, period, require_receipts, created_at) VALUES
  ('6cd2e18b-8cb9-4bbf-be4f-1c89d7aa59eb', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Food Allowance',           1000.00, 'weekly',    false, '2025-07-29 02:49:43.312519'),
  ('cf0fbd82-b074-4312-92e5-4ab6e5df8e3b', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Rent',                     10000.00, 'monthly',   false, '2025-07-29 02:52:03.835888'),
  ('84a5c2d1-a622-48b5-9f24-f530ac9de03d', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Software Subscriptions',    1000.00, 'monthly',   false, '2025-07-29 02:52:57.332756'),
  ('a4289a95-39ee-4915-bdcb-2109c720c24a', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Netflix',                     30.00, 'monthly',   false, '2025-07-29 15:59:21.473927'),
  ('730dfbf1-d1f3-44a1-ab39-57a4bea34b29', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Software Subsriptions',      250.00, 'monthly',   false, '2025-07-30 13:47:14.568255'),
  ('4227ae57-0158-49bc-ad20-43d6bf770bc1', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Food Allowance',            2000.00, 'quarterly', false, '2025-07-30 13:47:35.90432'),
  ('57ef7e20-6ba9-4490-9291-95e6fd0bb79f', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Housing Allowance',         1000.00, 'monthly',   false, '2025-07-30 13:47:59.895631'),
  ('9ad9c73e-c7c6-4ee8-8b72-0415a347b32f', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Transport Allowance',        100.00, 'weekly',    false, '2025-07-30 13:48:10.26979'),
  ('644b3cd7-a9e7-4785-9c32-28a252db5edf', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Beverage and Snacks',         25.00, 'weekly',    false, '2025-07-30 15:12:40.933944')
ON CONFLICT (id) DO NOTHING;

-- cards (9 rows)
INSERT INTO cards (id, account_id, name, status, balance, cardholder_name, cvv, expiry, zipcode, address, budget_id, created_at) VALUES
  ('b067b095-cc04-4bce-87a7-b907513d2b15', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Anesu''s Visa',            'issued', 0.00, 'Celestino Kahari',  '123', '08/29', '02134', E'3 Capen St\nMedford\nMA',              NULL, '2025-07-29 02:53:43.398927'),
  ('e6725e26-d96b-4d3f-a689-af7aac2a6f10', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Amex',                     'issued', 0.00, 'John Will',         '123', '05/30', '02156', E'3 Miller Hall \nMillford\nPA',          NULL, '2025-07-29 15:43:53.898232'),
  ('d068fb5c-c711-48df-966c-ff1c2c287945', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'John''s Amex',             'issued', 0.00, 'John Abrantes',     '123', '09/29', '02144', E'35 Curtis Ave\nSomerville\nMA\n',       NULL, '2025-07-29 04:35:16.175097'),
  ('a8e5b7f2-a34e-4bf5-ae76-4315620aa322', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Jim''s Chase ',            'issued', 0.00, 'Jim Sarazen',       '123', '09/33', '12345', E'200 College Avenue\nMedford\nMA',       NULL, '2025-07-29 17:44:49.775449'),
  ('5d8b3d41-1481-4b79-99b0-0deb143a78c3', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Owen''s Ecocash',          'issued', 0.00, 'Owen Wilson',       '123', '08/33', '43223', E'345 Gilgis Rd\nGeorgia',                NULL, '2025-07-29 20:55:39.847377'),
  ('6bd40a81-0e26-432a-9e64-079db329eeed', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'David Villa''s AMEX',      'issued', 0.00, 'David Villa',       '123', '05/30', '12345', E'34 Gilman St\nMillford\nMA',            NULL, '2025-07-30 13:48:56.338'),
  ('e0922e57-64ce-4ec5-9166-62278713411b', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Cole Palmer''s VISA',      'issued', 0.00, 'Cole Palmer',       '123', '09/32', '12345', E'34 Ville de Rue\nJamaica Plain\nMA',   NULL, '2025-07-30 13:49:50.918496'),
  ('cbad8b9b-8b8c-4024-b19b-d1de0d151881', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Marcus Rashford''s Chase', 'issued', 0.00, 'Marcus Rashford',   '123', '09/32', '12345', E'39 Ville de Rue\nJamaica Plain\nMA',   NULL, '2025-07-30 13:50:23.996859'),
  ('bacbdb25-0d3b-40c2-9b0c-eacf8dfd1493', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Jill Stacy''s Mastercard', 'issued', 0.00, 'Jill Stacy',       '123', '09/29', '02177', E'34 Gillman Rd\nGillman Sq\nMA',        NULL, '2025-07-30 15:13:22.278953')
ON CONFLICT (id) DO NOTHING;

-- card_budgets (17 rows)
INSERT INTO card_budgets (id, card_id, budget_id, created_at) VALUES
  ('79e93799-8e5d-45f1-8503-55d92c026269', 'b067b095-cc04-4bce-87a7-b907513d2b15', '6cd2e18b-8cb9-4bbf-be4f-1c89d7aa59eb', '2025-07-29 02:53:43.652128'),
  ('d8b5f669-0d6a-4bb1-89c6-0ab0ffe9802a', 'b067b095-cc04-4bce-87a7-b907513d2b15', 'cf0fbd82-b074-4312-92e5-4ab6e5df8e3b', '2025-07-29 02:53:43.831705'),
  ('ef7dd169-e8f2-4ecc-b698-f808bf03e6a3', 'b067b095-cc04-4bce-87a7-b907513d2b15', '84a5c2d1-a622-48b5-9f24-f530ac9de03d', '2025-07-29 02:53:44.035134'),
  ('cfdc32bf-41b1-456c-a797-dd9bd0e280b5', 'e6725e26-d96b-4d3f-a689-af7aac2a6f10', '84a5c2d1-a622-48b5-9f24-f530ac9de03d', '2025-07-29 16:08:01.609905'),
  ('3f3a34c2-2085-4180-b18d-bf1a7145871f', 'e6725e26-d96b-4d3f-a689-af7aac2a6f10', 'a4289a95-39ee-4915-bdcb-2109c720c24a', '2025-07-29 16:08:01.843845'),
  ('325f67aa-c6d6-47fa-8b25-6c91f4499cd0', 'e6725e26-d96b-4d3f-a689-af7aac2a6f10', '6cd2e18b-8cb9-4bbf-be4f-1c89d7aa59eb', '2025-07-29 16:08:02.332888'),
  ('6abb5c9d-cf79-4ac1-b8b0-9747b75f886e', 'd068fb5c-c711-48df-966c-ff1c2c287945', '6cd2e18b-8cb9-4bbf-be4f-1c89d7aa59eb', '2025-07-29 16:11:18.797944'),
  ('dfe16910-6457-4c0a-96f5-2d7cb55ceb3d', 'a8e5b7f2-a34e-4bf5-ae76-4315620aa322', '84a5c2d1-a622-48b5-9f24-f530ac9de03d', '2025-07-29 17:44:50.000404'),
  ('bef8f2ab-5c9f-40c0-903f-1d83b43e61ac', '5d8b3d41-1481-4b79-99b0-0deb143a78c3', '6cd2e18b-8cb9-4bbf-be4f-1c89d7aa59eb', '2025-07-29 20:55:40.031972'),
  ('b9b0ca83-6fd1-4c1e-8736-3f71af305ca4', '6bd40a81-0e26-432a-9e64-079db329eeed', '9ad9c73e-c7c6-4ee8-8b72-0415a347b32f', '2025-07-30 13:48:56.632461'),
  ('de695127-23d6-47fc-875a-09bc79c55352', '6bd40a81-0e26-432a-9e64-079db329eeed', '4227ae57-0158-49bc-ad20-43d6bf770bc1', '2025-07-30 13:48:56.808951'),
  ('2fdcc63f-deda-4d79-ba66-2ce6de663453', '6bd40a81-0e26-432a-9e64-079db329eeed', '730dfbf1-d1f3-44a1-ab39-57a4bea34b29', '2025-07-30 13:48:56.980047'),
  ('80feded8-ad00-4bd1-9271-e6c6227ed277', 'e0922e57-64ce-4ec5-9166-62278713411b', '57ef7e20-6ba9-4490-9291-95e6fd0bb79f', '2025-07-30 13:49:51.231382'),
  ('2a49a133-a22c-4251-b1e1-1fa1dce96051', 'cbad8b9b-8b8c-4024-b19b-d1de0d151881', '57ef7e20-6ba9-4490-9291-95e6fd0bb79f', '2025-07-30 13:50:24.307146'),
  ('52d53c93-5275-4f9d-872a-e56fbce22e61', 'cbad8b9b-8b8c-4024-b19b-d1de0d151881', '9ad9c73e-c7c6-4ee8-8b72-0415a347b32f', '2025-07-30 13:50:24.605687'),
  ('2cfced9d-6320-4f47-8696-2942bd9a5a62', 'cbad8b9b-8b8c-4024-b19b-d1de0d151881', '4227ae57-0158-49bc-ad20-43d6bf770bc1', '2025-07-30 13:50:24.805519'),
  ('73d6643c-6074-43f9-9191-2afa04dcca18', 'bacbdb25-0d3b-40c2-9b0c-eacf8dfd1493', '644b3cd7-a9e7-4785-9c32-28a252db5edf', '2025-07-30 15:13:22.620395')
ON CONFLICT (id) DO NOTHING;

-- receipts (6 rows) — URLs point to remote Supabase storage (dead links locally)
INSERT INTO receipts (id, description, account_id, name, type, url, amount, date_added, date_of_purchase) VALUES
  ('42939e40-2851-4fc4-afcd-ac438750fed7', 'Yes', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Dine Inn', 'image', 'https://emlbtarsoeokdstcdiow.supabase.co/storage/v1/object/public/supporting-documents-storage-bucket/receipts/32e7dfb4-2608-4022-8ae0-b74c5910e7ae/20250730_024127_dine-inn-dinner-meal_20250730_024127.png?', 200.00, '2025-07-30 02:41:45.819517', '2025-07-28 00:00:00'),
  ('95f3dc90-6463-46f7-b9cd-86b1019bf70d', 'asdasd', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'Tobacco-2023-opt', 'document', 'https://emlbtarsoeokdstcdiow.supabase.co/storage/v1/object/public/supporting-documents-storage-bucket/receipts/32e7dfb4-2608-4022-8ae0-b74c5910e7ae/20250730_034835_Tobacco-2023-opt_20250730_034835.pdf?', 33.00, '2025-07-30 03:48:43.99381', '2025-07-01 00:00:00'),
  ('84304ee8-e25c-49b5-89d6-e1c54de8a1bf', 'output receipt', '32e7dfb4-2608-4022-8ae0-b74c5910e7ae', 'output receipt', 'image', 'https://emlbtarsoeokdstcdiow.supabase.co/storage/v1/object/public/supporting-documents-storage-bucket/receipts/32e7dfb4-2608-4022-8ae0-b74c5910e7ae/20250730_171117_output_20250730_171117.png?', 200.00, '2025-07-30 17:11:52.353521', '2025-07-30 00:00:00'),
  ('acdd7d1f-2b63-4a90-95a3-26038a83ac2d', 'TakeBack Software Receipt #012345', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'TakeBack Software Subscription', 'image', 'https://emlbtarsoeokdstcdiow.supabase.co/storage/v1/object/public/supporting-documents-storage-bucket/receipts/3186bf0f-d169-4a0b-99f0-f11e62fb9606/20250730_135543_takeback-software-subscription_20250730_135543.png?', 100.00, '2025-07-30 13:56:42.587985', '2025-05-24 00:00:00'),
  ('2f7510ec-383a-4f37-871c-1340ae167d28', '123 Main Street, 5 Star Service', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Dine In Dinner Meal', 'image', 'https://emlbtarsoeokdstcdiow.supabase.co/storage/v1/object/public/supporting-documents-storage-bucket/receipts/3186bf0f-d169-4a0b-99f0-f11e62fb9606/20250730_135650_dine-inn-dinner-meal_20250730_135650.png?', 200.00, '2025-07-30 13:57:27.357426', '2025-07-28 00:00:00'),
  ('229315a9-9430-42a7-9ddf-9a98799699aa', E'Receipt Number: CC-1546287\nDate of Purchase: Wednesday, July 30, 2025', '3186bf0f-d169-4a0b-99f0-f11e62fb9606', 'Coding_Complete_Premium_Subscription_Receipt_Enhanced', 'document', 'https://emlbtarsoeokdstcdiow.supabase.co/storage/v1/object/public/supporting-documents-storage-bucket/receipts/3186bf0f-d169-4a0b-99f0-f11e62fb9606/20250730_151434_Coding_Complete_Premium_Subscription_Receipt_Enhanced_20250730_151434.pdf?', 500.00, '2025-07-30 15:15:11.264608', '2025-07-30 00:00:00')
ON CONFLICT (id) DO NOTHING;

-- transactions (15 rows)
INSERT INTO transactions (id, card_budget_id, amount, name, description, category, merchant, receipt_url, date, created_at, receipt_id) VALUES
  ('eeb8e9a8-8991-4d1f-ac0d-407e4aedb528', 'ef7dd169-e8f2-4ecc-b698-f808bf03e6a3', 100.00,  'Chat GPT API',               'API Key for Langchain Implementation',  'Subsription',               NULL, NULL, '2025-07-28', '2025-07-29 03:08:19.816716', NULL),
  ('b651a307-452c-44ab-ba5f-869fe6400c36', 'ef7dd169-e8f2-4ecc-b698-f808bf03e6a3', 222.00,  'DeepSeek API',               'Deepseek LLM into Langchain',           'Subscription',              NULL, NULL, '2025-07-29', '2025-07-29 03:42:25.003206', NULL),
  ('04ea5a29-be40-47d4-ac1a-2a098eea1143', 'd8b5f669-0d6a-4bb1-89c6-0ab0ffe9802a', 9999.00, 'Rent to the Projects',       'My January 2025 Rent',                  'Rental Priviledges',        NULL, NULL, '2025-01-01', '2025-07-29 05:05:02.332754', NULL),
  ('cea37f3f-4dcb-4a2b-90c9-233d1c8402de', 'dfe16910-6457-4c0a-96f5-2d7cb55ceb3d', 900.00,  'Unix Purchase',              'Needed a better operating system',      'Unix License',              NULL, NULL, '2025-07-29', '2025-07-29 17:45:42.872729', NULL),
  ('f5255e1f-a493-476f-bb84-4b8ef9d05239', '3f3a34c2-2085-4180-b18d-bf1a7145871f', 30.00,   'Netflix July',               'Subscription to Netflix July',          'Subscription',              NULL, NULL, '2025-07-27', '2025-07-29 16:17:16.275177', '95f3dc90-6463-46f7-b9cd-86b1019bf70d'),
  ('5d3d6dae-60da-4bd8-b880-dfcc7084bafd', 'bef8f2ab-5c9f-40c0-903f-1d83b43e61ac', 999.00,  'Owen''s Grocery Bill',        'Costco Schopping',                      'Food ',                     NULL, NULL, '2025-07-28', '2025-07-29 20:56:26.641391', NULL),
  ('b888be39-4322-4c1c-87f8-88fd5cfb1a03', '6abb5c9d-cf79-4ac1-b8b0-9747b75f886e', 200.00,  'Ham Pizza',                  'Snacks and pizza',                      'Food',                      NULL, NULL, '2025-07-30', '2025-07-30 04:04:03.797954', NULL),
  ('37d3dff8-c5b0-4dcc-b6cb-315939a9b54e', '80feded8-ad00-4bd1-9271-e6c6227ed277', 850.00,  'July Rental ',               'Paid rent to my landlord via ETF',       'Rental Payments for July', NULL, NULL, '2025-07-01', '2025-07-30 13:51:27.366277', NULL),
  ('f85fc346-cea6-4f9f-815c-345adc0aab94', 'de695127-23d6-47fc-875a-09bc79c55352', 500.00,  'Food Payments for July',     'Lunch and DInner Options',              'Food Payments for July',    NULL, NULL, '2025-07-01', '2025-07-30 13:52:12.824731', NULL),
  ('db96982e-fbcc-4de6-bb0c-92709d5330f0', 'b9b0ca83-6fd1-4c1e-8736-3f71af305ca4', 100.00,  'Transport Week 1 July',      'Transport Week 1 July',                 'Transport Week 1 July',     NULL, NULL, '2025-07-01', '2025-07-30 13:52:46.687536', NULL),
  ('a6127aac-3810-43b3-94d1-a7e2ae4f26b2', 'b9b0ca83-6fd1-4c1e-8736-3f71af305ca4', 85.00,   'Transport Week 2 July',      'Transport Week 2 July',                 'Transport Week 2 July',     NULL, NULL, '2025-07-08', '2025-07-30 13:53:12.094993', NULL),
  ('f654a9db-45ab-4caa-9d97-48f28fc9b20c', '2cfced9d-6320-4f47-8696-2942bd9a5a62', 1800.00, 'Food Allowance Quarter end', 'Food Allowance Quarter end',            'Food Allowance Quarter end', NULL, NULL, '2025-07-24', '2025-07-30 13:54:22.540496', NULL),
  ('d14e2076-ee63-45c4-90e3-258bf69ef13f', '2a49a133-a22c-4251-b1e1-1fa1dce96051', 1000.00, 'Housing for July',           'Housing for July',                      'Housing for July',          NULL, NULL, '2025-07-15', '2025-07-30 13:54:53.500903', NULL),
  ('0bf9edfd-2da4-4be2-9504-0406192e16a3', 'bef8f2ab-5c9f-40c0-903f-1d83b43e61ac', 200.00,  'Dine Inn Dinner Meal',       'Dine Inn Dinner Meal',                  'Food ',                     NULL, NULL, '2025-07-30', '2025-07-30 14:17:04.330467', '42939e40-2851-4fc4-afcd-ac438750fed7'),
  ('b1d95fde-2902-4f13-9e85-810cd8f5a138', '73d6643c-6074-43f9-9191-2afa04dcca18', 24.00,   'Kumbucha and Seltzer Water', 'Kumbucha and Seltzer Water',            'Kumbucha and Seltzer Water', NULL, NULL, '2025-07-28', '2025-07-30 15:14:04.854322', NULL)
ON CONFLICT (id) DO NOTHING;
