/*
  # Create Suppliers Table and Policies

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "suppliers_select_policy_v3" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "suppliers_insert_policy_v3" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "suppliers_update_policy_v3" ON suppliers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "suppliers_delete_policy_v3" ON suppliers
  FOR DELETE TO authenticated
  USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);