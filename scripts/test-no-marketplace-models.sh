#!/bin/bash

# Test models that work IMMEDIATELY without marketplace subscriptions
set -e

echo "🚀 Testing Models That Work Right Away (No Marketplace BS)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Test 1: Claude 3 Haiku (older version - should work without marketplace)
echo "1️⃣ Testing Claude 3 Haiku (old version)..."
cat > /tmp/test1.json << 'EOF'
{
  "anthropic_version": "bedrock-2023-05-31",
  "max_tokens": 100,
  "messages": [{"role": "user", "content": "Say hi"}]
}
EOF

if aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id anthropic.claude-3-haiku-20240307-v1:0 \
  --body fileb:///tmp/test1.json \
  /tmp/response1.json 2>/dev/null; then
  echo "   ✅ Claude 3 Haiku WORKS!"
  echo "   Response: $(cat /tmp/response1.json | jq -r '.content[0].text')"
  echo "   Model ID: anthropic.claude-3-haiku-20240307-v1:0"
  echo "   Pricing: ~\$0.00025 per 1K input, \$0.00125 per 1K output"
  WORKING_MODEL="anthropic.claude-3-haiku-20240307-v1:0"
else
  echo "   ❌ Claude 3 Haiku failed"
fi

echo ""

# Test 2: Amazon Nova Micro (AWS's own - cheapest)
echo "2️⃣ Testing Amazon Nova Micro (AWS's own)..."
cat > /tmp/test2.json << 'EOF'
{
  "messages": [{"role": "user", "content": [{"text": "Say hi"}]}],
  "inferenceConfig": {"maxTokens": 100, "temperature": 0.7}
}
EOF

if aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id amazon.nova-micro-v1:0 \
  --body fileb:///tmp/test2.json \
  /tmp/response2.json 2>/dev/null; then
  echo "   ✅ Amazon Nova Micro WORKS!"
  echo "   Response: $(cat /tmp/response2.json | jq -r '.output.message.content[0].text')"
  echo "   Model ID: amazon.nova-micro-v1:0"
  echo "   Pricing: \$0.000035 per 1K input, \$0.00014 per 1K output (SUPER CHEAP!)"
  WORKING_MODEL="amazon.nova-micro-v1:0"
fi

echo ""

# Test 3: Meta Llama 3 70B
echo "3️⃣ Testing Meta Llama 3 70B..."
cat > /tmp/test3.json << 'EOF'
{
  "prompt": "Say hi",
  "max_gen_len": 100,
  "temperature": 0.7
}
EOF

if aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id meta.llama3-70b-instruct-v1:0 \
  --body fileb:///tmp/test3.json \
  /tmp/response3.json 2>/dev/null; then
  echo "   ✅ Meta Llama 3 70B WORKS!"
  echo "   Response: $(cat /tmp/response3.json | jq -r '.generation')"
  echo "   Model ID: meta.llama3-70b-instruct-v1:0"
  echo "   Pricing: \$0.00099 per 1K input, \$0.00099 per 1K output"
fi

echo ""
echo "════════════════════════════════════════════════════════════"

if [ ! -z "$WORKING_MODEL" ]; then
  echo ""
  echo "✅ SUCCESS! Found working model: $WORKING_MODEL"
  echo ""
  echo "🔧 To use it, update your .env.aws:"
  echo "   AWS_BEDROCK_MODEL_ID=$WORKING_MODEL"
  echo ""
else
  echo ""
  echo "❌ None of the tested models worked. Check model access at:"
  echo "   https://us-east-1.console.aws.amazon.com/bedrock/home#/modelaccess"
  echo ""
fi
