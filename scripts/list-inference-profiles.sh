#!/bin/bash

# List available inference profiles for Claude Haiku 4.5
# Inference profiles enable cross-region routing and are required for newer Claude models

set -e

echo "📋 Listing all Bedrock inference profiles..."
echo ""

# List all inference profiles and filter for Claude Haiku
aws bedrock list-inference-profiles \
  --region us-east-1 \
  --output json | jq -r '
.inferenceProfileSummaries[] | 
select(.models[].modelArn | contains("claude-haiku")) |
{
  profileId: .inferenceProfileId,
  profileArn: .inferenceProfileArn,
  profileName: .inferenceProfileName,
  type: .type,
  status: .status,
  models: [.models[].modelArn]
} | 
"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Profile Name: \(.profileName)
Profile ID: \(.profileId)
Profile ARN: \(.profileArn)
Type: \(.type)
Status: \(.status)
Models: \(.models | join(", "))
"'

echo ""
echo "✅ To use an inference profile, replace the model ID with the profile ARN in your API calls"
echo ""
echo "Example:"
echo "  Instead of: --model-id anthropic.claude-haiku-4-5-20251001-v1:0"
echo "  Use:        --model-id <profile-arn-from-above>"
