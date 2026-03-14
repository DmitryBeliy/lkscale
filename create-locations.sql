-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access" ON locations FOR ALL USING (true) WITH CHECK (true);

-- Insert locations from old system
INSERT INTO locations (id, name, type, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Основной склад', 1, true),
  ('10000000-0000-0000-0000-000000000002', 'Витрина магазина', 2, true),
  ('10000000-0000-0000-0000-000000000003', 'Резервный склад', 1, true),
  ('10000000-0000-0000-0000-000000000004', 'Склад у поставщика', 3, true),
  ('10000000-0000-0000-0000-000000000005', 'Транзит', 4, true),
  ('10000000-0000-0000-0000-000000000006', 'Магазин центральный', 2, true),
  ('10000000-0000-0000-0000-000000000007', 'Склад запчастей', 1, true),
  ('10000000-0000-0000-0000-000000000008', 'Шоурум', 2, true),
  ('10000000-0000-0000-0000-000000000009', 'Архив', 5, true);

SELECT * FROM locations;
