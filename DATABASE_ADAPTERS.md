# Database Adapters

url-breve supports multiple database backends through an adapter pattern.

## Supported Adapters

### 1. PostgreSQL (via Prisma)

Uses Prisma ORM with PostgreSQL

**Environment Variables:**

```bash
DB_ADAPTER=postgres
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database>
```

### 2. MongoDB (via Mongoose)

Uses Mongoose ODM with MongoDB

**Environment Variables:**

```bash
DB_ADAPTER=mongo
DATABASE_URL=mongodb://<username>:<password>@localhost:27017/<database>
```
