# Troubleshooting: "Unexpected end of JSON input" on Vercel

If you still see **"Failed to execute 'json' on 'Response': Unexpected end of JSON input"** on the deployed site, try these in order.

---

## 1. Hard refresh / clear cache

Your browser may be using an **old JavaScript bundle** that still calls `.json()` on every response.

- **Chrome / Edge:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac), or open the site in an **Incognito/Private** window.
- **Firefox:** `Ctrl+Shift+R` or `Cmd+Shift+R`, or clear cache in Settings.

---

## 2. Confirm the latest code is deployed

1. In your repo, confirm your latest changes are committed and pushed to `main`.
2. In the **Vercel dashboard** → your project → **Deployments**, check that the **latest deployment** is from your last push and that the **status is "Ready"** (not building or failed).
3. Open the deployment URL from that latest deployment (not an old bookmark).

---

## 3. Find which request is failing

1. Open the Vercel site and **open DevTools** (F12 or right‑click → Inspect).
2. Go to the **Network** tab and enable "Preserve log" if available.
3. Refresh the page and reproduce the error.
4. In the Network list, look for a request that is **red** (failed) or has status **500** or **502**.
5. Click that request and check the **Response** tab:
   - If you see **HTML** (e.g. a long error page), the server returned an error page instead of JSON. The app is now written so API routes return JSON errors; if you still see HTML, the deployment may not have the latest code (see step 2).
   - If the response is **empty**, the function may have crashed before sending a body; redeploy and try again.

Knowing which URL fails (e.g. `/api/auth/me`, `/api/posts`, `/api/toilets`) helps narrow it down.

---

## 4. Check environment variables on Vercel

1. Vercel dashboard → your project → **Settings** → **Environment Variables**.
2. Ensure **`AUTH_SECRET`** is set (e.g. a long random string from `openssl rand -base64 32`).
3. Redeploy after changing env vars (Vercel usually prompts you).

---

## 5. Redeploy from Vercel

Sometimes a clean redeploy fixes odd behavior:

1. Vercel dashboard → your project → **Deployments**.
2. Open the **⋯** menu on the latest deployment → **Redeploy**.
3. Wait for the new deployment to finish, then test again with a **hard refresh** or in **Incognito**.

---

## Summary

Most often the cause is **cached old JS** (step 1) or **an old deployment** (step 2). After any fix, push to `main`, wait for Vercel to deploy, then do a hard refresh or use Incognito when testing.
