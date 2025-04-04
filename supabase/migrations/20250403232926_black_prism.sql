/*
  # Fix Locations Table RLS Policies

  1. Changes
    - Enable RLS on locations table if not already enabled
    - Create policy for reading locations data
*/

-- Enable RLS on locations table
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policy for reading locations
CREATE POLICY "locations_select_policy" 
ON locations
FOR SELECT 
TO authenticated 
USING (true);