# TravelBuddy - Travel Companion App 🌍

A modern travel companion app that allows friends to create trips, share live locations, and discover places together.

## Features ✨

- 🔐 **Secure Authentication** - Session-based auth with JWT tokens
- 🗺️ **Live Location Sharing** - Real-time location tracking for group trips
- 👥 **Trip Management** - Create trips and invite friends with unique codes
- 🎨 **Funky Design** - Retro-inspired UI with vibrant gradients
- 📱 **Responsive** - Works perfectly on desktop and mobile
- 🔒 **Privacy Focused** - Location data only shared with trip members

## Tech Stack 🛠️

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT with secure HTTP-only cookies
- **UI Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React

## Quick Start 🚀

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd travel-buddy-app
npm install
\`\`\`

### 2. Environment Setup

Copy the environment template:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your environment variables in `.env.local`:

\`\`\`env
# Required: Get from Neon Console (https://neon.tech)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Required: Generate a random 32+ character string
SESSION_SECRET="your-super-secret-session-key-here"

# Optional: For local development
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
\`\`\`

### 3. Database Setup

Create your database tables by running the SQL script:

\`\`\`bash
# Copy the contents of scripts/001-create-tables.sql
# and run it in your Neon SQL Editor
\`\`\`

Or use the Neon CLI:

\`\`\`bash
# Install Neon CLI
npm install -g @neondatabase/cli

# Run migrations
neon sql-file scripts/001-create-tables.sql
\`\`\`

### 4. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your app! 🎉

## Environment Variables Guide 📋

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Neon | `postgresql://user:pass@host/db?sslmode=require` |
| `SESSION_SECRET` | Secret key for JWT token signing | `your-32-character-random-string` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXTAUTH_URL` | Base URL for authentication | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |
| `GOOGLE_MAPS_API_KEY` | For places discovery (future feature) | - |

## Database Schema 🗄️

### Users Table
- `id` - Primary key
- `email` - Unique user email
- `password_hash` - Bcrypt hashed password
- `name` - User's full name
- `avatar_url` - Profile picture URL
- `role` - User role (default: 'user')
- `created_at` - Account creation timestamp

### Trips Table
- `id` - Primary key
- `name` - Trip name
- `description` - Trip description
- `creator_id` - Foreign key to users
- `invite_code` - Unique 10-character invite code
- `is_active` - Trip status
- `created_at` - Trip creation timestamp

### Trip Members Table
- `id` - Primary key
- `trip_id` - Foreign key to trips
- `user_id` - Foreign key to users
- `joined_at` - Join timestamp

### User Locations Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `trip_id` - Foreign key to trips
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `accuracy` - Location accuracy in meters
- `timestamp` - Location update timestamp

## Getting Your Database URL 🔗

### Using Neon (Recommended)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or select existing one
3. Go to "Connection Details"
4. Copy the "Connection string" 
5. Paste it as your `DATABASE_URL`

### Example Neon Connection String:
\`\`\`
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-1.aws.neon.tech/dbname?sslmode=require
\`\`\`

## Generating Session Secret 🔐

Generate a secure session secret:

\`\`\`bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Or use an online generator (for development only)
\`\`\`

## Project Structure 📁

\`\`\`
travel-buddy-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   └── page.tsx          # Landing page
├── components/            # Reusable components
├── lib/                  # Utilities and configurations
│   ├── auth/             # Authentication logic
│   └── db/               # Database schema and connection
├── scripts/              # Database migration scripts
└── middleware.ts         # Route protection middleware
\`\`\`

## Available Scripts 📜

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
\`\`\`

## Deployment 🚀

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `DATABASE_URL` - Your production database URL
- `SESSION_SECRET` - A secure random string (different from development)
- `NEXTAUTH_URL` - Your production domain

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Notes 🔒

- Never commit `.env.local` or `.env` files
- Use strong, unique session secrets
- Regularly rotate API keys
- Enable SSL/TLS in production
- Review location sharing permissions

## Support 💬

If you encounter any issues:

1. Check the environment variables are correctly set
2. Ensure your database is accessible
3. Verify all required dependencies are installed
4. Check the browser console for errors

## License 📄

This project is licensed under the MIT License.

---

Happy traveling! 🎒✈️
