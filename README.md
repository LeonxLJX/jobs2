# Commercial Full-Stack Project Portfolio

> Liu Xin · liuzhaoxing373@gmail.com · GitHub: https://github.com/LeonxLJX
>
> Five independent, runnable full-stack commercial MVPs covering enterprise collaboration, AI SaaS, admin dashboards, content publishing, and membership payments.

---

## 📦 Projects

| # | Project | Stack | Highlights |
|---|---------|-------|-----------|
| 1 | [Multi-tenant Team Document Collaboration](./team-doc-collaboration) | NestJS + Vue 3 + Element Plus + PostgreSQL | RBAC permissions, document version history, real-time sync |
| 2 | [AI Q&A SaaS System](./ai-rag-saas) | Next.js 14 + Prisma + PostgreSQL + Mock RAG | Document vectorization, RAG retrieval, quota subscriptions |
| 3 | [Enterprise Admin Dashboard](./enterprise-admin) | NestJS + Vue 3 + Element Plus + MySQL | Dynamic routing, button-level permissions, analytics dashboards |
| 4 | [Content Scheduling Tool](./content-scheduler) | Next.js 14 + Prisma + PostgreSQL + node-cron | Drafts, scheduled publishing, analytics, email notifications |
| 5 | [Membership & Payments Site](./membership-payment) | NestJS + Vue 3 + Stripe + PostgreSQL | Membership tiers, check-ins, Stripe checkout, webhooks |

---

## 🚀 Quick Start

Each project is a self-contained runnable MVP. Enter its directory and follow its README:

```bash
cd team-doc-collaboration   # or ai-rag-saas / enterprise-admin / content-scheduler / membership-payment
cp .env.example .env        # copy the environment template
npm install                 # install deps (run for backend and frontend separately)
npm run dev                 # start the dev server
```

> SQLite / local file storage is used by default for zero-setup runs; switch to PostgreSQL / MySQL via `.env`.

---

## 📐 Conventions

- **Code**: variables, functions, and class names in English
- **Stack**: mixed per resume — NestJS + Vue 3 alongside Next.js full-stack
- **Completeness**: runnable MVPs (core business loop + key pages + DB schema)

---

## 📂 Workspace Structure

```
.
├── README.md                          # this file
├── REQUIREMENTS.md                    # master requirements
├── team-doc-collaboration/            # project 1
├── ai-rag-saas/                       # project 2
├── enterprise-admin/                  # project 3
├── content-scheduler/                 # project 4
└── membership-payment/                # project 5
```

Each project directory contains:

- `README.md` — project documentation
- `docs/REQUIREMENTS.md` — detailed requirements
- `package.json` / `.env.example` — dependencies and environment variables
- `backend/` + `frontend/` (NestJS + Vue 3 projects) or a root-level app (Next.js projects)
- Database schema (Prisma schema or SQL files)

---

## 🔧 Global Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | Vue 3, Next.js 14, TypeScript, Pinia, TailwindCSS, Element Plus |
| Backend | Node.js, NestJS, Express, RESTful APIs, JWT |
| Database | PostgreSQL, MySQL, SQLite (MVP default), Redis |
| Jobs | node-cron, async queues |
| DevOps | Git, Docker (optional), Docker Compose (optional) |
| Integrations | Stripe payments, webhooks, file storage, email notifications |

---

## 📞 Contact

- **Name**: Liu Xin
- **Email**: liuzhaoxing373@gmail.com
- **GitHub**: https://github.com/LeonxLJX
