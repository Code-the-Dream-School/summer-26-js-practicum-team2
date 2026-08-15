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

## Available Scripts

### Root (run from project root)

```bash
npm run setup
npm run predev
npm run dev
npm run lint
npm run format
npm run test
npm run test:backend
npm run test:frontend
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
