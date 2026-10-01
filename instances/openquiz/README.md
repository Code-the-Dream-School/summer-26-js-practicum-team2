# open.quiz Orientation Instance

This instance uses the open.quiz introduction package and a green palette. Its
identity, logo, favicon, default module, and theme are configured independently from the platform
core.

## Run Locally

1. Run `npm run setup` to install dependencies and create local environment files, including this
   instance's ignored `.env` file.
2. Set a private `JWT_SECRET` and any OAuth/email credentials in the root `.env`. The instance-local
   file selects the separate `openquiz_instance` MongoDB database by default; replace its `MONGO_URI`
   for a hosted database.
3. Start the instance with `npm run dev:openquiz`; the site uses `http://localhost:5180` and the API
   uses `http://localhost:8081`.
4. In another terminal, run `npm run instance:seed:openquiz` to import the orientation curriculum.
5. Open the site and choose **Explore lessons** to preview the first lesson without an account.
6. Register an account and promote the first administrator through a trusted database bootstrap
   process. The platform does not yet include first-admin onboarding.

## Brand Assets

The preset points its logo and favicon to `/instance-assets/openquiz-brand.svg`. Put an alternate
logo, favicon, or homepage graphic under `frontend/public/instance-assets` and set
`VITE_APP_LOGO_URL`, `VITE_APP_FAVICON_URL`, or `VITE_APP_HERO_IMAGE_URL` in `settings.env`.
The package also supplies Nova and Kit as lesson character avatars.
