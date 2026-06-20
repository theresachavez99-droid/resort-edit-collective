CREATE POLICY "Service role manages day-images bucket"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'day-images')
WITH CHECK (bucket_id = 'day-images');