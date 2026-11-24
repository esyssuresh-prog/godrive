# Rent A Car API – Backend starter

## Setup
1. Install Node.js and start MongoDB locally, or create a MongoDB Atlas database.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.
4. Run `npm run dev`.
5. Test `http://localhost:5000/api/health`.

## Authentication endpoints
- `POST /api/auth/register` – body: `{ "name": "Asha", "email": "asha@example.com", "password": "password123", "role": "customer" }`
- `POST /api/auth/login` – body: `{ "email": "asha@example.com", "password": "password123" }`
- `GET /api/auth/me` – header: `Authorization: Bearer YOUR_TOKEN`

Public registration only permits customer or owner roles. Admin accounts must be created through a controlled admin process, not public registration.
