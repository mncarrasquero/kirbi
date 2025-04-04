/*
  # Fix Policy Naming Conflicts

  1. Changes
    - Drop all existing policies
    - Create new policies with unique names
    - No schema changes
*/

-- Drop all existing policies
DO $$ 
BEGIN
  -- Drop materials policies
  DROP POLICY IF EXISTS "materials_select_policy" ON materials;
  DROP POLICY IF EXISTS "materials_insert_policy" ON materials;
  DROP POLICY IF EXISTS "materials_update_policy" ON materials;
  DROP POLICY IF EXISTS "materials_delete_policy" ON materials;
  DROP POLICY IF EXISTS "materials_policy" ON materials;
  
  -- Drop suppliers policies
  DROP POLICY IF EXISTS "suppliers_select_policy" ON suppliers;
  DROP POLICY IF EXISTS "suppliers_insert_policy" ON suppliers;
  DROP POLICY IF EXISTS "suppliers_update_policy" ON suppliers;
  DROP POLICY IF EXISTS "suppliers_delete_policy" ON suppliers;
  
  -- Drop material_barcodes policies
  DROP POLICY IF EXISTS "material_barcodes_select_policy" ON material_barcodes;
  DROP POLICY IF EXISTS "material_barcodes_insert_policy" ON material_barcodes;
  DROP POLICY IF EXISTS "material_barcodes_update_policy" ON material_barcodes;
  DROP POLICY IF EXISTS "material_barcodes_delete_policy" ON material_barcodes;
END $$;

-- Create new policies with unique names
-- Materials policies
CREATE POLICY "materials_select_policy_v2" ON materials
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "materials_insert_policy_v2" ON materials
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "materials_update_policy_v2" ON materials
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "materials_delete_policy_v2" ON materials
  FOR DELETE TO authenticated
  USING (true);

-- Suppliers policies
CREATE POLICY "suppliers_select_policy_v2" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "suppliers_insert_policy_v2" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "suppliers_update_policy_v2" ON suppliers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "suppliers_delete_policy_v2" ON suppliers
  FOR DELETE TO authenticated
  USING (true);

-- Material barcodes policies
CREATE POLICY "material_barcodes_select_policy_v2" ON material_barcodes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "material_barcodes_insert_policy_v2" ON material_barcodes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "material_barcodes_update_policy_v2" ON material_barcodes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "material_barcodes_delete_policy_v2" ON material_barcodes
  FOR DELETE TO authenticated
  USING (true);