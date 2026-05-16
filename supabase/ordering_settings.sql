-- Run in Supabase SQL editor (once) for admin-controlled ordering hours.
CREATE TABLE IF NOT EXISTS ordering_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO ordering_settings (id, settings)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
