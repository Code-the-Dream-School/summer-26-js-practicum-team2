# Sprout

**Plant your money. Watch it grow.**

Sprout is a friendly, gamified money-basics app for college freshmen and
recent grads. Bite-sized lessons (3–5 min) with instant-feedback quizzes
and a per-lesson plant-growth reward loop help first-paycheck learners
feel in control of their money — without a lecture.

## 🚀 Live Demo

- **Frontend Live Site:** https:/sprout-ctd.netlify.app/
- **Frontend Repo:** /frontend
- **Backend Live Site:** https://sprout-backend-x46w.onrender.com
- **Backend Repo:** /backend

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
- Vite or Create React App

### Backend

- Node.js
- Express.js
- REST API

### Database

- MongoDB (Mongoose)

### Tooling

- Git & GitHub
- dotenv (environment variables)
- ESLint / Prettier

## 📁 Project Structure

```text
project-root/
├── frontend/
│   ├── src/
|   |   ├── app             # Application-level configuration
│   │   │
│   │   │    └── router/    # Routes and navigation configuration
│   │   │
│   │   ├── assets/         # Images, icons, and other static assets
│   │   │
│   │   ├── components/     # Reusable React components
│   │   │   ├── layout/     # Shared page layout components
│   │   │   └── ui/         # Reusable UI components
│   │   │
│   │   ├── context/        # Global React contexts
│   │   │
│   │   ├── hooks/          # Shared custom React hooks
│   │   │
│   │   ├── pages/          # Route-level page components
│   │   │
│   │   ├── services/       # API requests and external services
│   │   │
│   │   ├── styles/         # Shared styles and Tailwind customization()
│   │   │
│   │   ├── utils/          # Shared helper functions
│   │   │
│   │   ├── App.jsx         # Main application component
│   │   │
│   │   ├── index.css       # Global styles and Tailwind import
│   │   │
│   │   └── main.jsx        # Application entry point
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v24+ recommended)
- npm
- MongoDB

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside the `backend` folder:

```env
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/summer-26-js-practicum-team2
# Cloud MongoDB (uncomment and replace <username> and <password> with your credentials)
#MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/summer-26-js-practicum-team2?retryWrites=true&w=majority

# SMTP configuration for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_or_smtp_password
FROM_EMAIL=your_email@gmail.com
# Optional: keep auth flows working in local dev when SMTP is unavailable.
# In production keep this false so mail failures surface immediately.
EMAIL_FAIL_OPEN=true

# Auth & Frontend URLs
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173

# Comma-separated frontend origins allowed to call this API (for CORS credentials)
# Example: CORS_ORIGINS=https://development--sprout-ctd.netlify.app,https://sprout-ctd.netlify.app,http://localhost:5173
CORS_ORIGINS=https://development--sprout-ctd.netlify.app,https://sprout-ctd.netlify.app,http://localhost:5173

# Cookie settings for cross-site deployments (Netlify + Render)
# For production cross-site auth: COOKIE_SAME_SITE=none and COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
```

Backend runs on:  
http://localhost:8080

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:  
http://localhost:5173

## 🧪 Available Scripts

### Frontend

Run commands from the `frontend` directory.

```bash
npm run dev # start the development server
npm run build # create the production build
npm run preview # preview the production build
npm run lint # check code with ESLint
npm run lint:fix # fix supported ESLint issues
npm run format # format files with Prettier
npm run format:check # check formatting without changing files
```

### Backend

```bash
npm run dev
```

### Running Frontend & Backend Concurrently

The root folder includes two development dependencies: **Concurrently** and **dotenv-cli**.

It also includes two scripts.

The first script is:

```bash
npm run setup
```
````

This script installs the root development dependencies, then installs the dependencies for both the `backend` and `frontend` folders.

The second script is:

```bash
npm run dev
```

This script uses **dotenv-cli** to load environment variables from the root `.env` file. If a port is defined there, it can be passed to the backend and frontend as needed.

It also uses **Concurrently** to start both the frontend and backend development servers at the same time from a single terminal.

```

## 🔐 API Overview

### Example Endpoints

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/items
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
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
