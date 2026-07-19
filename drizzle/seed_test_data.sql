INSERT INTO areas (id, name, descriptor, color, archived, owner, week_starts_on) VALUES
  (gen_random_uuid()::text, 'Test Area', 'For testing', '#ff6b6b', false, 'You', 1)
RETURNING id AS test_area \gset

INSERT INTO projects (id, area_id, week_start, descriptor, owner, next_milestone_date, next_milestone_label, need_to_know) VALUES
  (gen_random_uuid()::text, :'test_area', '2026-07-13', '', 'You', '', '', '')
RETURNING id AS test_project \gset

INSERT INTO workstreams (id, project_id, name, descriptor, status, priority, blocker, details, next_steps, target_date, date_tag, difficulty, enjoyment) VALUES
  (gen_random_uuid()::text, :'test_project', 'Test workstream one', 'Testing', 'progress', 1, NULL, 'Details go here.', 'Next step here.', '25 Jul', 'ontrack', 3, 3),
  (gen_random_uuid()::text, :'test_project', 'Test workstream two', 'Testing', 'done', 2, NULL, 'Details go here.', 'Next step here.', '20 Jul', 'complete', 2, 4),
  (gen_random_uuid()::text, :'test_project', 'Test workstream three', 'Testing', 'notstarted', 3, NULL, 'Details go here.', 'Next step here.', '30 Jul', 'ontrack', 1, 2);
