# URL Breve

A simple URL shortening service built with Node.js, Express 5, and PostgreSQL or MongoDB. Features unique short codes,
optional link expiration, vanity URLs, and asynchronous click tracking.

## Tech Stack

-   **Runtime & Framework:** Node.js, Express 5
-   **Database:** PostgreSQL (Prisma) or MongoDB (Mongoose)
-   **Validation:** Zod for schema validation
-   **Security:** Helmet.js, express-rate-limit
-   **Logging:** Pino
-   **Testing:** Vitest
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
-   PostgreSQL v12+ or MongoDB v4+

### Dev Setup

```bash
git clone git@github.com:cydneymikel/url-breve.git
cd url-breve

npm install
cp .env.example .env           # Configure DB_ADAPTER, DATABASE_URL, BASE_URL, PORT

# For PostgreSQL:
npm run prisma:migrate         # Apply schema
npx prisma generate            # Generate client

# For MongoDB:
# Just set DB_ADAPTER=mongo and DATABASE_URL in .env

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

| Variable              | Description                            | Required | Default |
| --------------------- | -------------------------------------- | -------- | ------- |
| DB_ADAPTER            | Database adapter (`postgres`, `mongo`) | Yes      |         |
| DATABASE_URL          | Database connection string             | Yes      | -       |
| PORT                  | Server port                            | No       | 3000    |
| BASE_URL              | Public base URL for short links        | Yes      | -       |
| SHORT_CODE_LENGTH     | Generated short code length            | No       | 7       |
| MAX_COLLISION_RETRIES | Max retries for short code collisions  | No       | 5       |

## Database

See [DATABASE_ADAPTERS.md](DATABASE_ADAPTERS.md) for adapter details.

## Testing

```bash
npm test                 # Run tests
npm run test:coverage    # Coverage report
```

## License

MIT

## Author

Cydney Auman
