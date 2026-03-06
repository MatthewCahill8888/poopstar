# Poopstar — Product notes

## One-liner

Social app where you post AI cartoon poops, get popular, and claim ownership of toilets. Toilet ratings and “where to poop” details included.

## Flows

1. **Post flow**: Upload poop photo → Gen AI → brainrot cartoon → tag toilet (optional) → post. Post appears in feed and on toilet page.
2. **Ownership**: Per-toilet, the post with most likes is the “top poop”; its author is the current owner of that toilet’s poop (badge/leaderboard).
3. **Consumption**: User opens app (e.g. on toilet), sees “nearby poops” feed + can browse toilets, ratings, and top poops.
4. **Ratings**: Users rate toilets (cleanliness, privacy, paper, etc.); aggregate shown on toilet page and in listings.

## Open questions

- Auth: email/social login, handles, moderation.
- Gen AI: provider (Replicate, Stability, custom), prompt for “brainrot cartoon” style, cost/moderator.
- Geo: how to get “nearby” (browser geolocation, optional check-in at toilet).
- Toilet data: user-submitted only vs. import from Poop Map / OSM / other.
