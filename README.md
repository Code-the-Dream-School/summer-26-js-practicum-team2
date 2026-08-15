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

### Quick Start

```bash
npm run setup
npm run dev
```

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:8080

For full setup, scripts, testing, and API details, see:

- [Development Setup](docs/development-setup.md)
- [Postman Backend Testing](docs/testing-postman.md)
- [API Overview](docs/api-overview.md)

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

- Code the Dream mentors and practicum staff for guidance and review support
- The Sprout contributor team for collaborative design, implementation, and testing
- The maintainers of key open-source tools used in this project, including React, Vite, Express, MongoDB, Jest, Vitest, and Postman

## 📄 License

This project uses the license in the root [LICENSE](LICENSE) file.
