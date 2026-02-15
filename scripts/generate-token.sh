#!/bin/bash

# Generate Custom Token for VisionX Extension Testing
# Usage: ./generate-token.sh [team-name] [team-id] [project-id]

TEAM_NAME=${1:-"bytecrew"}
TEAM_ID=${2:-""}
PROJECT_ID=${3:-""}

API_URL="http://localhost:3000/api/v1/auth/generate-custom-token"

echo "🔐 Generating custom token for team: $TEAM_NAME"
echo "================================================"

# Create JSON payload
JSON_PAYLOAD="{\"teamName\": \"$TEAM_NAME\""
[ -n "$TEAM_ID" ] && JSON_PAYLOAD="$JSON_PAYLOAD, \"teamId\": \"$TEAM_ID\""
[ -n "$PROJECT_ID" ] && JSON_PAYLOAD="$JSON_PAYLOAD, \"projectId\": \"$PROJECT_ID\""
JSON_PAYLOAD="$JSON_PAYLOAD}"

# Make request
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD")

# Check if request was successful
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Token generated successfully!"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | jq '.'
  echo ""
  echo "================================================"
  echo "📋 Copy this token to use in VS Code extension:"
  echo ""
  TOKEN=$(echo "$RESPONSE" | jq -r '.token')
  echo "$TOKEN"
  echo ""
  echo "================================================"
  echo "Team Name: $(echo "$RESPONSE" | jq -r '.teamName')"
  echo "Team ID:   $(echo "$RESPONSE" | jq -r '.teamId')"
  echo "Project ID: $(echo "$RESPONSE" | jq -r '.projectId')"
  echo "================================================"
else
  echo ""
  echo "❌ Failed to generate token. Make sure the backend is running!"
  echo "   Start backend with: cd apps/backend && npm run start:dev"
fi
