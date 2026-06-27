# Finance Planner

Monorepo for the Finance Planner application.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run quality checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Run the local PostgreSQL service:

```bash
docker compose up
```

The PostgreSQL service is exposed on `localhost:5432` with:

- Database: `family_dreams`
- User: `family`
- Password: `family`

## Environment Variables

Copy the example files before running each app locally:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

API variables:

- `NODE_ENV`: runtime environment, usually `development`
- `PORT`: API HTTP port, default `3333`
- `DATABASE_URL`: PostgreSQL connection string

Web variables:

- `VITE_API_URL`: base URL for the API, default `http://localhost:3333`
