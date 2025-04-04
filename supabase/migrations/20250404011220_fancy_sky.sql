/*
  # Prevent Negative Stock

  1. Changes
    - Add function to validate stock movements
    - Create trigger to prevent negative stock
    - Ensure stock never goes below 0
*/

-- Create function to validate stock movement
CREATE OR REPLACE FUNCTION check_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  current_stock NUMERIC;
BEGIN
  -- Get current stock for the material at the location
  SELECT COALESCE(SUM(
    CASE 
      WHEN entry_type = 'in' THEN quantity
      ELSE -quantity
    END
  ), 0) INTO current_stock
  FROM inventory_entries
  WHERE material_id = NEW.material_id 
  AND location_id = NEW.location_id;

  -- For outgoing movements, check if there's enough stock
  IF NEW.entry_type = 'out' THEN
    IF (current_stock - NEW.quantity) < 0 THEN
      RAISE EXCEPTION 'No hay suficiente stock disponible. Stock actual: %, Cantidad solicitada: %', 
        current_stock, NEW.quantity;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS check_stock_movement_trigger ON inventory_entries;
CREATE TRIGGER check_stock_movement_trigger
  BEFORE INSERT ON inventory_entries
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_movement();