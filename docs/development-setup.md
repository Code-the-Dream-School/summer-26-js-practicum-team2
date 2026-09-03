# Development Setup

## Prerequisites

- Node.js (v24+ required)
- npm
- MongoDB

## Node Version Management (Recommended)

This repo includes a `.nvmrc` file set to Node `24`.

- Windows: use `fnm` (recommended)
- macOS/Linux: use `nvm`

### Windows (`fnm`) auto-switch setup

1. Install `fnm`.
2. Add this to your PowerShell profile so Node auto-switches on folder change:

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

3. In the project root, run:

```powershell
fnm install
fnm use
```

### macOS/Linux (`nvm`) setup

In the project root, run:

```bash
nvm install
nvm use
```

For auto-switch on directory change, add this to `~/.zshrc` or `~/.bashrc`:

```bash
autoload -U add-zsh-hook
load-nvmrc() {
  local nvmrc_path
  nvmrc_path="$(nvm_find_nvmrc)"
  if [ -n "$nvmrc_path" ]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

### `nvm-for-windows` note

`nvm-for-windows` does not support automatic `.nvmrc` switching.
If you use it, run this manually in the project root:

```powershell
nvm use 24
```

## Quick Start (Recommended)

```bash
npm run setup
npm run dev
```

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:8080

## Run A Single App

```bash
npm run development:frontend
npm run development:backend
```

Run backend in non-watch mode:

```bash
npm run start:backend
```

## Environment Setup

Copy the backend env template and fill in values:

```bash
copy backend\.env.example backend\.env
```

Mac/Linux:

```bash
cp backend/.env.example backend/.env
```

`backend/.env` is ignored by Git. Keep all OAuth client secrets in that local file or in
the deployment platform's secret store.

## Social Sign-In Setup

Google and GitHub sign-in are optional. A provider cannot complete sign-in until both its
client ID and client secret are set in `backend/.env`.

1. Create a Google OAuth 2.0 client for a web application in Google Cloud and a GitHub
   OAuth App in GitHub Developer Settings.
2. Configure these local callback URLs in the provider dashboards:

```text
Google authorized redirect URI: http://localhost:8080/api/v1/auth/google/callback
GitHub authorization callback URL: http://localhost:8080/api/v1/auth/github/callback
```

3. Add the credentials to `backend/.env`:

```dotenv
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/v1/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:8080/api/v1/auth/github/callback
```

4. Run `npm run dev`, then open `http://localhost:5173/login` and choose a provider.

OAuth must begin as a browser navigation, not a fetch request or Postman request. After a
successful provider callback, the backend creates an HTTP-only session cookie and redirects
to `/oauth/callback`, where the frontend loads the signed-in user. A failed or cancelled
attempt returns to `/login?error=oauth_failed`.

### Production OAuth Configuration

For each deployed environment, set `CLIENT_URL` to the frontend origin, `API_URL` to the
public backend origin, and `CORS_ORIGINS` to include the frontend origin. Register the
corresponding deployed callback URL for each provider:

```text
<API_URL>/api/v1/auth/google/callback
<API_URL>/api/v1/auth/github/callback
```

Use HTTPS in production and update the provider dashboard before deploying a changed
frontend or backend URL. Never put OAuth client secrets in frontend environment variables.

### Testing OAuth

Automated tests verify Sprout's OAuth routes, callback handling, and frontend states without
using real Google or GitHub accounts. Run `npm run test:backend`, `npm run test:frontend`,
and `npm run test:e2e` to include their respective OAuth coverage.

## Available Scripts

### Root (run from project root)

```bash
npm run setup
npm run dev
npm run lint
npm run format
npm run test
npm run test:backend
npm run test:frontend
npm run test:e2e
npm run start:backend
npm run build:frontend
```

### Frontend (run from frontend)

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run test:watch
```

### Backend (run from backend)

```bash
npm run dev
npm run start
npm run test
npm run lint
npm run lint:fix
npm run format
npm run format:check
```
