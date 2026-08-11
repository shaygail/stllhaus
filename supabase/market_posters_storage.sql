-- Deprecated: poster storage is included in admin_setup.sql.
-- Safe to re-run if you only need the bucket.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'market-posters',
  'market-posters',
  true,
  4194304,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read market posters" ON storage.objects;
CREATE POLICY "Public read market posters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'market-posters');
