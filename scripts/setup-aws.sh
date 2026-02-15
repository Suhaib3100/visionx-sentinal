#!/bin/bash
# VisionX Eval - AWS Services Setup
# This script creates the necessary AWS resources using AWS CLI

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 VisionX Eval - AWS Services Setup${NC}\n"

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
S3_BUCKET=${S3_BUCKET:-visionx-snapshots-$(date +%s)}
SQS_QUEUE_NAME=${SQS_QUEUE_NAME:-evaluation-jobs}
SQS_DLQ_NAME=${SQS_DLQ_NAME:-evaluation-jobs-dlq}

echo -e "${YELLOW}Configuration:${NC}"
echo "  AWS Region: $AWS_REGION"
echo "  S3 Bucket: $S3_BUCKET"
echo "  SQS Queue: $SQS_QUEUE_NAME"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $ACCOUNT_ID${NC}\n"

# 1. Create S3 Bucket
echo -e "${YELLOW}Creating S3 bucket: $S3_BUCKET${NC}"
if aws s3 ls "s3://$S3_BUCKET" 2>&1 | grep -q 'NoSuchBucket'; then
    if [ "$AWS_REGION" == "us-east-1" ]; then
        aws s3api create-bucket \
            --bucket "$S3_BUCKET" \
            --region "$AWS_REGION"
    else
        aws s3api create-bucket \
            --bucket "$S3_BUCKET" \
            --region "$AWS_REGION" \
            --create-bucket-configuration LocationConstraint="$AWS_REGION"
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$S3_BUCKET" \
        --versioning-configuration Status=Enabled
    
    # Add bucket policy for private access
    cat > /tmp/s3-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET/*",
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                }
            }
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket "$S3_BUCKET" \
        --policy file:///tmp/s3-policy.json
    
    rm /tmp/s3-policy.json
    
    echo -e "${GREEN}✅ S3 bucket created: $S3_BUCKET${NC}"
else
    echo -e "${YELLOW}⚠️  Bucket already exists: $S3_BUCKET${NC}"
fi

# 2. Create Dead Letter Queue
echo -e "\n${YELLOW}Creating SQS Dead Letter Queue: $SQS_DLQ_NAME${NC}"
DLQ_URL=$(aws sqs create-queue \
    --queue-name "$SQS_DLQ_NAME" \
    --region "$AWS_REGION" \
    --query 'QueueUrl' \
    --output text 2>/dev/null || aws sqs get-queue-url --queue-name "$SQS_DLQ_NAME" --query 'QueueUrl' --output text)

DLQ_ARN=$(aws sqs get-queue-attributes \
    --queue-url "$DLQ_URL" \
    --attribute-names QueueArn \
    --query 'Attributes.QueueArn' \
    --output text)

echo -e "${GREEN}✅ Dead Letter Queue created${NC}"
echo "   URL: $DLQ_URL"

# 3. Create Main SQS Queue
echo -e "\n${YELLOW}Creating SQS Queue: $SQS_QUEUE_NAME${NC}"

# Prepare redrive policy
cat > /tmp/redrive-policy.json <<EOF
{
    "deadLetterTargetArn": "$DLQ_ARN",
    "maxReceiveCount": "3"
}
EOF

QUEUE_URL=$(aws sqs create-queue \
    --queue-name "$SQS_QUEUE_NAME" \
    --region "$AWS_REGION" \
    --attributes VisibilityTimeout=300,MessageRetentionPeriod=345600,ReceiveMessageWaitTimeSeconds=20,RedrivePolicy="$(cat /tmp/redrive-policy.json | tr -d '\n')" \
    --query 'QueueUrl' \
    --output text 2>/dev/null || aws sqs get-queue-url --queue-name "$SQS_QUEUE_NAME" --query 'QueueUrl' --output text)

rm /tmp/redrive-policy.json

QUEUE_ARN=$(aws sqs get-queue-attributes \
    --queue-url "$QUEUE_URL" \
    --attribute-names QueueArn \
    --query 'Attributes.QueueArn' \
    --output text)

echo -e "${GREEN}✅ SQS Queue created${NC}"
echo "   URL: $QUEUE_URL"

# 4. Output environment variables
echo -e "\n${GREEN}✅ AWS Services Setup Complete!${NC}\n"
echo -e "${YELLOW}Add these to your .env files:${NC}"
echo ""
echo "# Backend (.env)"
echo "AWS_REGION=$AWS_REGION"
echo "AWS_S3_BUCKET=$S3_BUCKET"
echo "AWS_SQS_QUEUE_URL=$QUEUE_URL"
echo ""
echo "# Worker (.env)"
echo "AWS_REGION=$AWS_REGION"
echo "AWS_S3_BUCKET=$S3_BUCKET"
echo "AWS_SQS_QUEUE_URL=$QUEUE_URL"
echo ""

# 5. Create test message
echo -e "${YELLOW}Testing SQS Queue...${NC}"
TEST_MESSAGE='{
  "snapshotId": "test-snapshot-123",
  "s3Path": "snapshots/test-snapshot-123.tar.gz",
  "projectId": "test-project-456"
}'

aws sqs send-message \
    --queue-url "$QUEUE_URL" \
    --message-body "$TEST_MESSAGE" \
    --message-attributes '{"Type":{"DataType":"String","StringValue":"test"}}' \
    > /dev/null

echo -e "${GREEN}✅ Test message sent to queue${NC}"
echo ""
echo -e "${YELLOW}Resources Created:${NC}"
echo "  ✅ S3 Bucket: s3://$S3_BUCKET"
echo "  ✅ SQS Queue: $SQS_QUEUE_NAME"
echo "  ✅ DLQ: $SQS_DLQ_NAME"
echo "  ✅ Test message sent"
echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
