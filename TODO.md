# TODO

- **Multitenancy.** Storage is currently single-tenant (one shared Postgres dataset, no real user accounts — "login" is just a local mock flag). Adding real accounts means:
  - Real auth (e.g. Auth.js) with sessions, replacing the mock login page.
  - A `user_id` column on `areas` (and cascading scoping through `projects`/`workstreams`; `workstream_events` too, if events should stay private per user).
  - Every query in `src/lib/db/actions.ts` scoped to the current session's user.
