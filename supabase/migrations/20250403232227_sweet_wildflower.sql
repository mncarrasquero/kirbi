/*
  # Fix Policy Conflicts

  1. Changes
    - Drop all existing policies to ensure clean state
    - Create new policies with unique names
    - Ensure proper authentication checks
*/

-- Drop all existing policies
DO $$ 
BEGIN
  -- Drop all policies from materials
  DROP POLICY IF EXISTS "materials_select" ON materials;
  DROP POLICY IF EXISTS "materials_insert" ON materials;
  DROP POLICY IF EXISTS "materials_update" ON materials;
  DROP POLICY IF EXISTS "materials_delete" ON materials;
  DROP POLICY IF EXISTS "Allow authenticated read materials" ON materials;
  DROP POLICY IF EXISTS "Allow authenticated insert materials" ON materials;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON materials;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON materials;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON materials;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON materials;

  -- Drop all policies from locations
  DROP POLICY IF EXISTS "locations_select" ON locations;
  DROP POLICY IF EXISTS "locations_insert" ON locations;
  DROP POLICY IF EXISTS "locations_update" ON locations;
  DROP POLICY IF EXISTS "locations_delete" ON locations;
  DROP POLICY IF EXISTS "Allow authenticated read locations" ON locations;
  DROP POLICY IF EXISTS "Allow authenticated insert locations" ON locations;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON locations;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON locations;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON locations;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON locations;

  -- Drop all policies from inventory_entries
  DROP POLICY IF EXISTS "inventory_entries_select" ON inventory_entries;
  DROP POLICY IF EXISTS "inventory_entries_insert" ON inventory_entries;
  DROP POLICY IF EXISTS "inventory_entries_update" ON inventory_entries;
  DROP POLICY IF EXISTS "inventory_entries_delete" ON inventory_entries;
  DROP POLICY IF EXISTS "Allow authenticated read inventory_entries" ON inventory_entries;
  DROP POLICY IF EXISTS "Allow authenticated insert inventory_entries" ON inventory_entries;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON inventory_entries;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON inventory_entries;
  DROP POLICY IF EXISTS "Enable update access for own entries" ON inventory_entries;
  DROP POLICY IF EXISTS "Enable delete access for own entries" ON inventory_entries;
END $$;

-- Create new unified policies with simple authentication checks
CREATE POLICY "materials_read_policy" ON materials
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "materials_write_policy" ON materials
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "materials_update_policy" ON materials
  FOR UPDATE TO authenticated 
  USING (true);

CREATE POLICY "materials_delete_policy" ON materials
  FOR DELETE TO authenticated 
  USING (true);

CREATE POLICY "locations_read_policy" ON locations
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "locations_write_policy" ON locations
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "locations_update_policy" ON locations
  FOR UPDATE TO authenticated 
  USING (true);

CREATE POLICY "locations_delete_policy" ON locations
  FOR DELETE TO authenticated 
  USING (true);

CREATE POLICY "inventory_entries_read_policy" ON inventory_entries
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "inventory_entries_write_policy" ON inventory_entries
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inventory_entries_update_policy" ON inventory_entries
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "inventory_entries_delete_policy" ON inventory_entries
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);