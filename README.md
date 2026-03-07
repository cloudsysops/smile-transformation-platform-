# Smile Transformation Platform

Plataforma web para coordinación y hospitalidad de experiencias (USA LLC). Los servicios médicos son facturados por clínicas en Colombia. Stack: **Next.js 16** (App Router), **TypeScript**, **Supabase** (Auth, Postgres, Storage), **Stripe**, **Vercel**.

## Importante: ejecutar desde la raíz del proyecto

Todos los comandos (`npm run ...`, `./scripts/...`) deben ejecutarse desde la carpeta del proyecto. Si clonaste el repo y el código está en `smile-transformation-platform/`:

```bash
cd smile-transformation-platform
```

Luego ya puedes usar `npm run dev`, `./scripts/deploy_verify.sh ...`, etc.

**Conectar Supabase y Vercel:** [docs/CONECTAR_SUPABASE_VERCEL.md](docs/CONECTAR_SUPABASE_VERCEL.md) — pasos para crear proyecto Supabase, migraciones, variables y deploy en Vercel.

## Arrancar en local

```bash
cd smile-transformation-platform   # si no estás ya en la raíz del proyecto
npm install
cp .env.example .env.local         # rellenar Supabase (y Stripe cuando aplique)
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Tests (Vitest) |
| `npm run verify` | Verificación pre-deploy: lint + test + build |
| `npm run smoke:assets` | Validación básica de assets (admin) |
| `./scripts/smoke_test.sh [URL]` | Smoke test: /api/health y /api/health/ready (default: http://localhost:3000) |
| `./scripts/verify_production.sh <URL>` | Verificación producción: health, ready, status, landing (requiere URL) |
| `./scripts/deploy_verify.sh <URL>` | Deploy completo: env, verify, migraciones (opcional), smoke contra URL |
| `./scripts/verify_all.sh` | Igual que verify (lint + test + build) |
| `./scripts/sprint-start.sh` | Inicio de sprint (verify + objetivo) |
| `./scripts/sprint-end.sh` | Cierre de sprint (verify + checklist PR/deploy) |
| `./scripts/dev-local.sh` | DEV con Supabase en Docker |

## Verificación pre-deploy

Antes de desplegar o hacer merge a `main`, ejecutar:

```bash
npm run verify
```

Equivale a `lint` → `test` → `build`. Si todo pasa, el código está listo para deploy. Checklist completo de producción: [docs/DEPLOY_CHECKLIST.md](docs/DEPLOY_CHECKLIST.md).

## Variables de entorno

- `.env.example` y `.env.local.example` listan las variables necesarias.
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Stripe (cuando se use): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, etc.

## Documentación

- **[Conectar Supabase y Vercel](docs/CONECTAR_SUPABASE_VERCEL.md)** — Guía rápida para enlazar la app con Supabase y Vercel.
- [Estado de módulos](STATUS.md)
- [Modelo de datos (MVP)](docs/DATA_MODEL.md)
- [Pasos de prueba](docs/TEST_STEPS.md)
- **[DEV / QA / Prod (Docker local → producción)](docs/DEV_QA_PROD.md)** – Entornos y cómo arrancar con Docker.
- **[Checklist producción (vender)](docs/PRODUCCIÓN_CHECKLIST.md)** – Lista para salir a producción.
- **[Sprint process](docs/SPRINT.md)** – Cadencia, ceremonias, sprint actual (Deploy & prod).
- **[Usar Cursor desde el móvil (GitHub + Cursor Mobile)](docs/CURSOR_MOBILE.md)**
- **[Conectar GitHub con Vercel y desplegar](docs/VERCEL_DEPLOY.md)**
- **[Checklist pre-deploy Vercel (env + verificación)](docs/VERCEL_PRE_DEPLOY_CHECKLIST.md)**
- **[Checklist deploy y verificación en producción](docs/DEPLOY_CHECKLIST.md)**
- **[Plan de trabajo: salir a producción y vender](docs/PLAN_TRABAJO_PRODUCCION.md)** — Fases 1–3, tareas y agentes
- **[Cómo crear el primer admin](docs/PRIMER_ADMIN.md)** — Supabase Auth + profiles.role
- **[Checklist primera venta](docs/CHECKLIST_PRIMERA_VENTA.md)** — Pasos para la primera venta en prod
- **[Mejoras priorizadas (antes y después de lanzar)](docs/MEJORAS.md)**
- **[Plan de trabajo para producción](docs/PLAN_TRABAJO_PRODUCCION.md)** — Fases, tareas por agente, criterios de aceptación.
- **[Briefings por agente](docs/TAREAS_AGENTES_BRIEFINGS.md)** — Textos para asignar tareas a agentes o equipo.
- **[Guía paso a paso a producción](docs/GUIA_PASO_A_PASO_PRODUCCION.md)** — Instrucciones detalladas para Supabase, Vercel, Stripe y pruebas (sin experiencia previa).
- **[Auditoría: lo que tenemos y lo que falta (para ChatGPT)](docs/AUDITORIA_PARA_CHATGPT.md)**

## Usar con Cursor (desktop o móvil)

- Reglas del proyecto para la IA: `.cursor/rules.md`.
- Para **abrir este proyecto en Cursor Mobile** (iPhone/Android) o en **Cursor Agents** (web): sigue la guía [docs/CURSOR_MOBILE.md](docs/CURSOR_MOBILE.md) (crear repo en GitHub, conectar remoto, push, abrir desde la app o la web).

## Deploy

Compatible con Vercel. Configurar env en el dashboard y desplegar desde la rama `main`.
