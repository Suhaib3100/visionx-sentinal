#!/bin/bash

echo "🧪 Testing Claude Haiku 4.5 Access"
echo "==================================="
echo ""

REGION=${AWS_REGION:-us-east-1}
MODEL_ID="anthropic.claude-haiku-4-5-20251001-v1:0"

echo "Model: $MODEL_ID"
echo "Region: $REGION"
echo ""

TEST_PROMPT='{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":[{"type":"text","text":"Say hello and confirm you are Claude Haiku 4.5"}]}]}'

echo "🚀 Invoking model..."

# Create temp file with prompt
echo "$TEST_PROMPT" > /tmp/haiku45-prompt.json

if aws bedrock-runtime invoke-model \
    --region $REGION \
    --model-id $MODEL_ID \
    --body file:///tmp/haiku45-prompt.json \
    /tmp/haiku45-test.json 2>/tmp/haiku45-error.log; then
    
    echo ""
    echo "✅ SUCCESS! Claude Haiku 4.5 is accessible!"
    echo ""
    echo "Response:"
    cat /tmp/haiku45-test.json | jq -r '.content[0].text' 2>/dev/null || cat /tmp/haiku45-test.json
    echo ""
    echo "🎉 Your Bedrock setup is working!"
    echo ""
    echo "Next steps:"
    echo "1. Update worker config to use Claude Haiku 4.5"
    echo "2. Run: export AWS_BEDROCK_MODEL_ID=anthropic.claude-haiku-4-5-20251001-v1:0"
    echo "3. Test integration: cd apps/worker && ts-node scripts/test-bedrock.ts"
    
    rm -f /tmp/haiku45-test.json /tmp/haiku45-error.log
    exit 0
else
    echo ""
    echo "❌ Failed to invoke Claude Haiku 4.5"
    echo ""
    echo "Error:"
    cat /tmp/haiku45-error.log
    echo ""
    echo "Possible issues:"
    echo "1. Marketplace agreement needs time to propagate (wait 10-15 min)"
    echo "2. Still need to enable model access in Bedrock console"
    echo "3. IAM permissions issue"
    
    rm -f /tmp/haiku45-test.json /tmp/haiku45-error.log
    exit 1
fi
