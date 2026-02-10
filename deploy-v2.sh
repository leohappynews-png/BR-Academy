#!/bin/bash
# Deploy BR Academy v2 workflows (Z-API + AI Router) to n8n

N8N_URL="${N8N_URL:-https://your-n8n-instance.com}"
N8N_KEY="${N8N_KEY:-your-api-key-here}"

# Usage: N8N_URL="https://your-n8n.com" N8N_KEY="your-key" bash deploy-v2.sh

WORKFLOWS_DIR="/home/user/BR-Academy/n8n-workflows"

echo "========================================="
echo "  BR Academy v2 - Deploy Z-API + AI"
echo "========================================="
echo ""

for FILE in \
  "${WORKFLOWS_DIR}/07-zapi-whatsapp-hub.json" \
  "${WORKFLOWS_DIR}/08-ai-agent-router.json"; do

  BASENAME=$(basename "$FILE")
  echo "[CREATING] ${BASENAME}..."

  CLEAN_JSON=$(python3 -c "
import json
with open('${FILE}') as f:
    wf = json.load(f)
wf.pop('tags', None)
wf.pop('id', None)
print(json.dumps(wf))
")

  RESPONSE=$(curl -s -X POST "${N8N_URL}/api/v1/workflows" \
    -H "X-N8N-API-KEY: ${N8N_KEY}" \
    -H "Content-Type: application/json" \
    -d "${CLEAN_JSON}")

  WF_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
  WF_NAME=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name',''))" 2>/dev/null)

  if [ -n "$WF_ID" ] && [ "$WF_ID" != "" ]; then
    echo "[OK] Created: ${WF_NAME} (ID: ${WF_ID})"
    echo "     URL: ${N8N_URL}/workflow/${WF_ID}"
  else
    echo "[ERROR] Failed: ${BASENAME}"
    echo "[DEBUG] $(echo "$RESPONSE" | head -c 300)"
  fi
  echo ""
done

echo "Done! Open ${N8N_URL}/home to see your new workflows."
