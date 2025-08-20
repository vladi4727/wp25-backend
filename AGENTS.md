# Twinder Backend — Agent Guide

## How to run
- Requirements: Node 18+, npm
- Install & start:
  npm i
  npm run dev
- Server: http://localhost:3000

## Env vars (local .env file, never commit)
PORT=3000
MONGO_URI=<your Atlas URI with /twinder at the end>
JWT_SECRET=<random secret>
UPLOAD_DIR=uploads
CORS_ORIGIN=http://localhost:5173

## What I need added (each in a separate PR)
1. Fix wiring & CORS
   - Add GET /api/health -> { ok: true }
   - Add CORS with origin from env
   - Serve /uploads before the SPA fallback

2. User filters
   - Add preferences (gender, ageMin, ageMax, distanceKm)
   - Add profile.location (GeoJSON + 2dsphere index)
   - PUT /api/users/me/preferences to save
   - Update candidates query to apply filters, exclude self/swiped/matched/banned

3. Admin API
   - Extend User with role (user/admin), verified, banned
   - Add admin-only routes: list users, verify, ban/unban, delete
   - Candidates query should exclude banned users
