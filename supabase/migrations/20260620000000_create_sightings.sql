CREATE TABLE IF NOT EXISTS sightings (
  id UUID PRIMARY KEY,
  state TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('US', 'CA', 'MX')),
  date TEXT NOT NULL,
  time TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'ui' CHECK (source IN ('ui', 'shortcut')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
