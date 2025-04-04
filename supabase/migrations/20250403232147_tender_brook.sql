/*
  # Fix Policy Naming Conflicts and RLS Policies

  1. Changes
    - Drop all existing policies
    - Recreate policies with unique names and proper RLS checks
    - Ensure authenticated users can properly access their data
    - No schema changes, only policy updates
*/

-- Drop all existing policies
DO $$ 
BEGIN
  -- Drop materials policies
  DROP POLICY IF EXISTS "Allow authenticated read materials" ON materials;
  DROP POLICY IF EXISTS "Allow authenticated insert materials" ON materials;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON materials;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON materials;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON materials;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON materials;

  -- Drop locations policies
  DROP POLICY IF EXISTS "Allow authenticated read locations" ON locations;
  DROP POLICY IF EXISTS "Allow authenticated insert locations" ON locations;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON locations;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON locations;
  DROP POLICY IF EXISTS "Enable update access for authenticated users" ON locations;
  DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON locations;

  -- Drop inventory_entries policies
  DROP POLICY IF EXISTS "Allow authenticated read inventory_entries" ON inventory_entries;
  DROP POLICY IF EXISTS "Allow authenticated insert inventory_entries" ON inventory_entries;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON inventory_entries;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON inventory_entries;
  DROP POLICY IF EXISTS "Enable update access for own entries" ON inventory_entries;
  DROP POLICY IF EXISTS "Enable delete access for own entries" ON inventory_entries;
END $$;

-- Create new policies with unique names and proper RLS checks
-- Materials policies
CREATE POLICY "materials_select" ON materials
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "materials_insert" ON materials
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "materials_update" ON materials
  FOR UPDATE TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "materials_delete" ON materials
  FOR DELETE TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Locations policies
CREATE POLICY "locations_select" ON locations
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "locations_insert" ON locations
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "locations_update" ON locations
  FOR UPDATE TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "locations_delete" ON locations
  FOR DELETE TO authenticated 
  USING (auth.uid() IS NOT NULL);

-- Inventory entries policies
CREATE POLICY "inventory_entries_select" ON inventory_entries
  FOR SELECT TO authenticated 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_entries_insert" ON inventory_entries
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inventory_entries_update" ON inventory_entries
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "inventory_entries_delete" ON inventory_entries
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);