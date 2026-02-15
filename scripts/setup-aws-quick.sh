#!/bin/bash
# Quick AWS Setup - Creates ONLY essential resources
# For cost-conscious deployment

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="visionx-eval"

echo "🚀 Quick AWS Setup - Essential Resources Only"
echo ""

# 1. S3 Bucket
BUCKET_NAME="${PROJECT_NAME}-snapshots"
echo "📦 Creating S3 bucket..."
aws s3api create-bucket \
    --bucket "${BUCKET_NAME}" \
    --region "${AWS_REGION}" \
    $([ "$AWS_REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=${AWS_REGION}") 2>/dev/null || echo "Bucket exists"

aws s3api put-public-access-block \
    --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "✅ S3: ${BUCKET_NAME}"

# 2. SQS Queue
QUEUE_NAME="${PROJECT_NAME}-jobs"
echo "📨 Creating SQS queue..."
QUEUE_URL=$(aws sqs create-queue \
    --queue-name "${QUEUE_NAME}" \
    --attributes "VisibilityTimeout=300,MessageRetentionPeriod=86400" \
    --region "${AWS_REGION}" \
    --query 'QueueUrl' --output text 2>/dev/null || \
    aws sqs get-queue-url --queue-name "${QUEUE_NAME}" --query 'QueueUrl' --output text)

echo "✅ SQS: ${QUEUE_URL}"

# 3. RDS PostgreSQL (smallest instance)
DB_IDENTIFIER="${PROJECT_NAME}-db"
DB_PASSWORD=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 24)
echo "🗄️  Creating PostgreSQL database..."
echo "⚠️  This takes 5-10 minutes..."

if ! aws rds describe-db-instances --db-instance-identifier "${DB_IDENTIFIER}" &>/dev/null; then
    aws rds create-db-instance \
        --db-instance-identifier "${DB_IDENTIFIER}" \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version 15.16 \
        --master-username visionx \
        --master-user-password "${DB_PASSWORD}" \
        --allocated-storage 20 \
        --db-name visionx_eval \
        --no-multi-az \
        --publicly-accessible \
        --region "${AWS_REGION}"
    
    aws rds wait db-instance-available \
        --db-instance-identifier "${DB_IDENTIFIER}" \
        --region "${AWS_REGION}"
fi

DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "${DB_IDENTIFIER}" \
    --query 'DBInstances[0].Endpoint.Address' --output text)

echo "✅ RDS: ${DB_ENDPOINT}"
echo ""
echo "============================================================================"
echo "✅ DONE! Copy this to apps/backend/.env and apps/worker/.env:"
echo "============================================================================"
cat > aws-config-quick.env <<EOF
# Essential AWS Configuration
DATABASE_HOST=${DB_ENDPOINT}
DATABASE_PORT=5432
DATABASE_USER=visionx
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_NAME=visionx_eval

AWS_REGION=${AWS_REGION}
AWS_S3_BUCKET=${BUCKET_NAME}
AWS_SQS_QUEUE_URL=${QUEUE_URL}

AI_PROVIDER=bedrock
AI_MODEL=amazon.nova-micro-v1:0
EOF

cat aws-config-quick.env
echo ""
echo "💾 Saved to: aws-config-quick.env"
echo "🔐 DB Password: ${DB_PASSWORD}"
echo ""
echo "⚠️  IMPORTANT: Update RDS security group to allow port 5432 from your IP!"
