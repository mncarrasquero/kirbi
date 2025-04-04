/*
  # Initial Schema for Inventory Management System

  1. New Tables
    - `materials`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `unit` (text)
      - `min_quantity` (numeric)
      - `max_quantity` (numeric)
      - `created_at` (timestamptz)
    
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `inventory_entries`
      - `id` (uuid, primary key)
      - `material_id` (uuid, foreign key)
      - `location_id` (uuid, foreign key)
      - `quantity` (numeric)
      - `entry_type` (text)
      - `worker_name` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)

  2. Views
    - `stock_by_location`
      - Calculated view showing current stock levels per material and location

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  min_quantity NUMERIC NOT NULL DEFAULT 0,
  max_quantity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create inventory_entries table
CREATE TABLE IF NOT EXISTS inventory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) NOT NULL,
  location_id UUID REFERENCES locations(id) NOT NULL,
  quantity NUMERIC NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('in', 'out')),
  worker_name TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create stock_by_location view
CREATE OR REPLACE VIEW stock_by_location AS
SELECT 
  m.id AS material_id,
  m.name AS material_name,
  m.unit,
  m.min_quantity,
  m.max_quantity,
  l.id AS location_id,
  l.name AS location_name,
  COALESCE(SUM(
    CASE 
      WHEN ie.entry_type = 'in' THEN ie.quantity
      ELSE -ie.quantity
    END
  ), 0) as current_stock
FROM materials m
CROSS JOIN locations l
LEFT JOIN inventory_entries ie 
  ON ie.material_id = m.id 
  AND ie.location_id = l.id
GROUP BY 
  m.id, 
  m.name, 
  m.unit, 
  m.min_quantity,
  m.max_quantity,
  l.id, 
  l.name;

-- Enable Row Level Security
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read materials" ON materials
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert materials" ON materials
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read locations" ON locations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert locations" ON locations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read inventory_entries" ON inventory_entries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert inventory_entries" ON inventory_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);