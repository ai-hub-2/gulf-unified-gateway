#!/bin/bash
# Deploy to Netlify using site ID
SITE_ID="nfp_ccsFPmt165aa1zwVVSM8JgENK5EdnPA312ff"

# Check if Netlify CLI is available
if command -v netlify &> /dev/null; then
    netlify deploy --prod --dir=dist --site=$SITE_ID
elif command -v npx &> /dev/null; then
    npx -y netlify-cli deploy --prod --dir=dist --site=$SITE_ID
else
    echo "Netlify CLI not found. Please install it or use manual deployment."
    echo "Files are ready in the 'dist' folder for manual upload."
    exit 1
fi
