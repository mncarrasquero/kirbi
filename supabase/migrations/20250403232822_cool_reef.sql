/*
  # Fix Inventory Entries Policies

  1. Changes
    - Drop existing inventory entries policies
    - Create new policies with unique names
*/

-- Drop existing inventory entries policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "inventory_entries_read_policy" ON inventory_entries;
  DROP POLICY IF EXISTS "inventory_entries_write_policy" ON inventory_entries;
  DROP POLICY IF EXISTS "inventory_entries_update_policy" ON inventory_entries;
  DROP POLICY IF EXISTS "inventory_entries_delete_policy" ON inventory_entries;
END $$;

-- Create new policies with unique names
CREATE POLICY "inventory_entry_select_policy_v2" ON inventory_entries
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "inventory_entry_insert_policy_v2" ON inventory_entries
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "inventory_entry_update_policy_v2" ON inventory_entries
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "inventory_entry_delete_policy_v2" ON inventory_entries
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);