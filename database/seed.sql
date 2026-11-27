-- ShebaLink Fictional Bangladesh Demo Seed Data (PostgreSQL Blueprint)
-- Mirrors demo entities in frontend/src/data/*

INSERT INTO service_categories (name, slug, service_group, description, icon_key, is_active)
VALUES
  ('Electrician', 'electrician', 'home-repair', 'Switchboard repairs, IPS & inverter wiring, ceiling fan installation, and house rewiring.', 'Zap', TRUE),
  ('Plumber', 'plumber', 'home-repair', 'Pipe leak fixes, water motor installation, kitchen sink unclogging, and tap replacements.', 'Droplets', TRUE),
  ('AC Repair & Servicing', 'ac-repair', 'home-repair', 'Split & window AC master wash, gas refilling, and compressor diagnostics.', 'Wind', TRUE),
  ('Home Cleaning', 'home-cleaning', 'cleaning-household', 'Full apartment deep cleaning, kitchen degreasing, and bathroom descaling.', 'Sparkles', TRUE),
  ('Pest Control', 'pest-control', 'cleaning-household', 'Safe gel & spray treatment for cockroaches, termites, and bedbugs.', 'Bug', TRUE),
  ('Home Shifting', 'home-shifting', 'delivery-moving', 'Covered pickup van rental, careful furniture wrapping, and loading crew.', 'Truck', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Sample demo users (passwords are fictional non-functional placeholder hashes)
INSERT INTO users (full_name, email, phone, password_hash, role, city, address)
VALUES
  ('Tariqul Islam', 'tariqul.islam@shebalink.demo', '+8801711223344', '$2b$12$demoplaceholderhashcustomer001', 'customer', 'Rajshahi', 'House 24, Padma Residential Area, Rajshahi'),
  ('Rahim Uddin', 'rahim.uddin@shebalink.demo', '+8801711001101', '$2b$12$demoplaceholderhashprovider001', 'provider', 'Rajshahi', 'Boalia, Rajshahi'),
  ('Kamrul Hasan', 'kamrul.hasan@shebalink.demo', '+8801712002202', '$2b$12$demoplaceholderhashprovider002', 'provider', 'Rajshahi', 'Shaheb Bazar, Rajshahi'),
  ('Nusrat Jahan', 'admin@shebalink.demo', '+8801911000001', '$2b$12$demoplaceholderhashadmin001', 'admin', 'Rajshahi', 'ShebaLink Operations Desk, Rajshahi')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO provider_profiles (
  user_id,
  professional_title,
  bio,
  experience_years,
  verification_status,
  service_area_text,
  primary_city,
  neighborhood,
  is_available
)
SELECT
  u.id,
  'Electrician',
  'Certified residential electrician in Rajshahi specializing in IPS/inverter backup wiring and MCB distribution boards.',
  5,
  'verified',
  'Rajshahi (Boalia, Shaheb Bazar, Kazla)',
  'Rajshahi',
  'Boalia',
  TRUE
FROM users u
WHERE u.phone = '+8801711001101'
ON CONFLICT (user_id) DO NOTHING;
