-- Drop and recreate the stock_by_location view to include image_url
DROP VIEW IF EXISTS stock_by_location;

CREATE VIEW stock_by_location AS
SELECT 
  m.id AS material_id,
  m.name AS material_name,
  m.unit,
  m.min_quantity,
  m.max_quantity,
  m.image_url,
  l.id AS location_id,
  l.name AS location_name,
  COALESCE(SUM(
    CASE 
      WHEN ie.entry_type = 'in' THEN ie.quantity
      ELSE -ie.quantity
    END
  ), 0) as current_stock
FROM materials m
CROSS JOIN locations l
LEFT JOIN inventory_entries ie 
  ON ie.material_id = m.id 
  AND ie.location_id = l.id
GROUP BY 
  m.id, 
  m.name, 
  m.unit, 
  m.min_quantity,
  m.max_quantity,
  m.image_url,
  l.id, 
  l.name;

-- Add image_url to materials if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'materials' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE materials ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'materials' 
    AND column_name = 'primary_barcode'
  ) THEN
    ALTER TABLE materials ADD COLUMN primary_barcode TEXT UNIQUE;
  END IF;
END $$;

-- Create suppliers table if it doesn't exist
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create material_barcodes table if it doesn't exist
CREATE TABLE IF NOT EXISTS material_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  barcode TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(barcode)
);

-- Enable RLS on new tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_barcodes ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX IF NOT EXISTS idx_material_barcodes_barcode ON material_barcodes(barcode);
CREATE INDEX IF NOT EXISTS idx_materials_primary_barcode ON materials(primary_barcode);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);