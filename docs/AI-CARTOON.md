# Cartoon / Brainrot Gen AI

The **post** flow turns an uploaded poop photo into a cartoon-style image using Gen AI, then posts that cartoon.

## Flow

1. User selects a photo → client uploads it to **0x0.st** (public, anonymous) so the AI service can fetch it.
2. Client calls **`/api/ai/cartoon`** with that image URL.
3. If **`REPLICATE_API_TOKEN`** is set, the API runs [Replicate](https://replicate.com)’s **catacolabs/cartoonify** model (image → cartoon) and returns the result URL.
4. If the token is not set, the API returns a placeholder image URL.
5. The client then creates the post with the original URL and the cartoon URL.

## Setup (real cartoon generation)

1. Create an account at [replicate.com](https://replicate.com).
2. Get an API token: [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens).
3. Set it in your environment:
   - **Local:** add to `.env.local`: `REPLICATE_API_TOKEN=r8_xxxx...`
   - **Vercel:** Project → Settings → Environment Variables → add `REPLICATE_API_TOKEN`.

New Replicate accounts get free credits; after that runs are paid per prediction (cartoonify is low cost per run).

## Model

- **catacolabs/cartoonify** on Replicate – converts a photo to a cartoon style. Good for a “brainrot” / stylized look.
- To switch to another model (e.g. different style), change `REPLICATE_CARTOON_VERSION` and the `input` schema in `app/api/ai/cartoon/route.ts`.

## Public image URL

The AI service must be able to **fetch** the image from the internet. So the client uploads the file to **0x0.st** first; that returns a public URL. That URL is used for both the cartoon API and as the “original” image URL on the post. 0x0.st keeps files for a limited time (see their docs); for long-term storage you’d replace this with your own storage (e.g. S3, Vercel Blob) and use that URL instead.
