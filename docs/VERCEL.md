# Deploy Poopstar on Vercel

## 1. Push your code to GitHub

Make sure your repo is on GitHub (e.g. `https://github.com/MatthewCahill8888/poopstar`).

## 2. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use **Continue with GitHub**).
2. Click **Add New…** → **Project**.
3. **Import** your `poopstar` repository.
4. Leave the defaults:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./
   - **Build Command:** `next build`
   - **Output Directory:** (default)
   - **Install Command:** `npm install`

## 3. Environment variables

Before deploying, add:

| Name                   | Value                 | Notes |
|------------------------|-----------------------|--------|
| `AUTH_SECRET`          | (long random string)  | Used to sign session cookies. Generate with: `openssl rand -base64 32` |
| `REPLICATE_API_TOKEN`  | (optional)            | For real cartoon generation. Get a token at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens); new accounts get free credits. Without it, the app shows a placeholder image instead of AI cartoon. |

1. In the import screen, open **Environment Variables**.
2. Add `AUTH_SECRET` (required) and optionally `REPLICATE_API_TOKEN`.
3. Click **Deploy**.

## 4. After deploy

- Vercel will give you a URL like `https://poopstar-xxx.vercel.app`.
- Every push to `main` will trigger a new deployment.

---

## Production note: data persistence

The app currently uses a **JSON file** (`data/db.json`) for storage. On Vercel’s serverless platform the filesystem is **read-only**, so:

- **Registrations, posts, likes, comments, and ratings will not persist** across requests or deployments.
- The site will build and run, but any write (sign up, post, etc.) may fail or not be saved.

For a real production site you’ll need a database, for example:

- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Supabase](https://supabase.com) (Postgres + auth)
- Any hosted Postgres or MySQL

Then replace the file-based logic in `lib/db.ts` with calls to that database. Until then, Vercel is best for **previewing the UI and flow** and for **static/front-end** use.
