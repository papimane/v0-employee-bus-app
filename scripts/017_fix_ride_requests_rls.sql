-- Fix RLS policies for ride_requests table to allow drivers to accept requests

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Drivers can update ride requests they accept" ON ride_requests;
DROP POLICY IF EXISTS "Service role can manage all ride requests" ON ride_requests;

-- Allow drivers to update ride requests when accepting them
CREATE POLICY "Drivers can update ride requests they accept"
ON ride_requests
FOR UPDATE
TO authenticated
USING (
  status = 'pending' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'driver'
  )
)
WITH CHECK (
  status = 'accepted' AND
  driver_id = auth.uid()
);

-- Allow service role to manage all ride requests (for admin operations)
CREATE POLICY "Service role can manage all ride requests"
ON ride_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
