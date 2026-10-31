# itelect4-backend

[![CI](https://github.com/FONS061905/itelect4-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/FONS061905/itelect4-backend/actions/workflows/ci.yml)

Express + TypeScript + MongoDB API for the Lost & Found Tracker (ITELECT4).
The frontend lives in a separate repo (`itelect4-project`) and is deployed separately.

## Stack

- Express, Mongoose (MongoDB Atlas)
- JWT auth (`jsonwebtoken`), password hashing (`bcryptjs`)
- TypeScript, `tsx` for development

## Setup

```bash
npm install
cp .env.example .env   # then fill in MONGODB_URI and JWT_SECRET
npm run seed           # once, to add the campus locations
npm run dev
```

The API runs on `http://localhost:4000`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs `src/server.ts` with `tsx`, restarts on save (no type-check) |
| `npm run build` | Type-checks and compiles `src/` into `dist/` |
| `npm start` | Runs the compiled `dist/server.js` (run `build` first) |
| `npm run seed` | Puts the campus locations into the database (safe to run again) |
| `npm run typecheck` | Type-checks without writing `dist/` |

## Environment variables

| Name | Description |
| --- | --- |
| `PORT` | Port to listen on (default `4000`) |
| `MONGODB_URI` | Atlas connection string, with the database name after `.net/` |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CORS_ORIGIN` | Frontend address(es) allowed to call the API, comma-separated (default `http://localhost:5173`) |

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Server and database status |
| POST | `/api/auth/register` | – | Create an account (`name`, `email`, `password`) |
| POST | `/api/auth/login` | – | Returns `{ token, user }` |
| GET | `/api/locations` | – | All campus locations |
| GET | `/api/locations/:code` | – | One location by code |
| GET | `/api/items` | Bearer | Items you reported, newest first |
| GET | `/api/items/:id` | Bearer | One of your items |
| POST | `/api/items` | Bearer | Report an item (`title`, `type`, `location`, `description?`) |
| PATCH | `/api/items/:id` | Bearer | Update your own item (e.g. `status`) |
| DELETE | `/api/items/:id` | Bearer | Delete your own item |

Every item route only sees the items of the user in the token. Another
user's item returns `404` instead of `403`, so the API never reveals whether
an id exists.

## Project structure

```
src/
  server.ts          loads .env, connects to MongoDB, starts the server
  app.ts             middleware, routes, 404 and error handlers
  config/db.ts       Mongoose connection
  middleware/auth.ts requireAuth (Bearer token check)
  models/User.ts     user schema, password hashing
  models/Item.ts     lost/found item schema
  models/Location.ts campus location schema
  routes/auth.ts     register / login
  routes/items.ts    item CRUD
  routes/locations.ts public location list
  data/locations.ts  the locations npm run seed writes
  seed.ts            seed script
  types/index.ts     shared types
```
