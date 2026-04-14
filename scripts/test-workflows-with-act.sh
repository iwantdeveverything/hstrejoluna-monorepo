#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if ! command -v act >/dev/null 2>&1; then
  echo "ERROR: 'act' is not installed."
  echo "Install: https://github.com/nektos/act"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is required for act."
  exit 1
fi

ACT_IMAGE="${ACT_IMAGE:-ghcr.io/catthehacker/ubuntu:act-latest}"
ACT_EVENT_PR_FILE="${ACT_EVENT_PR_FILE:-.github/act/events/pull_request.json}"
ACT_EVENT_PUSH_FILE="${ACT_EVENT_PUSH_FILE:-.github/act/events/push-master.json}"

if [[ ! -f "${ACT_EVENT_PR_FILE}" ]]; then
  echo "ERROR: Missing pull_request event file: ${ACT_EVENT_PR_FILE}"
  exit 1
fi

if [[ ! -f "${ACT_EVENT_PUSH_FILE}" ]]; then
  echo "ERROR: Missing push event file: ${ACT_EVENT_PUSH_FILE}"
  exit 1
fi

act_args=(
  "-P" "ubuntu-latest=${ACT_IMAGE}"
  "--container-architecture" "linux/amd64"
)

if [[ -f ".github/act/env.local" ]]; then
  act_args+=("--env-file" ".github/act/env.local")
fi

if [[ -f ".github/act/vars.local" ]]; then
  act_args+=("--var-file" ".github/act/vars.local")
fi

if [[ -f ".github/act/secrets.local" ]]; then
  act_args+=("--secret-file" ".github/act/secrets.local")
fi

echo "==> Validating workflows"
act "${act_args[@]}" -W .github/workflows/ci.yml --validate
act "${act_args[@]}" -W .github/workflows/cd-cloudrun.yml --validate

echo "==> CI dry-run"
act "${act_args[@]}" pull_request -W .github/workflows/ci.yml -e "${ACT_EVENT_PR_FILE}" -n

if [[ "${ACT_FAIL_REQUIRED_CHECK:-false}" == "true" ]]; then
  echo "==> CI forced-failure simulation (expected non-zero)"
  set +e
  act "${act_args[@]}" pull_request -W .github/workflows/ci.yml -e "${ACT_EVENT_PR_FILE}" -j quality --env ACT_FAIL_REQUIRED_CHECK=true
  ci_exit=$?
  set -e
  if [[ "${ci_exit}" -eq 0 ]]; then
    echo "ERROR: CI was expected to fail but succeeded."
    exit 1
  fi
  echo "OK: CI failed as expected (exit ${ci_exit})."
else
  echo "==> CI full run"
  act "${act_args[@]}" pull_request -W .github/workflows/ci.yml -e "${ACT_EVENT_PR_FILE}" -j quality
fi

echo "==> CD dry-run"
act "${act_args[@]}" push -W .github/workflows/cd-cloudrun.yml -e "${ACT_EVENT_PUSH_FILE}" -n

echo "==> CD local simulation run"
act "${act_args[@]}" push -W .github/workflows/cd-cloudrun.yml -e "${ACT_EVENT_PUSH_FILE}"

echo
echo "Done. Local workflow simulation completed."
