#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "ERROR: 'gcloud' is not installed."
  echo "Install: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: 'curl' is required."
  exit 1
fi

GCP_PROJECT_ID="${GCP_PROJECT_ID:-}"
GCP_REGION="${GCP_REGION:-us-central1}"
GAR_REPOSITORY="${GAR_REPOSITORY:-apps}"
CLOUD_RUN_SERVICE_PORTFOLIO="${CLOUD_RUN_SERVICE_PORTFOLIO:-portfolio}"
CLOUD_RUN_SERVICE_SALMON="${CLOUD_RUN_SERVICE_SALMON:-maestros-del-salmon}"
CLOUD_RUN_SMOKE_PATH_PORTFOLIO="${CLOUD_RUN_SMOKE_PATH_PORTFOLIO:-/}"
CLOUD_RUN_SMOKE_PATH_SALMON="${CLOUD_RUN_SMOKE_PATH_SALMON:-/maestros-del-salmon}"
GCP_WIF_PROVIDER="${GCP_WIF_PROVIDER:-}"
GCP_WIF_SERVICE_ACCOUNT="${GCP_WIF_SERVICE_ACCOUNT:-}"
DOMAIN_APEX="${DOMAIN_APEX:-hstrejoluna.com}"
DOMAIN_WWW="${DOMAIN_WWW:-www.hstrejoluna.com}"

if [[ -z "${GCP_PROJECT_ID}" ]]; then
  echo "ERROR: GCP_PROJECT_ID is required."
  exit 1
fi

active_account="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' || true)"
if [[ -z "${active_account}" ]]; then
  echo "ERROR: No active gcloud account. Run 'gcloud auth login' first."
  exit 1
fi

echo "Using gcloud account: ${active_account}"
echo "Project: ${GCP_PROJECT_ID}"
echo "Region: ${GCP_REGION}"
echo

echo "==> Artifact Registry repository"
gcloud artifacts repositories describe "${GAR_REPOSITORY}" \
  --project "${GCP_PROJECT_ID}" \
  --location "${GCP_REGION}" \
  --format='value(name,format,mode)'

if [[ -n "${GCP_WIF_PROVIDER}" ]]; then
  echo
  echo "==> Workload Identity Provider"
  if [[ "${GCP_WIF_PROVIDER}" =~ ^projects/([^/]+)/locations/global/workloadIdentityPools/([^/]+)/providers/([^/]+)$ ]]; then
    wif_pool="${BASH_REMATCH[2]}"
    wif_provider="${BASH_REMATCH[3]}"
    gcloud iam workload-identity-pools providers describe "${wif_provider}" \
      --project "${GCP_PROJECT_ID}" \
      --location "global" \
      --workload-identity-pool "${wif_pool}" \
      --format='value(name,state,attributeMapping.google.subject)'
  else
    echo "WARN: GCP_WIF_PROVIDER format not recognized, expected full resource path."
  fi
else
  echo "WARN: GCP_WIF_PROVIDER not set, skipping WIF provider verification."
fi

if [[ -n "${GCP_WIF_SERVICE_ACCOUNT}" ]]; then
  echo
  echo "==> Deployer service account"
  gcloud iam service-accounts describe "${GCP_WIF_SERVICE_ACCOUNT}" \
    --project "${GCP_PROJECT_ID}" \
    --format='value(email,disabled)'
else
  echo "WARN: GCP_WIF_SERVICE_ACCOUNT not set, skipping SA verification."
fi

describe_service() {
  local service_name="$1"
  local smoke_path="$2"
  echo
  echo "==> Cloud Run service: ${service_name}"

  latest_revision="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format='value(status.latestReadyRevisionName)')"

  service_url="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format='value(status.url)')"

  image_name="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format='value(spec.template.spec.containers[0].image)')"

  min_scale="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format="value(spec.template.metadata.annotations.'autoscaling.knative.dev/minScale')")"

  max_scale="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format="value(spec.template.metadata.annotations.'autoscaling.knative.dev/maxScale')")"

  concurrency="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format='value(spec.template.spec.containerConcurrency)')"

  timeout_seconds="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format='value(spec.template.spec.timeoutSeconds)')"

  cpu_limit="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format='value(spec.template.spec.containers[0].resources.limits.cpu)')"

  memory_limit="$(gcloud run services describe "${service_name}" \
    --project "${GCP_PROJECT_ID}" \
    --region "${GCP_REGION}" \
    --format='value(spec.template.spec.containers[0].resources.limits.memory)')"

  echo "URL: ${service_url}"
  echo "Latest revision: ${latest_revision}"
  echo "Configured image: ${image_name}"
  echo "Scaling/limits: minScale=${min_scale:-unset}, maxScale=${max_scale:-unset}, concurrency=${concurrency:-unset}, timeoutSeconds=${timeout_seconds:-unset}, cpu=${cpu_limit:-unset}, memory=${memory_limit:-unset}"

  if [[ -n "${latest_revision}" ]]; then
    image_digest="$(gcloud run revisions describe "${latest_revision}" \
      --project "${GCP_PROJECT_ID}" \
      --region "${GCP_REGION}" \
      --format='value(status.imageDigest)')"
    if [[ -n "${image_digest}" ]]; then
      echo "Image digest: ${image_digest}"
    else
      echo "WARN: Could not read image digest for revision ${latest_revision}."
    fi
  fi

  echo "Smoke check: ${service_url}${smoke_path}"
  curl --fail --silent --show-error --location --max-time 20 "${service_url}${smoke_path}" >/dev/null
  echo "Smoke check OK"
}

describe_service "${CLOUD_RUN_SERVICE_PORTFOLIO}" "${CLOUD_RUN_SMOKE_PATH_PORTFOLIO}"
describe_service "${CLOUD_RUN_SERVICE_SALMON}" "${CLOUD_RUN_SMOKE_PATH_SALMON}"

echo
echo "==> DNS checks"
if command -v dig >/dev/null 2>&1; then
  echo "Apex A/AAAA:"
  dig +short "${DOMAIN_APEX}" | sed 's/^/  /'
  echo "WWW CNAME/A/AAAA:"
  dig +short "${DOMAIN_WWW}" | sed 's/^/  /'
else
  echo "WARN: 'dig' not found, skipping DNS resolution details."
fi

echo
echo "==> TLS/HTTP checks"
curl -I --silent --show-error --max-time 20 "https://${DOMAIN_WWW}" | sed -n '1p'
curl -I --silent --show-error --max-time 20 "https://${DOMAIN_APEX}" | sed -n '1p'

echo
echo "Done. Remote GCP/domain verification completed."
