# Sprout

**Plant your money. Watch it grow.**

Sprout is a friendly, gamified money-basics app for college freshmen and
recent grads. Bite-sized lessons (3–5 min) with instant-feedback quizzes
and a per-lesson plant-growth reward loop help first-checking-accout and
first-paycheck learners feel in control of their money — without a lecture.


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
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

Backend runs on:  
http://localhost:5000

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
npm start
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
- Code reviews before merging to `main`, `develpment` or `docs`

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
