/*
  # Add Inventory Adjustment Support

  1. Changes
    - Add new entry_type 'adjustment' for inventory corrections
    - Add reason field to track why adjustments are made
    - Update check_stock_movement trigger to allow adjustments
*/

-- Add reason column to inventory_entries
ALTER TABLE inventory_entries
  ADD COLUMN IF NOT EXISTS reason TEXT;

-- Modify entry_type check constraint to include 'adjustment'
ALTER TABLE inventory_entries
  DROP CONSTRAINT IF EXISTS inventory_entries_entry_type_check;

ALTER TABLE inventory_entries
  ADD CONSTRAINT inventory_entries_entry_type_check 
  CHECK (entry_type IN ('in', 'out', 'adjustment'));

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS check_stock_movement_trigger ON inventory_entries;
DROP FUNCTION IF EXISTS check_stock_movement();

-- Create improved function to validate stock movement
CREATE OR REPLACE FUNCTION check_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  current_stock NUMERIC;
  material_name TEXT;
  location_name TEXT;
BEGIN
  -- Get material and location names for better error messages
  SELECT name INTO material_name FROM materials WHERE id = NEW.material_id;
  SELECT name INTO location_name FROM locations WHERE id = NEW.location_id;
  
  -- Get current stock for the material at the location
  SELECT COALESCE(SUM(
    CASE 
      WHEN entry_type IN ('in', 'adjustment') THEN quantity
      ELSE -quantity
    END
  ), 0) INTO current_stock
  FROM inventory_entries
  WHERE material_id = NEW.material_id 
  AND location_id = NEW.location_id;

  -- For outgoing movements, check if there's enough stock
  -- Skip check for adjustment type
  IF NEW.entry_type = 'out' THEN
    IF (current_stock - NEW.quantity) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for "%" at location "%". Current stock: %, Requested: %', 
        material_name, location_name, current_stock, NEW.quantity;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER check_stock_movement_trigger
  BEFORE INSERT ON inventory_entries
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_movement();