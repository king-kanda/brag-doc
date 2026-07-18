CREATE TABLE IF NOT EXISTS areas (
  id text PRIMARY KEY,
  name text NOT NULL,
  descriptor text NOT NULL DEFAULT '',
  color text NOT NULL,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  owner text NOT NULL DEFAULT 'You',
  week_starts_on integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  area_id text NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  descriptor text NOT NULL DEFAULT '',
  owner text NOT NULL DEFAULT 'You',
  next_milestone_date text NOT NULL DEFAULT '',
  next_milestone_label text NOT NULL DEFAULT '',
  need_to_know text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workstreams (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  descriptor text NOT NULL DEFAULT '',
  status text NOT NULL,
  priority integer NOT NULL,
  blocker text,
  details text NOT NULL DEFAULT '',
  next_steps text NOT NULL DEFAULT '',
  target_date text NOT NULL DEFAULT '',
  date_tag text NOT NULL,
  difficulty integer NOT NULL,
  enjoyment integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workstream_events (
  id text PRIMARY KEY,
  area_id text NOT NULL,
  area_name text NOT NULL,
  project_id text NOT NULL,
  project_name text NOT NULL,
  workstream_id text NOT NULL,
  workstream_name text NOT NULL,
  workstream_descriptor text NOT NULL DEFAULT '',
  from_status text,
  to_status text NOT NULL,
  "timestamp" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_area_id ON projects(area_id);
CREATE INDEX IF NOT EXISTS idx_workstreams_project_id ON workstreams(project_id);
CREATE INDEX IF NOT EXISTS idx_events_area_id ON workstream_events(area_id);
