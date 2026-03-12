# HardScope Challenge

Monorepo with a **Vite + React + Mantine** frontend and a **Node.js + Express** backend.

## Prerequisites

- **Node.js** (LTS recommended, e.g. 18+)

## Project structure

- **`frontend/`** – Vite, React, TypeScript, Mantine
- **`backend/`** – Express, TypeScript

## How to run

### Backend

Create a `.env` file in the backend/ folder (`backend/.env`):

| Variable                    | Description                                        |
| --------------------------- | -------------------------------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL                          |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key                          |
| `SOCIAVAULT_API_KEY`        | API key from [SociaVault](https://sociavault.com/) |

Once the `.env` file is created run the following commands to start up the backend

```bash
cd backend
npm install
npm dev
```

Backend runs at **http://localhost:3000**.

### Frontend

Create a `.env.local` file in the frontend/ folder (`frontend/.env.local`):

| Variable       | Description           |
| -------------- | --------------------- |
| `VITE_API_URL` | http://localhost:3000 |

Once the `.env.local` file is created run the following commands to start up the frontend

```bash
cd frontend
npm install
npm dev
```

Frontend runs at **http://localhost:5173**.

(Make sure to run `npm install` in `frontend` and `backend` at least once before using these.)

## Data source

I used the [SociaVault](https://sociavault.com/) API as the single data source for this project. SociaVault provides access to both YouTube and TikTok creator and video metrics through one API, which let me focus on ingestion, normalization, and product design instead of managing multiple provider integrations. Even though both platforms are served by the same API, the response shapes for YouTube channel videos and TikTok profile videos differ significantly. Handling those differences and mapping them into a single schema gave practical experience with multi-source normalization and informed how I structured the backend and database.

## Tech Stack

Frontend: I chose React for its ecosystem and my experience with it, which helped speed up development. I used TypeScript so API responses and component props stay predictable and easier to understand and maintain.

Backend: I used Node.js and Express to keep a single language across the stack. Express is minimal for the few endpoints I needed, and integrating with Supabase is straightforward. I used TypeScript on the server as well for the same typing benefits. Supabase provided managed Postgres and a simple client so I didn’t have to host or operate a database myself.

## Architecture Decisions and Tradeoffs

I decided to go with Node.js for a quick setup and to keep a single language across the stack. If the project scaled to handle more creators and heavier analytic calculations I would make the change to a Python server for its ecosystem around managing large datasets.

I chose Supabase for its quick setup and straightforward integration with Node. Supabase's API doesn't allow raw SQL and the ORM doesn't handle complex queries, so I had to implement SQL functions in Supabase and call them from the server. Although this does keep the code clean, editing and versioning them is separate from the rest of the codebase. As the number of queries grew I would revisit this implementation.

## What I would add with more time

The dashboard is designed to give brands high-level creator signals: how creators perform on each platform, whether their views are consistent or driven by a few viral videos, and which platform they favor. That should help partnership teams decide who to work with.

With another week, I’d go deeper on campaign and conversion outcomes. For example, TikTok data can distinguish organic posts from ads and from TikTok Shop promotions. I’d want to dive deeper and show conversion-oriented metrics. For example engagement on paid ads, or items sold / attributed to a creator’s TikTok Shop video. That way brands can see not just reach but actual results of a partnership.

I would also like to add a few quality of life features to the site as well: scheduled ingestion, handling edge cases, etc.

## API

- **`GET /creators`** – List creators; optional platforms filter (e.g. youtube, tiktok).
- **`GET /analytics`** – Aggregated analytics (summary, by platform, by creator, top videos); optional startDate, endDate, creatorIds, platforms.
- **`POST /load-creators`** – Trigger ingestion from SociaVault for all creators; no body.
