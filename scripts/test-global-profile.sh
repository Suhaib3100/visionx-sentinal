#!/bin/bash

# Test Claude Haiku 4.5 using Global Inference Profile
# Global profile provides ~10% cost savings vs regional profiles

set -e

PROFILE_ARN="arn:aws:bedrock:us-east-1:668226797980:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0"

echo "🧪 Testing Claude Haiku 4.5 with Global Inference Profile"
echo "Profile: $PROFILE_ARN"
echo ""

# Create request payload
cat > /tmp/test-request.json << 'REQUEST'
{
  "anthropic_version": "bedrock-2023-05-31",
  "max_tokens": 100,
  "messages": [
    {
      "role": "user",
      "content": "Hello! Please respond with a short greeting."
    }
  ]
}
REQUEST

# Invoke model
echo "📤 Sending request to Bedrock..."
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id "$PROFILE_ARN" \
  --body fileb:///tmp/test-request.json \
  /tmp/response.json

# Check response
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SUCCESS! Claude Haiku 4.5 is working!"
  echo ""
  echo "📥 Response:"
  cat /tmp/response.json | jq -r '.content[0].text'
  echo ""
  echo "📊 Full response:"
  cat /tmp/response.json | jq .
else
  echo ""
  echo "❌ Failed to invoke model"
  exit 1
fi
