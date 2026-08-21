# Postman Collections

Use the shared environment files with the collection that matches the workflow:

- `public-backend-api.postman-collection.json`: public lesson preview and quiz answer checks.
- `user-backend-api.postman-collection.json`: registration, authentication, dashboard, lessons, progress, and quiz attempts.
- `admin-backend-api.postman-collection.json`: admin status, user listing, lesson module CRUD, nested lesson CRUD, and lesson import.

The admin collection requires an authenticated admin session. The local environment's `lessonImportSecret` is only needed for the legacy service-secret import request; admin-session imports use the admin session and CSRF token.

The original `local-backend-api.postman-collection.json` remains as the combined regression collection.
