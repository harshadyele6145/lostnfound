# CampusFind

Campus lost-and-found web application built for TechRush 2026. Students can report lost or found items, see matching suggestions, submit ownership claims, and approve or reject incoming claims.

## Run locally

### 1. Configure MongoDB and the API

Install and start PostgreSQL locally, or create a hosted PostgreSQL database (Neon, Supabase, or similar). Then create `server/.env` from `server/.env.example` and set:

```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/campusfind?schema=public
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
# optional, but recommended:
CAMPUS_EMAIL_DOMAIN=yourcollege.edu
```

Create the database tables, then start the API:

```powershell
cd server
npm install
npm run db:generate
npm run db:push
npm run dev
```

### 2. Configure and start the client

Create `client/.env` from `client/.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
```

Then run:

```powershell
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

### 3. Add demo content

With the API database connection configured:

```powershell
cd server
npm run seed
```

Demo account: `demo@campusfind.edu` / `Demo123!`

## Deployment

### API: Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repository. `render.yaml` creates the API service.
3. Add a hosted PostgreSQL connection string as `DATABASE_URL`.
4. Set `CLIENT_URL` to your deployed Vercel URL, for example `https://campusfind.vercel.app`.
5. Set `CAMPUS_EMAIL_DOMAIN` to your college email domain.

### Client: Vercel

1. Import the same GitHub repository in Vercel.
2. Set the project root directory to `client`.
3. Add environment variable `VITE_API_URL` with `https://YOUR-RENDER-SERVICE.onrender.com/api`.
4. Deploy, then copy the Vercel URL to Render's `CLIENT_URL` setting and redeploy the API.

## Demo flow

1. Sign in with the demo account.
2. Create a lost or found report with a photo.
3. Open **Dashboard**, choose a report, and select **Find possible matches**.
4. Submit a claim and sign in as the report owner.
5. Open **My claims**, then approve or reject it. Approval resolves the report.

## Important production note

Uploaded images are stored locally in `server/uploads` for the hackathon MVP. Most cloud hosts use temporary storage, so production uploads should move to Cloudinary, AWS S3, or similar persistent object storage.
