#!/bin/bash
# Deploy BR Academy workflows to n8n via API
# Removes read-only fields before sending

N8N_URL="${N8N_URL:-https://your-n8n-instance.com}"
N8N_KEY="${N8N_KEY:-your-api-key-here}"

# Usage: N8N_URL="https://your-n8n.com" N8N_KEY="your-key" bash deploy-to-n8n.sh

WORKFLOWS_DIR="/home/user/BR-Academy/n8n-workflows"
CREATED_IDS=()

echo "========================================="
echo "  BR Academy - Deploy to n8n"
echo "========================================="
echo ""

# Test connection
echo "[TEST] Testing API connection..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET "${N8N_URL}/api/v1/workflows?limit=1" \
  -H "X-N8N-API-KEY: ${N8N_KEY}")

if [ "$HTTP_CODE" != "200" ]; then
  echo "[ERROR] API returned HTTP ${HTTP_CODE}. Check URL and API key."
  exit 1
fi
echo "[OK] Connected to n8n API"
echo ""

# Create each workflow (removing tags and other read-only fields)
for FILE in \
  "${WORKFLOWS_DIR}/01-lead-capture.json" \
  "${WORKFLOWS_DIR}/02-lead-pipeline.json" \
  "${WORKFLOWS_DIR}/03-sales-agent.json" \
  "${WORKFLOWS_DIR}/04-enrollment.json" \
  "${WORKFLOWS_DIR}/05-course-operations.json" \
  "${WORKFLOWS_DIR}/06-financial-tracking.json"; do

  BASENAME=$(basename "$FILE")
  echo "[CREATING] ${BASENAME}..."

  # Remove tags field (read-only in API)
  CLEAN_JSON=$(python3 -c "
import json, sys
with open('${FILE}') as f:
    wf = json.load(f)
# Remove read-only fields
wf.pop('tags', None)
wf.pop('id', None)
wf.pop('createdAt', None)
wf.pop('updatedAt', None)
print(json.dumps(wf))
")

  RESPONSE=$(curl -s -X POST "${N8N_URL}/api/v1/workflows" \
    -H "X-N8N-API-KEY: ${N8N_KEY}" \
    -H "Content-Type: application/json" \
    -d "${CLEAN_JSON}")

  # Extract ID from response
  WF_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  WF_NAME=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name',''))" 2>/dev/null)

  if [ -n "$WF_ID" ] && [ "$WF_ID" != "" ]; then
    echo "[OK] Created: ${WF_NAME} (ID: ${WF_ID})"
    CREATED_IDS+=("$WF_ID")
  else
    echo "[ERROR] Failed to create ${BASENAME}"
    echo "[DEBUG] Response: $(echo "$RESPONSE" | head -c 500)"
  fi
  echo ""
done

echo "========================================="
echo "  Summary"
echo "========================================="
echo "Workflows created: ${#CREATED_IDS[@]} / 6"
echo ""
for ID in "${CREATED_IDS[@]}"; do
  echo "  - ${N8N_URL}/workflow/${ID}"
done
echo ""
echo "Next steps:"
echo "1. Open ${N8N_URL}/home to see your workflows"
echo "2. Open each workflow and configure credentials (yellow triangles)"
echo "3. Activate each workflow when ready"
