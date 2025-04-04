/*
  # Fix Duplicate Supplier Policies

  1. Changes
    - Drop existing supplier policies
    - Recreate with unique names
    - No schema changes
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "suppliers_select" ON suppliers;
  DROP POLICY IF EXISTS "suppliers_insert" ON suppliers;
  DROP POLICY IF EXISTS "suppliers_update" ON suppliers;
  DROP POLICY IF EXISTS "suppliers_delete" ON suppliers;
END $$;

-- Create new policies with unique names
CREATE POLICY "supplier_select_policy_v1" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "supplier_insert_policy_v1" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "supplier_update_policy_v1" ON suppliers
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "supplier_delete_policy_v1" ON suppliers
  FOR DELETE TO authenticated
  USING (true);