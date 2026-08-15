# Sprout

**Plant your money. Watch it grow.**

Sprout is a friendly, gamified money-basics app for college freshmen and
recent grads. Bite-sized lessons (3–5 min) with instant-feedback quizzes
and a per-lesson plant-growth reward loop help first-paycheck learners
feel in control of their money — without a lecture.

## 🚀 Live Demo

- **Frontend Live Site:** https://sprout-ctd.netlify.app/
- **Frontend Repo:** https://github.com/Code-the-Dream-School/summer-26-js-practicum-team2/tree/main/frontend
- **Backend Live Site:** https://sprout-backend-x46w.onrender.com
- **Backend Repo:** https://github.com/Code-the-Dream-School/summer-26-js-practicum-team2/tree/main/backend

## 🤝 Community Standards

- [Contributing Guidelines](.github/CONTRIBUTING.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security Policy](.github/SECURITY.md)

## 🧠 Problem Statement

Most young adults handle their first checking account, paycheck, and rent
payment with no formal money education. Existing personal-finance apps
either lecture, push wealth-management products, or assume the user already
speaks fluent finance — none of which fits a college freshman or a
first-paycheck recent grad.

- **Who is this for?** Single moms (Persona A, "Working Single Mom of Two") and Freshman in College (Persona B, "College Freshman").
- **Pain point:** They want to feel smarter about money but don't want a
  lecture, an advisor pitch, or a 30-minute reading assignment. They want a way to learn in between classes or shifts
- **Why this matters:** Small, confident money habits formed early
  compound. Sprout keeps the learning loop short (3–5 min per lesson) and
  makes the reward visible via the plant-growth mechanic.

## 🎯 Features

- User authentication (register, login, logout)
- CRUD operations for core resources
- Protected routes and authorization
- Responsive UI (mobile & desktop)
- Form validation and error handling
- RESTful API integration

## 📸 Screenshots

<!-- Add screenshots or GIFs of key features here. -->

## 🛠 Tech Stack

### Frontend

- React
- JavaScript (ES6+)
- HTML5
- CSS3 / Tailwind
- Vite
- Vitest + Testing Library

### Backend

- Node.js
- Express.js
- REST API
- Jest + Supertest

### Database

- MongoDB (Mongoose)

### Tooling

- Git & GitHub
- dotenv
- ESLint / Prettier

## 📁 Project Structure

```text
project-root/
├── frontend/
│   ├── src/
│   │   ├── app/            # Application-level configuration
│   │   │   └── router/     # Routes and navigation configuration
│   │   ├── context/        # Auth context, provider, and hook guard
│   │   ├── reducers/       # Shared state reducers
│   │   ├── hooks/          # Shared custom React hooks
│   │   ├── services/       # API requests and external services
│   │   ├── features/       # Domain feature modules (auth, dashboard, learn, lessons, legal)
│   │   ├── shared/         # Reusable UI elements (Button, Card, Input, Layouts, etc.)
│   │   ├── pages/          # Route-level view components
│   │   ├── utils/          # Shared helper functions
│   │   ├── test/
│   │   │   └── fixtures/   # Mock data for tests
│   │   ├── App.jsx         # Main application component
│   │   ├── main.jsx        # Application entry point
│   │   ├── index.css       # Global styles
│   │   ├── reset.css       # CSS reset/base styles
│   │   └── setupTests.js   # Frontend test setup
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v24+ required)
- npm
- MongoDB

### Node Version Management (Recommended)

This repo includes a `.nvmrc` file set to Node `24`.

- Windows: use `fnm` (recommended)
- macOS/Linux: use `nvm`

#### Windows (`fnm`) auto-switch setup

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

#### macOS/Linux (`nvm`) setup

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

#### `nvm-for-windows` note

`nvm-for-windows` does not support automatic `.nvmrc` switching.
If you use it, run this manually in the project root:

```powershell
nvm use 24
```

### Quick Start (Recommended)

```bash
npm run setup
npm run dev
```

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:8080

### Run A Single App

```bash
npm run development:frontend
npm run development:backend
```

Run backend in non-watch mode:

```bash
npm run start:backend
```

### Environment Setup

Copy the backend env template and fill in values:

```bash
copy backend\.env.example backend\.env
```

Mac/Linux:

```bash
cp backend/.env.example backend/.env
```

## 🧪 Available Scripts

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

## 🧪 Postman Backend Testing

Use the included Postman files to speed up backend testing across local and cloud environments:

- Collection: docs/postman/local-backend-api.postman-collection.json
- Environment (local): docs/postman/local-backend-api.postman_environment.json
- Environment (remote development): docs/postman/remote-dev-backend-api.postman_environment.json
- Environment (remote production): docs/postman/remote-backend-api.postman_environment.json

### Import And Run

1. Import the collection and all environment files into Postman.
2. Select one environment based on where you want to test:

- Local Backend API (`http://localhost:8080`)
- Remote Development Backend API (`https://sprout-backend-dev.onrender.com/`)
- Remote Production Backend API (`https://sprout-backend-x46w.onrender.com/`)

3. If testing local, start the backend first (`npm run dev` from root or backend).
4. Run in this order for end-to-end auth coverage: Register, Verify Email, Login.
5. Then run Dashboard, Quizzes, and Lessons requests.

Collection tests and scripts automatically capture and reuse these values:

- `verificationToken`
- `csrfToken`
- `sessionCookie`
- `resetToken`
- `quizAttemptId`

## 🔐 API Overview

### Routes Covered By Postman Collection

```text
GET    /api/hello

POST   /api/v1/users/register
GET    /api/v1/users/verify?token=...
POST   /api/v1/users/login
POST   /api/v1/users/logout
POST   /api/v1/users/forgot-password
POST   /api/v1/users/reset-password

GET    /api/v1/dashboard
POST   /api/v1/dashboard/events

GET    /api/v1/quizzes/progress
GET    /api/v1/quizzes/attempts
POST   /api/v1/quizzes/start
POST   /api/v1/quizzes/1.1.2/submit

GET    /api/v1/lessons/cashFlow/1.1
GET    /api/v1/lessons/progress?moduleId=cashFlow
PATCH  /api/v1/lessons/progress
```

## 🤝 Team & Collaboration

### Practicum Lead

- Frank Stepanski - [@frankstepanski](https://github.com/frankstepanski)

### Mentors

- Mario Martinez - [@mntri4](https://github.com/mntri4)
- Hector Gonzalez - [@hectarek](https://github.com/hectarek)

### Developers

- Berenice Rojas — [@berenicerojas](https://github.com/berenicerojas)
- Danylo Hetmanenko — [@DanyloHet](https://github.com/DanyloHet)
- Kristen Wishart — [@kwishart24](https://github.com/kwishart24)
- Maryzabeth Philip — [@BytesofStrength](https://github.com/BytesOfStrength)
- Mikey Nichols — [@mnichols08](https://github.com/mnichols08)

### Workflow

- GitHub Issues for task tracking
- Feature branches for development
- Pull Requests required for all merges
- Code reviews before merging to `main`, `development`, or `docs`

## 🧩 Development Process

- Agile / sprint-based workflow
- Backend API built before frontend integration
- MVP defined early
- Incremental feature development

## 📌 Known Issues / Limitations

- Limited role-based access control
- No automated tests yet
- Performance optimizations pending

## 🛣 Future Improvements

- Add automated testing (Jest, Supertest)
- Improve security and validation
- Add caching and performance improvements
- Dockerize the application

## 🙌 Acknowledgments

- Mentors
- Instructors
- Open-source libraries and tools

## 📄 License

This project is for educational purposes only.
