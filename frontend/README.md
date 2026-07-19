# Frontend Setup

Create `frontend/.env.local` with your own values:

NODE_ENV=development
MONGODB_URI=<your_mongodb_connection_string>
NEXTAUTH_URL=http://localhost:3000/rentalproperty/api/auth
NEXTAUTH_URL_INTERNAL=http://localhost:3000/rentalproperty/api/auth
NEXTAUTH_SECRET=<your_strong_secret>
GOOGLE_CLIENT_ID=<your_google_oauth_client_id>
GOOGLE_CLIENT_SECRET=<your_google_oauth_client_secret>
