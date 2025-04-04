/*
  # Add Materials Management System Tables

  1. New Tables:
    - `materials`
      - Core materials table with basic information
    - `suppliers`
      - Basic supplier information
    - `material_barcodes`
      - For storing multiple barcodes per material
      - Links barcodes to materials and suppliers

  2. Security:
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create materials table first
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  max_quantity INTEGER NOT NULL DEFAULT 0,
  primary_barcode TEXT UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create material_barcodes table with explicit foreign key references
CREATE TABLE IF NOT EXISTS material_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL,
  supplier_id UUID,
  barcode TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(barcode),
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_barcodes ENABLE ROW LEVEL SECURITY;

-- Create policies for materials
CREATE POLICY "materials_select_policy" ON materials
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "materials_insert_policy" ON materials
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "materials_update_policy" ON materials
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "materials_delete_policy" ON materials
  FOR DELETE TO authenticated
  USING (true);

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_material_barcodes_barcode ON material_barcodes(barcode);
CREATE INDEX IF NOT EXISTS idx_materials_primary_barcode ON materials(primary_barcode);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);