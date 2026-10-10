# database/

- `app.sqlite` — the SQLite3 database. Tables are created by the migrations, and the launch content is seeded, the first time the API starts.
- `uploads/leads/` — private photos attached to quote requests (served only through short-lived signed URLs to signed-in admins).
- `media/` — images uploaded by admins for the public site (gallery, services, about photo), served at `/media/*`.

Delete `app.sqlite` to reset everything back to the launch content.
