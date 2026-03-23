#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/root/.openclaw/workspace/nkv-front"
LOG_DIR="/root/.openclaw/workspace/memory/test-reports"
mkdir -p "$LOG_DIR"

TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
LOG_FILE="$LOG_DIR/nkv-e2e-$TS.log"

run_all() {
  echo "=== NKV E2E CRON RUN @ $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
  cd "$REPO_DIR"

  echo "[1/4] git pull"
  git pull --ff-only

  echo "[2/4] load env"
  set -a
  source /root/.config/openclaw/nkv.env
  source /root/.config/openclaw/nkv-stripe-test.env
  set +a

  echo "[3/4] run mocked checkout tests"
  npm run test:e2e:mock

  echo "[4/4] run real checkout tests"
  npm run test:e2e:real
}

if run_all > "$LOG_FILE" 2>&1; then
  echo "=== RESULT: PASS ===" >> "$LOG_FILE"
else
  echo "=== RESULT: FAIL ===" >> "$LOG_FILE"
fi

# Keep latest pointer
ln -sfn "$LOG_FILE" "$LOG_DIR/latest.log"
