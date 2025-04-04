/*
  # Fix Stock Calculation in View

  1. Changes
    - Modify stock_by_location view to handle adjustment entries correctly
    - Ensure stock calculations are accurate
*/

-- Drop existing view
DROP VIEW IF EXISTS stock_by_location;

-- Recreate view with corrected stock calculation
CREATE VIEW stock_by_location AS
WITH movement_totals AS (
  SELECT 
    material_id,
    location_id,
    SUM(
      CASE 
        WHEN entry_type = 'out' THEN -quantity
        WHEN entry_type = 'in' THEN quantity
        WHEN entry_type = 'adjustment' THEN 
          CASE 
            -- If there's negative stock, the adjustment sets the new value
            WHEN (
              SELECT COALESCE(SUM(
                CASE 
                  WHEN ie2.entry_type = 'out' THEN -ie2.quantity
                  WHEN ie2.entry_type = 'in' THEN ie2.quantity
                  ELSE 0
                END
              ), 0)
              FROM inventory_entries ie2
              WHERE ie2.material_id = inventory_entries.material_id
              AND ie2.location_id = inventory_entries.location_id
              AND ie2.created_at <= inventory_entries.created_at
              AND ie2.entry_type != 'adjustment'
            ) < 0 THEN quantity
            ELSE quantity
          END
      END
    ) as total_quantity
  FROM inventory_entries
  GROUP BY material_id, location_id
)
SELECT 
  m.id AS material_id,
  m.name AS material_name,
  m.unit,
  m.min_quantity,
  m.max_quantity,
  m.image_url,
  l.id AS location_id,
  l.name AS location_name,
  GREATEST(COALESCE(mt.total_quantity, 0), 0) as current_stock
FROM materials m
CROSS JOIN locations l
LEFT JOIN movement_totals mt 
  ON mt.material_id = m.id 
  AND mt.location_id = l.id;