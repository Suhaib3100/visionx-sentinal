#!/bin/bash

echo "🔍 Checking Available Bedrock Models"
echo "====================================="
echo ""

REGION=${AWS_REGION:-us-east-1}

echo "📋 Your AWS Account: 668226797980"
echo "📍 Region: $REGION"
echo ""

echo "🤖 Listing all foundation models..."
echo ""

# List all models
aws bedrock list-foundation-models --region $REGION --output json > /tmp/bedrock-models.json 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Successfully retrieved model list"
    echo ""
    echo "🔹 Anthropic Models Available:"
    cat /tmp/bedrock-models.json | jq -r '.modelSummaries[] | select(.providerName=="Anthropic") | "  • \(.modelId) - \(.modelName)"'
    
    echo ""
    echo "🔹 Amazon Titan Models Available:"
    cat /tmp/bedrock-models.json | jq -r '.modelSummaries[] | select(.providerName=="Amazon") | "  • \(.modelId) - \(.modelName)"'
    
    echo ""
    echo "🔹 Meta Llama Models Available:"
    cat /tmp/bedrock-models.json | jq -r '.modelSummaries[] | select(.providerName=="Meta") | "  • \(.modelId) - \(.modelName)"'
    
else
    echo "❌ Failed to list models"
    cat /tmp/bedrock-models.json
fi

echo ""
echo "📝 Checking Model Access Status..."
echo ""

# Try to get model access info (this API may not be available via CLI)
echo "Go to AWS Console to check model access:"
echo "https://console.aws.amazon.com/bedrock/home?region=$REGION#/modelaccess"
echo ""

echo "💡 Next Steps:"
echo "1. In AWS Console → Bedrock → Model Access"
echo "2. Look for models with 'Access granted' status"
echo "3. If Claude shows 'Available to request', click 'Manage model access'"
echo "4. Check the box for Anthropic models"
echo "5. Fill out use case form if prompted"
echo "6. Wait 10-15 minutes for propagation"
echo ""

rm -f /tmp/bedrock-models.json
