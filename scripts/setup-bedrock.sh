#!/bin/bash

# AWS Bedrock Setup Script
# This script verifies and sets up AWS Bedrock for VisionX Eval

set -e

echo "🚀 AWS Bedrock Setup for VisionX Eval"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
echo "📋 Checking prerequisites..."
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Install it with: brew install awscli"
    exit 1
fi
echo -e "${GREEN}✅ AWS CLI found${NC}"

# Check AWS credentials
echo ""
echo "🔑 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo ""
    echo "Configure with:"
    echo "  aws configure"
    echo ""
    echo "Or set environment variables:"
    echo "  export AWS_ACCESS_KEY_ID=your-key"
    echo "  export AWS_SECRET_ACCESS_KEY=your-secret"
    echo "  export AWS_REGION=us-east-1"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_REGION:-us-east-1}

echo -e "${GREEN}✅ Credentials valid${NC}"
echo "   Account ID: $ACCOUNT_ID"
echo "   Region: $REGION"

# Check if Bedrock is available in the region
echo ""
echo "🌎 Checking Bedrock availability in $REGION..."

BEDROCK_REGIONS=("us-east-1" "us-west-2" "eu-west-1" "ap-southeast-1" "ap-northeast-1")
if [[ " ${BEDROCK_REGIONS[@]} " =~ " ${REGION} " ]]; then
    echo -e "${GREEN}✅ Bedrock is available in $REGION${NC}"
else
    echo -e "${YELLOW}⚠️  Bedrock may not be available in $REGION${NC}"
    echo "   Recommended regions: us-east-1, us-west-2, eu-west-1"
fi

# Check model access
echo ""
echo "🤖 Checking Claude 3 Haiku model access..."

MODEL_ID="anthropic.claude-3-haiku-20240307-v1:0"

# Try to list foundation models (requires bedrock:ListFoundationModels permission)
if aws bedrock list-foundation-models --region $REGION &> /dev/null; then
    echo -e "${GREEN}✅ Bedrock API accessible${NC}"
    
    # Check if Claude 3 Haiku is available
    if aws bedrock list-foundation-models --region $REGION --query "modelSummaries[?modelId=='$MODEL_ID']" --output text | grep -q "claude"; then
        echo -e "${GREEN}✅ Claude 3 Haiku is available${NC}"
    else
        echo -e "${YELLOW}⚠️  Claude 3 Haiku not found in model list${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Cannot list foundation models (may need permissions)${NC}"
fi

# Test model invocation
echo ""
echo "🧪 Testing model invocation..."

TEST_PROMPT='{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":[{"type":"text","text":"Say hello in JSON format with a greeting field"}]}]}'

if aws bedrock-runtime invoke-model \
    --region $REGION \
    --model-id $MODEL_ID \
    --body "$TEST_PROMPT" \
    /tmp/bedrock-test-response.json 2>/dev/null; then
    
    echo -e "${GREEN}✅ Model invocation successful!${NC}"
    echo ""
    echo "Response:"
    cat /tmp/bedrock-test-response.json | jq -r '.content[0].text' 2>/dev/null || cat /tmp/bedrock-test-response.json
    rm -f /tmp/bedrock-test-response.json
    
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Bedrock setup complete!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    
else
    echo -e "${RED}❌ Model invocation failed${NC}"
    echo ""
    echo "This could mean:"
    echo "  1. Model access not enabled (go to AWS Console → Bedrock → Model Access)"
    echo "  2. Missing IAM permission: bedrock:InvokeModel"
    echo "  3. Model not available in this region"
    echo ""
    echo "📝 To enable model access:"
    echo "   1. Go to: https://console.aws.amazon.com/bedrock/home?region=$REGION#/modelaccess"
    echo "   2. Click 'Enable specific models'"
    echo "   3. Enable: Anthropic Claude 3 Haiku"
    echo "   4. Wait for approval (usually instant)"
    echo ""
    echo "📝 Required IAM policy:"
    cat << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    }
  ]
}
EOF
    
    exit 1
fi

# Update .env.aws file
echo ""
echo "📝 Updating .env.aws configuration..."

ENV_FILE="./apps/worker/.env.aws"

if [ -f "$ENV_FILE" ]; then
    # Check if Bedrock config already exists
    if grep -q "AWS_BEDROCK_MODEL_ID" "$ENV_FILE"; then
        echo -e "${GREEN}✅ Bedrock configuration already exists in .env.aws${NC}"
    else
        echo ""
        echo "# AWS Bedrock Configuration (added by setup-bedrock.sh)" >> "$ENV_FILE"
        echo "AWS_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0" >> "$ENV_FILE"
        echo "AWS_BEDROCK_MAX_TOKENS=4096" >> "$ENV_FILE"
        echo "AWS_BEDROCK_TEMPERATURE=0.3" >> "$ENV_FILE"
        echo -e "${GREEN}✅ Added Bedrock configuration to .env.aws${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.aws not found, skipping${NC}"
fi

# Offer to run test script
echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Test the integration:"
echo "   cd apps/worker"
echo "   pnpm install -g ts-node"
echo "   ts-node scripts/test-bedrock.ts"
echo ""
echo "2. Or run the worker service:"
echo "   cd apps/worker"
echo "   pnpm run start:dev"
echo ""
echo "3. Monitor costs in AWS Console:"
echo "   https://console.aws.amazon.com/billing/home"
echo ""

read -p "Run test script now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🧪 Running Bedrock test..."
    cd apps/worker
    
    # Check if ts-node is available
    if ! command -v ts-node &> /dev/null; then
        echo "Installing ts-node..."
        pnpm add -D ts-node
    fi
    
    ts-node scripts/test-bedrock.ts
fi
