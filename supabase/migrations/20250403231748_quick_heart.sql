/*
  # Fix stock_by_location view columns

  1. Changes
    - Drop and recreate the stock_by_location view with correct column ordering
    - Ensure all necessary columns are included
    - Fix column naming issues
*/

-- Drop the existing view
DROP VIEW IF EXISTS stock_by_location;

-- Recreate the view with correct column structure
CREATE VIEW stock_by_location AS
SELECT 
  m.id AS material_id,
  m.name AS material_name,
  m.unit,
  m.min_quantity,
  m.max_quantity,
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
  l.id, 
  l.name;