# TRANSITIQ — MongoDB Edition
Smart Transportation. Smarter Insights!

## Structure
- `frontend/` — static HTML, CSS and browser JavaScript. Deploy separately (Netlify, Vercel or GitHub Pages).
- `backend/` — Express REST API and Mongoose models. Deploy separately (Render, Railway, etc.).
- MongoDB Atlas is used as the database.

## Local setup
1. Install Node.js 18+.
2. Create a MongoDB Atlas cluster and database user. Add your current IP to Atlas Network Access.
3. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.
4. In `backend/`, run `npm install`, then `npm start`.
5. (Optional) Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` in `backend/.env`, then run `npm run seed:admin` from `backend/` to create the admin login.\n6. Open `frontend/login.html` or serve the `frontend/` folder using VS Code Live Server.
7. Edit `frontend/config.js` and set `window.TRANSITIQ_API_URL` to the backend URL. For local testing it is `http://localhost:3000`; for deployment use the deployed API base URL without a trailing slash.

## Deploy separately
### Backend
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT` (PORT is usually supplied by the host).
- Set `CLIENT_URL` to the exact deployed frontend origin, e.g. `https://your-site.netlify.app`.

### Frontend
- Publish directory: `frontend`
- Before deploying, set `frontend/config.js`:
  `window.TRANSITIQ_API_URL = "https://your-backend-domain";`
- The frontend is static and can be hosted on Netlify, Vercel or GitHub Pages.

## MongoDB collections
`users`, `buses` (seat layout embedded), `routes`, `schedules`, `bookings`, `passwordresetotps`.

## Important
- Do not upload `.env` or real credentials to GitHub.
- Existing MySQL data is not automatically copied. This project starts with a new MongoDB database; add buses/routes/schedules through the admin portal or seed them separately.
- For production-grade simultaneous seat booking, enforce a unique reservation document per `{schedule_id, seat_id}` or use a MongoDB transaction on a replica-set deployment. The included demo checks availability before writing and is intended for the academic project demonstration.
- Forgot-password OTP is printed to the backend terminal for local demonstration, matching the original project's demo behavior.
