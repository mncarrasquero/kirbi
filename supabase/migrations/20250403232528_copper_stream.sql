/*
  # Fix Location Policies

  1. Changes
    - Drop existing location policies
    - Recreate location policies with unique names
*/

-- Drop all existing location policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "locations_read_policy" ON locations;
  DROP POLICY IF EXISTS "locations_write_policy" ON locations;
  DROP POLICY IF EXISTS "locations_update_policy" ON locations;
  DROP POLICY IF EXISTS "locations_delete_policy" ON locations;
END $$;

-- Create new policies for locations with unique names
CREATE POLICY "location_select_policy_v2" ON locations
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "location_insert_policy_v2" ON locations
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "location_update_policy_v2" ON locations
  FOR UPDATE TO authenticated 
  USING (true);

CREATE POLICY "location_delete_policy_v2" ON locations
  FOR DELETE TO authenticated 
  USING (true);