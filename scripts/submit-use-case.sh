#!/bin/bash

# Anthropic Use Case Form Helper

echo "📝 Anthropic Claude Use Case Form Required"
echo "==========================================="
echo ""
echo "AWS detected: Model use case form not submitted"
echo ""
echo "AWS requires you to fill out a use case form before using"
echo "Anthropic Claude models on Bedrock."
echo ""
echo "📋 Steps:"
echo ""
echo "1. Go to AWS Console → Bedrock → Model Access"
echo "   https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess"
echo ""
echo "2. Find 'Anthropic' section"
echo ""
echo "3. Click 'Manage' or 'Modify model access'"
echo ""
echo "4. Select 'Claude 3 Haiku' (and optionally Claude 3 Sonnet)"
echo ""
echo "5. You'll be prompted to fill out a use case form:"
echo "   • Company name: Your company/team name"
echo "   • Use case: 'AI-powered code evaluation for hackathon projects'"
echo "   • Industry: Technology/Software"
echo "   • Expected usage: Up to 10,000 evaluations per month"
echo ""
echo "6. Submit the form"
echo ""
echo "7. ⏳ Wait 15-30 minutes for approval (usually instant)"
echo ""
echo "📧 You'll receive an email when approved."
echo ""
echo "💡 Alternative: Use Amazon Titan or Meta Llama models"
echo "   These don't require a use case form:"
echo "   • amazon.titan-text-express-v1"
echo "   • meta.llama3-70b-instruct-v1:0"
echo ""

read -p "Open AWS Console now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Opening AWS Console..."
    open "https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess" 2>/dev/null || \
    echo "Open this URL: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess"
fi

echo ""
echo "After submitting the form:"
echo "  1. Wait 15-30 minutes"
echo "  2. Run: ./scripts/setup-bedrock.sh"
echo "  3. If approved, you'll see: ✅ Model invocation successful!"
echo ""
