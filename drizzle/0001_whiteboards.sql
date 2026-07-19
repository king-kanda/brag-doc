CREATE TABLE IF NOT EXISTS whiteboards (
  id text PRIMARY KEY,
  area_id text NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  workstream_id text REFERENCES workstreams(id) ON DELETE CASCADE,
  name text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whiteboards_area_id ON whiteboards(area_id);
CREATE INDEX IF NOT EXISTS idx_whiteboards_workstream_id ON whiteboards(workstream_id);
