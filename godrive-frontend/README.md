# GoDrive — Frontend

React + Vite frontend for a car rental marketplace.

## Requirements
- Node.js 18 or newer
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Current frontend features
- Responsive landing page
- Search form with pickup/return date and time, and pickup city
- Car listing, filtering and sorting
- Car details
- Customer and owner demo registration/login
- Booking form with date/time validation and price estimate
- Customer booking dashboard
- Owner car-listing form and dashboard

## Demo limitations
This is the frontend milestone. Demo login and bookings use browser `localStorage`.
They are not secure and are not connected to a database. The payment screen is not
connected to a real gateway. The backend milestone will replace these demo functions
with Express APIs, MongoDB persistence, password hashing, JWT authentication,
availability checks, Cloudinary uploads and Razorpay order/payment verification.

## Suggested next backend API groups
- `/api/auth` — register, login, current user
- `/api/cars` — create, list, details, update, delete
- `/api/bookings` — create, availability, owner approval, cancel
- `/api/payments` — create Razorpay order, verify payment, webhook
- `/api/reviews` — ratings and reviews
- `/api/admin` — moderation and reporting

## Backend integration

1. Start the backend API on `http://localhost:5000`.
2. Copy `.env.example` to `.env` in this frontend folder (keep `VITE_API_URL=http://localhost:5000/api`).
3. Run `npm install` and `npm run dev`.
4. Register/login through the website. Customer and owner sessions now use the backend JWT.
5. Public car listings come from approved MongoDB car records. Booking requests and dashboards use the booking API.

The frontend stores the JWT in browser localStorage for this learning project. For a production deployment, consider secure httpOnly cookies and add CSRF protection, HTTPS, and a proper image-upload service.

## Admin dashboard

Sign in with the admin account created using the backend `npm run create-admin` command. The login page redirects admin users to `/admin`, or open `http://localhost:5173/admin` after logging in.

The admin dashboard displays summary statistics, registered users, all car listings, pending car approvals, and all bookings. It uses the protected `/api/admin/*` endpoints and the existing admin car review endpoint.

Frontend environment file (`.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

Restart Vite after changing `.env`.
