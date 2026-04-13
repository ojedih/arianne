# Arianne

Multi-tenant appointment booking platform for service businesses. Each business gets a branded booking page at `/{handle}/book` and a management portal at `/manage`.

## Stack

- **Next.js 16** / React 19 / TypeScript
- **Prisma 7** + PostgreSQL
- **Tailwind CSS v4**
- **Zustand** (booking state), **SWR** (data fetching)
- **Resend** (transactional email)
- **Zod** + **React Hook Form** (validation)

## Project Structure

```
app/
  [businessHandle]/book/   # Customer-facing multi-step booking flow
  api/                     # Route handlers (appointments, services, availability, etc.)
  manage/                  # Staff/owner management portal
prisma/
  schema.prisma            # Data model
  migrations/              # Migration history
```

### Booking Flow

`vehicle` → service type → `addons` → `datetime` → `details` → `summary` → `confirmation`

### Data Model Highlights

- **Business** — tenant root; holds branding, availability config, and tax settings
- **ServiceType / ServicePackage / ServiceItem** — hierarchical service catalog with bundled and add-on items
- **Customer / CustomerVehicle** — per-tenant customer records with vehicle history
- **Appointment** — denormalizes vehicle and customer snapshots so history is preserved after edits; includes a `cancelToken` for self-service cancellation

## Local Development

**Prerequisites:** Node.js 20+, Docker

```bash
# 1. Start the database
docker compose up -d

# 2. Install dependencies
npm install

# 3. Push the schema and generate the Prisma client
npx prisma migrate dev

# 4. Start the dev server
npm run dev
```

The app is available at `http://localhost:3000`.

## Environment Variables

Create a `.env` file at the project root:

```env
DATABASE_URL=postgresql://arianne:arianne@localhost:5432/arianne
RESEND_API_KEY=re_...
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
