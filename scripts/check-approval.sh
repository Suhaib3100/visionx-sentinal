#!/bin/bash

# Check if Bedrock model access has been approved

echo "⏳ Checking Claude 3 Haiku approval status..."
echo ""

REGION=${AWS_REGION:-us-east-1}
MODEL_ID="anthropic.claude-3-haiku-20240307-v1:0"

TEST_PROMPT='{"anthropic_version":"bedrock-2023-05-31","max_tokens":50,"messages":[{"role":"user","content":[{"type":"text","text":"Say OK"}]}]}'

if aws bedrock-runtime invoke-model \
    --region $REGION \
    --model-id $MODEL_ID \
    --body "$TEST_PROMPT" \
    /tmp/bedrock-test.json 2>/dev/null; then
    
    echo "✅ APPROVED! Claude 3 Haiku is ready to use!"
    echo ""
    echo "Response from model:"
    cat /tmp/bedrock-test.json | jq -r '.content[0].text' 2>/dev/null || cat /tmp/bedrock-test.json
    rm -f /tmp/bedrock-test.json
    echo ""
    echo "🎉 Next steps:"
    echo "  1. Run full test: ./scripts/setup-bedrock.sh"
    echo "  2. Test integration: cd apps/worker && ts-node scripts/test-bedrock.ts"
    echo "  3. Start building!"
    exit 0
else
    echo "⏳ Not yet approved. This is normal!"
    echo ""
    echo "📧 AWS will email you when approved (usually 15-30 min)"
    echo ""
    echo "While waiting, you can:"
    echo "  • Continue building other features"
    echo "  • Check again in 5 minutes: ./scripts/check-approval.sh"
    echo "  • Test with Titan model (no approval needed)"
    echo ""
    echo "Want to test with Amazon Titan now? (y/n)"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🧪 Testing with Amazon Titan..."
        
        TITAN_MODEL="amazon.titan-text-express-v1"
        TITAN_PROMPT='{"inputText":"Say hello","textGenerationConfig":{"maxTokenCount":100,"temperature":0.3}}'
        
        if aws bedrock-runtime invoke-model \
            --region $REGION \
            --model-id $TITAN_MODEL \
            --body "$TITAN_PROMPT" \
            /tmp/titan-test.json 2>/dev/null; then
            
            echo "✅ Titan works! You can use this temporarily:"
            echo ""
            cat /tmp/titan-test.json | jq -r '.results[0].outputText' 2>/dev/null || cat /tmp/titan-test.json
            rm -f /tmp/titan-test.json
            echo ""
            echo "To use Titan temporarily:"
            echo "  export AWS_BEDROCK_MODEL_ID=amazon.titan-text-express-v1"
            echo "  cd apps/worker && ts-node scripts/test-bedrock.ts"
        else
            echo "❌ Titan not accessible either. Check IAM permissions."
        fi
    fi
    
    exit 1
fi
