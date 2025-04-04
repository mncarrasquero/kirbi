/*
  # Add Barcode and Image Support

  1. Changes to materials table:
    - Add image_url column
    - Add primary_barcode column
  
  2. New Tables:
    - `material_barcodes`
      - For storing multiple barcodes per material
      - Links barcodes to materials and suppliers
    - `suppliers`
      - Basic supplier information

  3. Security:
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to materials
ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_barcode TEXT UNIQUE;

-- Create material_barcodes table
CREATE TABLE IF NOT EXISTS material_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  barcode TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(barcode)
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_barcodes ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "suppliers_select_policy" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "suppliers_insert_policy" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "suppliers_update_policy" ON suppliers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "suppliers_delete_policy" ON suppliers
  FOR DELETE TO authenticated
  USING (true);

-- Create policies for material_barcodes
CREATE POLICY "material_barcodes_select_policy" ON material_barcodes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "material_barcodes_insert_policy" ON material_barcodes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "material_barcodes_update_policy" ON material_barcodes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "material_barcodes_delete_policy" ON material_barcodes
  FOR DELETE TO authenticated
  USING (true);

-- Create index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_material_barcodes_barcode ON material_barcodes(barcode);
CREATE INDEX IF NOT EXISTS idx_materials_primary_barcode ON materials(primary_barcode);