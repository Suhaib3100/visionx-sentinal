#!/bin/bash

# Quick Bedrock Model Access Enabler
# Opens AWS Console to enable Claude 3 models

set -e

REGION=${AWS_REGION:-us-east-1}

echo "🔓 AWS Bedrock Model Access Setup"
echo "=================================="
echo ""
echo "Your AWS Account: 668226797980"
echo "Region: $REGION"
echo ""
echo "📝 Steps to enable Claude 3 Haiku:"
echo ""
echo "1. Opening AWS Console in your browser..."
echo "   URL: https://console.aws.amazon.com/bedrock/home?region=$REGION#/modelaccess"
echo ""
echo "2. In the console:"
echo "   • Click 'Manage model access' or 'Edit'"
echo "   • Find 'Anthropic' section"
echo "   • Check the box for 'Claude 3 Haiku'"
echo "   • (Optional) Also enable 'Claude 3 Sonnet' for better quality"
echo "   • Click 'Save changes'"
echo "   • Wait ~30 seconds for activation"
echo ""
echo "3. After enabling, run:"
echo "   ./scripts/setup-bedrock.sh"
echo ""

# Try to open in browser
URL="https://console.aws.amazon.com/bedrock/home?region=$REGION#/modelaccess"

if command -v open &> /dev/null; then
    echo "🌐 Opening browser..."
    open "$URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$URL"
else
    echo "💡 Copy this URL to your browser:"
    echo "   $URL"
fi

echo ""
echo "⏳ Waiting for you to enable model access..."
echo "   Press ENTER after enabling the model in AWS Console"
read

echo ""
echo "🧪 Testing model access..."

if ./scripts/setup-bedrock.sh; then
    echo ""
    echo "✅ Success! Bedrock is ready to use."
else
    echo ""
    echo "❌ Still not working. Check:"
    echo "   1. Did you click 'Save changes' in AWS Console?"
    echo "   2. Wait 30-60 seconds for propagation"
    echo "   3. Verify IAM user has bedrock:InvokeModel permission"
fi
