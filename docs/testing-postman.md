# Postman Backend Testing

Use the included Postman files to speed up backend testing across local and cloud environments.

## Files

- Collection: `docs/postman/local-backend-api.postman-collection.json`
- Environment (local): `docs/postman/local-backend-api.postman_environment.json`
- Environment (remote development): `docs/postman/remote-dev-backend-api.postman_environment.json`
- Environment (remote production): `docs/postman/remote-backend-api.postman_environment.json`

## Import And Run

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
