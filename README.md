# Poopstar

A **social media app** built around poops and toilets. Unlike map/exploration apps (e.g. Poop Map), Poopstar is about **gaining popularity through your poops**: upload a photo, get a brainrot-style cartoon from Gen AI, post it, and compete to claim ownership of a toilet’s “top poop.”

## Core idea

- **Social-first**: Feed, likes, comments, and viral posts—not travel/exploration.
- **Gen AI twist**: Users upload a photo of their poop → AI turns it into a **brainrot cartoon** they can post.
- **Ownership game**: The most popular post from a given toilet lets that user **claim ownership** of that toilet’s poop.
- **Location-aware**: Scroll **nearby poop posts** while you’re on the toilet.
- **Practical + fun**: Toilet **ratings**, details on **where you can poop**, and availability—plus the social layer on top.

---

## Features

### 1. Poop posts (social feed)

- Upload photo of poop → **Gen AI** generates a brainrot cartoon version.
- Post the cartoon with optional caption, toilet tag, and location.
- Feed: **nearby** posts (e.g. “poops near you”) and/or global/trending.
- Like, comment, share; classic social engagement.

### 2. Toilet ownership

- Each **toilet** (venue/place) has a “top poop” (e.g. most liked post from that toilet).
- The author of that post **claims ownership** of that toilet’s poop (badge/status).
- Leaderboards: most owned toilets, most liked poops, etc.

### 3. Toilet ratings & details

- Rate toilets (cleanliness, privacy, paper, vibe, etc.).
- Show **where you can poop**: address, opening hours, accessibility, gender-neutral options.
- Aggregate ratings and “best poops” per toilet.

### 4. “Scroll on the toilet” experience

- Mobile-first: browse nearby poops and toilet info while on the toilet.
- Optional: “I’m here” / check-in at a toilet to boost relevance of that place in feed.

---

## Differentiation vs “Poop Map” style apps

| Aspect        | Poop Map–style        | Poopstar                    |
|--------------|------------------------|-----------------------------|
| **Roots**    | Travel / exploration   | Social media                |
| **Goal**     | Find places to poop    | Get popular via your poops  |
| **Content**  | Reviews / pins         | AI cartoon poops + posts    |
| **Mechanics**| Map + listings         | Feed, likes, ownership game |
| **Toilets**  | Info only              | Info + ratings + “top poop” |

---

## Current MVP implementation

- **Auth**: register, login, logout, and session cookie auth.
- **Feed**: geolocation-aware nearby feed with adjustable radius.
- **Posting**: image upload, AI cartoon endpoint, create post with geotag.
- **Social**: likes and comments on posts.
- **Toilets**: nearby toilet list, toilet detail pages, ratings, and ownership.
- **Profiles**: per-user profile page with posts and owned toilets.
- **Storage**: local JSON database (`data/db.json`) with seeded demo users/toilets/posts.

### Demo login

- `alex@example.com` / `password123`
- `zoe@example.com` / `password123`

### Geolocation

Geolocation is integrated into:
- Nearby feed queries (`/api/posts?lat=...&lng=...`)
- Nearby toilets queries (`/api/toilets?lat=...&lng=...`)
- Post creation (lat/lng required to publish)

---

## Repo structure

```
poopstar/
├── README.md
├── app/                # Next.js App Router
│   ├── layout.tsx      # nav + global layout
│   ├── page.tsx        # feed (nearby poops)
│   ├── post/           # create post (upload → AI cartoon → post)
│   └── toilets/       # list + [id] (ratings, details, top poop owner)
├── types/              # shared types (User, Toilet, PoopPost, ToiletRating)
├── docs/               # product + API notes
└── package.json
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and allow location access when prompted.
