# URL Breve

A simple URL shortening service built with Node.js, Express 5, and PostgreSQL. Features unique short codes, optional
link expiration, vanity URLs, and asynchronous click tracking.

## Tech Stack

-   **Runtime & Framework:** Node.js, Express 5
-   **Database & ORM:** PostgreSQL with Prisma
-   **Validation:** Zod for schema validation
-   **Security:** Helmet.js, express-rate-limit
-   **Logging:** Pino
-   **Testing:** Jest
-   **ID Generation:** nanoid

## Features

-   Unique short code generation (non-sequential)
-   Optional TTL (expiration dates)
-   Vanity URLs (custom aliases) with collision handling
-   Asynchronous click tracking
-   Health & status endpoints for monitoring

## Getting Started

### Prerequisites

-   Node.js v18+
-   PostgreSQL v12+

### Installation

```bash
git clone <repository-url>
cd url-breve

npm install
cp .env.example .env           # Configure DATABASE_URL, BASE_URL, PORT

npm run prisma:migrate         # Apply schema to PostgreSQL
npx prisma generate            # Generate Prisma client

npm run dev                    # Start server in development mode
```

## API

**Base URL:** `http://localhost:3000`

### 1. Create Short URL

**POST** `/shorten`

| Field    | Type   | Description                       | Required |
| -------- | ------ | --------------------------------- | -------- |
| original | string | Full URL to shorten               | Yes      |
| alias    | string | Optional vanity URL               | No       |
| expires  | string | ISO 8601 timestamp for expiration | No       |

**Example Request Body**

```json
{
    "original": "https://example.com/long-page?q=query&v=1",
    "alias": "my-project-link",
    "expires": "2024-12-31T23:59:59Z"
}
```

### 2. Redirect

**GET** `/:shortCode`

Performs a 302 redirect to the original URL. Validates existence and expiration. Records clicks asynchronously.

### 3. Monitoring

-   **GET** `/health` – Basic uptime check
-   **GET** `/health/status` – Service statistics (total links, active links)

## Configuration

| Variable              | Description                           | Required | Default |
| --------------------- | ------------------------------------- | -------- | ------- |
| PORT                  | Server port                           | No       | 3000    |
| BASE_URL              | Public base URL for short links       | Yes      | -       |
| DATABASE_URL          | PostgreSQL connection string          | Yes      | -       |
| SHORT_CODE_LENGTH     | Generated short code length           | No       | 7       |
| MAX_COLLISION_RETRIES | Max retries for short code collisions | No       | 5       |

## Database Schema (Prisma)

**Shorten** – Core link data: id, short, original, alias, created, expires, active

-   Indexes: Unique on `short` and `alias`

**Click** – Tracking events: id, urlId, timestamp

-   Relationship: `urlId` → `Shorten.id`

## Scripts

```bash
npm start                # Production server
npm run dev              # Development server with auto-reload
npm run prisma:migrate   # Apply database migrations
npm test                 # Run Jest tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Coverage report
```

## License

MIT

## Author

Cydney Auman
