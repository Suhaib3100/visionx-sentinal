#!/bin/bash

# Detailed Bedrock diagnostic

REGION=${AWS_REGION:-us-east-1}
MODEL_ID="anthropic.claude-3-haiku-20240307-v1:0"

echo "🔍 Detailed Bedrock Diagnostics"
echo "================================"
echo ""

# Get current user
echo "📋 AWS Identity:"
aws sts get-caller-identity
echo ""

# Try to invoke with verbose error
echo "🧪 Attempting model invocation (with error details)..."
TEST_PROMPT='{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":[{"type":"text","text":"Hi"}]}]}'

aws bedrock-runtime invoke-model \
    --region $REGION \
    --model-id $MODEL_ID \
    --body "$TEST_PROMPT" \
    /tmp/bedrock-response.json 2>&1 | tee /tmp/bedrock-error.log

ERROR_OUTPUT=$(cat /tmp/bedrock-error.log)

echo ""
echo "📊 Error Analysis:"
if echo "$ERROR_OUTPUT" | grep -q "AccessDeniedException"; then
    echo "❌ IAM Permission Issue"
    echo ""
    echo "Your AWS user lacks bedrock:InvokeModel permission."
    echo ""
    echo "🔧 Fix: Add this IAM policy to your user:"
    echo ""
    cat << 'EOF'
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "bedrock:InvokeModel",
            "bedrock:InvokeModelWithResponseStream"
          ],
          "Resource": "arn:aws:bedrock:*::foundation-model/*"
        }
      ]
    }
EOF
    echo ""
    echo "Run this to add permissions (replace YOUR_USERNAME):"
    echo ""
    cat << 'EOF'
cat > /tmp/bedrock-policy.json << 'POLICY'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
POLICY

aws iam put-user-policy \
  --user-name YOUR_USERNAME \
  --policy-name BedrockFullAccess \
  --policy-document file:///tmp/bedrock-policy.json
EOF

elif echo "$ERROR_OUTPUT" | grep -q "ValidationException"; then
    echo "❌ Model Access Not Enabled"
    echo ""
    echo "The model exists but you haven't enabled access."
    echo "Go to: https://console.aws.amazon.com/bedrock/home?region=$REGION#/modelaccess"
    echo ""
    echo "Steps:"
    echo "1. Click 'Manage model access'"
    echo "2. Find 'Anthropic' → Check 'Claude 3 Haiku'"
    echo "3. Click 'Save changes'"
    echo "4. Wait 1-2 minutes"

elif echo "$ERROR_OUTPUT" | grep -q "ResourceNotFoundException"; then
    echo "❌ Model Not Available"
    echo ""
    echo "Claude 3 Haiku not available in region: $REGION"
    echo "Use: us-east-1, us-west-2, or eu-west-1"

else
    echo "✅ No obvious errors detected"
    echo ""
    echo "Raw response:"
    cat /tmp/bedrock-response.json 2>/dev/null || echo "No response file"
fi

rm -f /tmp/bedrock-response.json /tmp/bedrock-error.log
