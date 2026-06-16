-- Muse previews bucket: service-role only (admin tool issues signed URLs).
CREATE POLICY "muse previews service all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'muse-previews')
  WITH CHECK (bucket_id = 'muse-previews');