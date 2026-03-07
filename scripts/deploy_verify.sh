#!/usr/bin/env bash
# Deploy verification: env, build, migraciones (opcional), smoke en URL.
# Uso (desde cualquier carpeta; el script entra en la raíz del proyecto):
#   ./smile-transformation-platform/scripts/deploy_verify.sh https://tu-app.vercel.app
#   cd smile-transformation-platform && ./scripts/deploy_verify.sh https://tu-app.vercel.app
#
# Requisitos: npm, curl. Opcional: supabase CLI (para migraciones), jq (para salida).

set -e
# Ir siempre a la raíz del proyecto (carpeta que contiene package.json y scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

BASE_URL="${1:?Usage: $0 <BASE_URL>}"
ENV_FILE="${ENV_FILE:-.env.local}"
FAIL=0

echo "=== Deploy verify: $BASE_URL ==="
echo ""

# --- 1. Cargar env (si existe) para comprobar variables
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE" 2>/dev/null || true
  set +a
  echo "[1/5] Env file: $ENV_FILE (loaded)"
else
  echo "[1/5] Env file: $ENV_FILE (not found, using current shell env)"
fi

# --- 2. Comprobar variables requeridas (sin imprimir valores)
REQUIRED=(
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
)
MISSING=()
for v in "${REQUIRED[@]}"; do
  eval "val=\${$v:-}"
  if [ -z "$val" ]; then
    MISSING+=("$v")
  fi
done
if [ ${#MISSING[@]} -gt 0 ]; then
  echo "[2/5] Env: MISSING (${MISSING[*]})"
  echo "      Set them in $ENV_FILE or in Vercel for production."
  FAIL=1
else
  echo "[2/5] Env: OK (all required vars set)"
fi

# --- 3. Lint + test + build
echo "[3/5] Running: npm run verify"
if npm run verify >/dev/null 2>&1; then
  echo "      Verify: OK"
else
  echo "      Verify: FAILED (run 'npm run verify' for details)"
  FAIL=1
fi

# --- 4. Migraciones Supabase (opcional)
echo "[4/5] Migrations (optional)"
if command -v supabase >/dev/null 2>&1; then
  if supabase status >/dev/null 2>&1; then
    echo "      Pushing migrations (supabase db push)..."
    if supabase db push 2>/dev/null; then
      echo "      Migrations: OK"
    else
      echo "      Migrations: push failed or not linked. Run manually in Supabase SQL Editor if needed."
    fi
  else
    echo "      Supabase CLI not linked. Run migrations manually (see docs/GUIA_PASO_A_PASO_PRODUCCION.md)."
  fi
else
  echo "      Supabase CLI not installed. Run migrations manually in Supabase SQL Editor."
fi

# --- 5. Smoke / verify production contra BASE_URL
echo "[5/5] Smoke test: $BASE_URL"
if curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 "$BASE_URL/api/health" | grep -q 200; then
  echo "      /api/health: 200"
else
  echo "      /api/health: FAIL (no 200 or unreachable)"
  FAIL=1
fi
if curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 "$BASE_URL/api/health/ready" | grep -q 200; then
  echo "      /api/health/ready: 200"
else
  echo "      /api/health/ready: not 200 (check Supabase config in production)"
  FAIL=1
fi
if curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 "$BASE_URL/api/status" | grep -q 200; then
  echo "      /api/status: 200"
else
  echo "      /api/status: FAIL"
  FAIL=1
fi
if curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 10 "$BASE_URL/" | grep -q 200; then
  echo "      Landing: 200"
else
  echo "      Landing: FAIL"
  FAIL=1
fi

echo ""
echo "---"
if [ $FAIL -eq 0 ]; then
  echo "Deploy verify: PASSED"
  echo "Optional: run ./scripts/verify_production.sh $BASE_URL for full JSON output."
  echo "Optional: test Stripe webhook (Stripe Dashboard → Send test webhook, or: stripe trigger checkout.session.completed)"
  exit 0
else
  echo "Deploy verify: FAILED (fix the steps above)"
  exit 1
fi
