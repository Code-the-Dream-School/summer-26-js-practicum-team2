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
- [Support](SUPPORT.md)

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
- XP, badges, and streak rewards

<!--
## 📸 Screenshots

Add screenshots or GIFs of key features here. -->

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
summer-26-js-practicum-team2/
├── .github/              # GitHub configuration and community policies
├── backend/              # Node.js/Express API
├── docs/                 # Documentation and Postman resources
├── frontend/             # React application
├── shared/               # Content shared across applications
├── package.json          # Root scripts and project metadata
├── CHANGELOG.md          # Record of project changes
├── CONTRIBUTORS.md       # Project contributors
└── README.md             # Project overview and setup instructions
```

See the [full project structure](docs/project-structure.md) for the detailed
folder and file breakdown.

## ⚙️ Setup & Installation

### Quick Start

```bash
npm run setup
npm run dev
```

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:8080

For full setup, scripts, testing, and API details, see:

- [Documentation Index](docs/README.md)
- [Development Setup](docs/development-setup.md)
- [Postman Backend Testing](docs/testing-postman.md)
- [API Overview](docs/api-overview.md)
- [Team and Collaboration Workflow](docs/contributing-workflow.md)
- [Roadmap and Known Limitations](docs/roadmap.md)

## 🙌 Acknowledgments

- Code the Dream mentors and practicum staff for guidance and review support
- The Sprout contributor team for collaborative design, implementation, and testing
- The maintainers of key open-source tools used in this project, including React, Vite, Express, MongoDB, Jest, Vitest, and Postman

## 📄 License

This project uses the license in the root [LICENSE](LICENSE) file.
