#!/bin/bash
TOKEN="nfp_ccsFPmt165aa1zwVVSM8JgENK5EdnPA312ff"

echo "Creating new site via API..."
SITE_RESPONSE=$(curl -s -X POST "https://api.netlify.com/api/v1/sites" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gulf-unified-platform",
    "custom_domain": null
  }')

echo "$SITE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "Failed to parse site ID"

# If site creation fails, try to use the provided token as site ID
if [ -z "$SITE_ID" ]; then
  echo "Using provided token as site ID..."
  SITE_ID="$TOKEN"
fi

echo "Deploying to site..."
export NETLIFY_AUTH_TOKEN="$TOKEN"
npx netlify-cli deploy --prod --dir=dist --site="$TOKEN" --auth="$TOKEN"
