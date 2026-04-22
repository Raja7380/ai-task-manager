# 🧠 AI Task Manager

A tiny, full-stack SaaS app — **built to teach you real, industry-grade web development.**

Stack (what companies actually ship with in 2026):

- **Next.js 16** (App Router) + **TypeScript** — the most-used React framework.
- **Tailwind CSS** — fast, utility-first styling.
- **Prisma** + **SQLite** (easy to swap for Postgres in prod) — type-safe database access.
- **NextAuth v5** — email/password + Google OAuth, with JWT sessions and hashed passwords.
- **OpenAI** — optional AI-generated summaries of your tasks.
- **Zod** — runtime validation for all user input.

> **This project is a learning resource.** Every file has comments explaining *why* the code is the way it is, not just *what* it does.

---

## 🗺️ What you'll learn by reading this code

| Concept | Where to look |
|---|---|
| Next.js App Router (layouts, pages, Server Components) | `src/app/**` |
| Server Actions (form mutations without API routes) | `src/app/dashboard/actions.ts`, `src/app/(auth)/*/actions.ts` |
| Route handlers (traditional API endpoints) | `src/app/api/ai/summarize/route.ts` |
| Edge proxy / middleware (route guarding) | `src/proxy.ts`, `src/auth.config.ts` |
| Prisma schema & migrations | `prisma/schema.prisma`, `prisma/migrations/` |
| Prisma Client singleton (avoiding connection leaks) | `src/lib/prisma.ts` |
| Authentication (Credentials + OAuth, JWT sessions) | `src/auth.ts`, `src/auth.config.ts` |
| Password hashing with bcrypt | `src/auth.ts`, `src/app/(auth)/register/actions.ts` |
| Zod validation on the server | every `actions.ts` file |
| Optimistic UI with `useTransition` | `src/components/task-list.tsx` |
| Calling OpenAI safely from the server | `src/app/api/ai/summarize/route.ts` |
| Responsive Tailwind + dark mode | all components |

---

## 🚀 Quick start (5 minutes)

```bash
# 1. Clone
git clone https://github.com/Raja7380/ai-task-manager.git
cd ai-task-manager

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Then open .env and set AUTH_SECRET (generate with: openssl rand -base64 32)

# 4. Create the database (SQLite — no server needed)
npx prisma migrate dev

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000>. Register a new account. You're in!

> 💡 The AI summary button works **without** an OpenAI key (it falls back to a local heuristic). Add an `OPENAI_API_KEY` to your `.env` to enable real GPT-powered summaries.

---

## 📁 Project structure (annotated)

```
ai-task-manager/
├─ prisma/
│  ├─ schema.prisma          ← database schema (User, Task, Account…)
│  └─ migrations/            ← SQL change history, auto-generated
├─ src/
│  ├─ app/                   ← Next.js App Router
│  │  ├─ layout.tsx          ← root HTML, fonts, theme
│  │  ├─ page.tsx            ← landing page ("/")
│  │  ├─ globals.css         ← Tailwind + CSS variables
│  │  ├─ (auth)/             ← route group, not in the URL
│  │  │  ├─ login/           ← /login
│  │  │  └─ register/        ← /register
│  │  ├─ dashboard/          ← /dashboard (auth-protected)
│  │  │  ├─ layout.tsx       ← nav bar shown only in-app
│  │  │  ├─ page.tsx         ← task list
│  │  │  └─ actions.ts       ← create/update/delete tasks (Server Actions)
│  │  └─ api/
│  │     ├─ auth/            ← NextAuth request handler
│  │     └─ ai/summarize/    ← POST endpoint calling OpenAI
│  ├─ components/            ← reusable UI pieces (client components)
│  ├─ lib/
│  │  ├─ prisma.ts           ← PrismaClient singleton
│  │  └─ utils.ts            ← cn() classname helper
│  ├─ auth.config.ts         ← edge-safe auth config (used in proxy)
│  ├─ auth.ts                ← full auth config (Prisma + bcrypt)
│  └─ proxy.ts               ← Next 16 edge proxy (was "middleware")
├─ .env.example              ← template for your local .env
└─ package.json
```

---

## 🧠 Concepts, one by one

### 1. Server Components vs Client Components

- By default, every file in `src/app/**` is a **Server Component** — it runs on the server, has direct access to the database, and sends plain HTML to the browser.
- If a component needs state, effects, or event handlers, add `"use client"` at the top. See `src/components/new-task-form.tsx`.

### 2. Server Actions

Instead of building REST endpoints for every form, we write an `async` function with `"use server"` and pass it directly to `<form action={...}>`. Next.js wires up the network call for us.

Example: <src/app/dashboard/actions.ts> defines `createTask(formData)`. The form in `<NewTaskForm />` posts to it and we revalidate the page with `revalidatePath("/dashboard")`.

### 3. Authentication flow

1. User submits `/register` → `registerAction` hashes the password with bcrypt, inserts a `User`, then signs them in.
2. `signIn("credentials", …)` creates a JWT and sets it as a secure cookie.
3. Every request passes through `src/proxy.ts`, which uses the **edge-safe** `auth.config.ts` to check the cookie.
4. Server Components can call `await auth()` from `src/auth.ts` to get the full session (with DB lookup if needed).

Why two configs? `proxy.ts` runs on the Edge runtime, where Node APIs (Prisma, bcrypt) are unavailable. So we split the config: an edge-safe skeleton (`auth.config.ts`) and a full-featured Node version (`auth.ts`). This is a common NextAuth v5 pattern.

### 4. Prisma

- `schema.prisma` describes the shape of the database.
- `npx prisma migrate dev` generates SQL and applies it.
- `npx prisma studio` opens a visual database browser at `localhost:5555`.
- The Prisma Client gives us a type-safe query builder: `prisma.task.findMany({ where: { userId } })` is fully autocompleted.

### 5. Validation with Zod

Never trust client input. Every server-side entry point (Server Action, API route) parses input with a Zod schema before using it.

### 6. AI integration (safely)

We call OpenAI **from the server only** (`src/app/api/ai/summarize/route.ts`). The API key never touches the browser. If the key is missing, we fall back to a hard-coded heuristic summary — so contributors without an OpenAI account can still use the feature.

---

## 🧪 Common commands

```bash
npm run dev          # start dev server (Turbopack)
npm run build        # production build
npm run start        # run the production build
npm run lint         # ESLint
npx prisma studio    # visual DB browser
npx prisma migrate dev --name <name>   # create a new DB migration
```

---

## 🌍 Deploying to production

1. Push this repo to GitHub.
2. Import it on [Vercel](https://vercel.com/new).
3. In the project settings, add the environment variables from `.env.example`.
4. For the database, sign up for a free Postgres (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.com)) and:
   - Change `provider = "sqlite"` → `provider = "postgresql"` in `prisma/schema.prisma`.
   - Set `DATABASE_URL` to the Postgres connection string.
   - Run `npx prisma migrate deploy` in Vercel's build command.

---

## 🗺️ Roadmap — things to add next (great learning exercises)

- [ ] **Tags / projects** — many-to-many relations in Prisma.
- [ ] **Search + filtering** — URL-state-driven queries.
- [ ] **Real-time sync** — WebSockets via Pusher/Ably or Server-Sent Events.
- [ ] **Stripe subscriptions** — Pro tier with unlimited tasks & GPT-4.
- [ ] **E2E tests** — Playwright, mocked auth, CI on GitHub Actions.
- [ ] **Dockerfile + docker-compose** — Postgres + the web app for offline dev.

---

## 📚 Learning resources (if you want to go deeper)

- [Next.js official tutorial](https://nextjs.org/learn)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [NextAuth v5 docs](https://authjs.dev/)
- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [Fullstack Open](https://fullstackopen.com/en/) — free, rigorous course

---

## License

MIT — do whatever you want with this code.
