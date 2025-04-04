/*
  # Fix Schema Issues and Consolidate Tables

  1. Changes
    - Drop and recreate materials table with all required columns
    - Drop and recreate suppliers table
    - Drop and recreate material_barcodes table
    - Ensure proper foreign key relationships
    - Set up RLS policies

  2. Tables Modified
    - materials (added image_url)
    - material_barcodes (recreated)
    - suppliers (recreated)

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS material_barcodes;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS materials;

-- Create materials table with all required columns
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  min_quantity NUMERIC NOT NULL DEFAULT 0,
  max_quantity NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  primary_barcode TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create material_barcodes table
CREATE TABLE material_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  barcode TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(barcode)
);

-- Enable RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_barcodes ENABLE ROW LEVEL SECURITY;

-- Create policies for materials
CREATE POLICY "materials_select" ON materials
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "materials_insert" ON materials
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "materials_update" ON materials
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "materials_delete" ON materials
  FOR DELETE TO authenticated
  USING (true);

-- Create policies for suppliers
CREATE POLICY "suppliers_select" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "suppliers_insert" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "suppliers_update" ON suppliers
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "suppliers_delete" ON suppliers
  FOR DELETE TO authenticated
  USING (true);

-- Create policies for material_barcodes
CREATE POLICY "material_barcodes_select" ON material_barcodes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "material_barcodes_insert" ON material_barcodes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "material_barcodes_update" ON material_barcodes
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "material_barcodes_delete" ON material_barcodes
  FOR DELETE TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_material_barcodes_barcode ON material_barcodes(barcode);
CREATE INDEX idx_materials_primary_barcode ON materials(primary_barcode);
CREATE INDEX idx_materials_name ON materials(name);
CREATE INDEX idx_suppliers_name ON suppliers(name);