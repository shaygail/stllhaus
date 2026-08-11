-- Run in Supabase SQL editor (once) for team-managed market events.
CREATE TABLE IF NOT EXISTS market_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  date_label text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text NOT NULL,
  description text NOT NULL,
  image_path text,
  image_alt text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS market_events_start_date_idx ON market_events (start_date);
CREATE INDEX IF NOT EXISTS market_events_published_idx ON market_events (published);

-- Optional seed (safe to re-run)
INSERT INTO market_events (
  slug,
  name,
  date_label,
  start_date,
  end_date,
  location,
  description,
  image_path,
  image_alt,
  published
)
VALUES (
  'stratford-market-2026-08-15',
  'Stratford Market',
  'Saturday 15 August',
  '2026-08-15T08:00:00+12:00',
  '2026-08-15T13:00:00+12:00',
  'Stratford, Taranaki',
  'Find us at the Stratford Market with handcrafted matcha, cold brew, and ube drinks — made fresh for your slow moment.',
  '/ube.jpg',
  'STLL HAUS ube matcha drink, New Plymouth',
  true
)
ON CONFLICT (slug) DO NOTHING;
