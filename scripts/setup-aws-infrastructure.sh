#!/bin/bash
# AWS Infrastructure Setup for VisionX Eval
# Creates: RDS PostgreSQL, S3, SQS, ElastiCache Redis
# Prerequisites: AWS CLI configured with credentials

set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="visionx-eval"
ENVIRONMENT="production"

echo "🚀 Setting up VisionX Eval AWS Infrastructure"
echo "Region: $AWS_REGION"
echo "Project: $PROJECT_NAME"
echo ""

# ============================================================================
# 1. CREATE S3 BUCKET FOR SNAPSHOTS
# ============================================================================
echo "📦 Creating S3 bucket..."
BUCKET_NAME="${PROJECT_NAME}-snapshots-${AWS_REGION}"

if aws s3 ls "s3://${BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3api create-bucket \
        --bucket "${BUCKET_NAME}" \
        --region "${AWS_REGION}" \
        $([ "$AWS_REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=${AWS_REGION}")
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "${BUCKET_NAME}" \
        --versioning-configuration Status=Enabled
    
    # Block public access
    aws s3api put-public-access-block \
        --bucket "${BUCKET_NAME}" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    
    echo "✅ S3 bucket created: ${BUCKET_NAME}"
else
    echo "✅ S3 bucket already exists: ${BUCKET_NAME}"
fi

# ============================================================================
# 2. CREATE SQS QUEUE FOR EVALUATION JOBS
# ============================================================================
echo ""
echo "📨 Creating SQS queue..."
QUEUE_NAME="${PROJECT_NAME}-evaluation-jobs"

QUEUE_URL=$(aws sqs create-queue \
    --queue-name "${QUEUE_NAME}" \
    --attributes \
    "VisibilityTimeout=300,MessageRetentionPeriod=86400,ReceiveMessageWaitTimeSeconds=20" \
    --region "${AWS_REGION}" \
    --query 'QueueUrl' \
    --output text 2>/dev/null || aws sqs get-queue-url --queue-name "${QUEUE_NAME}" --query 'QueueUrl' --output text)

echo "✅ SQS queue created: ${QUEUE_URL}"

# ============================================================================
# 3. CREATE RDS POSTGRESQL DATABASE
# ============================================================================
echo ""
echo "🗄️  Creating RDS PostgreSQL database..."
DB_INSTANCE_IDENTIFIER="${PROJECT_NAME}-db"
DB_NAME="visionx_eval"
DB_USERNAME="visionxadmin"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Check if DB instance exists
if ! aws rds describe-db-instances \
    --db-instance-identifier "${DB_INSTANCE_IDENTIFIER}" \
    --region "${AWS_REGION}" &>/dev/null; then
    
    echo "Creating RDS instance (this takes ~5-10 minutes)..."
    
    aws rds create-db-instance \
        --db-instance-identifier "${DB_INSTANCE_IDENTIFIER}" \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version 15.16 \
        --master-username "${DB_USERNAME}" \
        --master-user-password "${DB_PASSWORD}" \
        --allocated-storage 20 \
        --storage-type gp3 \
        --db-name "${DB_NAME}" \
        --backup-retention-period 7 \
        --preferred-backup-window "03:00-04:00" \
        --preferred-maintenance-window "mon:04:00-mon:05:00" \
        --no-multi-az \
        --publicly-accessible \
        --region "${AWS_REGION}" \
        --tags "Key=Project,Value=${PROJECT_NAME}" "Key=Environment,Value=${ENVIRONMENT}"
    
    echo "⏳ Waiting for RDS instance to be available (this may take 5-10 minutes)..."
    aws rds wait db-instance-available \
        --db-instance-identifier "${DB_INSTANCE_IDENTIFIER}" \
        --region "${AWS_REGION}"
    
    echo "✅ RDS PostgreSQL created"
else
    echo "✅ RDS instance already exists: ${DB_INSTANCE_IDENTIFIER}"
    DB_PASSWORD="<existing-password-check-aws-console>"
fi

# Get RDS endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier "${DB_INSTANCE_IDENTIFIER}" \
    --region "${AWS_REGION}" \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo "✅ RDS Endpoint: ${DB_ENDPOINT}"

# ============================================================================
# 4. CREATE ELASTICACHE REDIS (Optional but recommended)
# ============================================================================
echo ""
echo "🔴 Creating ElastiCache Redis..."
REDIS_CLUSTER_ID="${PROJECT_NAME}-redis"

if ! aws elasticache describe-cache-clusters \
    --cache-cluster-id "${REDIS_CLUSTER_ID}" \
    --region "${AWS_REGION}" &>/dev/null; then
    
    aws elasticache create-cache-cluster \
        --cache-cluster-id "${REDIS_CLUSTER_ID}" \
        --cache-node-type cache.t3.micro \
        --engine redis \
        --num-cache-nodes 1 \
        --region "${AWS_REGION}" \
        --tags "Key=Project,Value=${PROJECT_NAME}"
    
    echo "⏳ Waiting for Redis cluster to be available..."
    aws elasticache wait cache-cluster-available \
        --cache-cluster-id "${REDIS_CLUSTER_ID}" \
        --region "${AWS_REGION}"
    
    echo "✅ Redis cluster created"
else
    echo "✅ Redis cluster already exists: ${REDIS_CLUSTER_ID}"
fi

# Get Redis endpoint
REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters \
    --cache-cluster-id "${REDIS_CLUSTER_ID}" \
    --show-cache-node-info \
    --region "${AWS_REGION}" \
    --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' \
    --output text)

echo "✅ Redis Endpoint: ${REDIS_ENDPOINT}"

# ============================================================================
# 5. CREATE IAM ROLE FOR ECS TASKS
# ============================================================================
echo ""
echo "🔐 Creating IAM role for ECS tasks..."
ROLE_NAME="${PROJECT_NAME}-ecs-task-role"

# Create trust policy
cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
    --role-name "${ROLE_NAME}" \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --description "Role for VisionX Eval ECS tasks" \
    --region "${AWS_REGION}" 2>/dev/null || echo "Role already exists"

# Create policy document
cat > /tmp/task-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:SendMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:${AWS_REGION}:*:${QUEUE_NAME}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:${AWS_REGION}::foundation-model/amazon.nova-micro-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Attach policy
POLICY_ARN=$(aws iam create-policy \
    --policy-name "${ROLE_NAME}-policy" \
    --policy-document file:///tmp/task-policy.json \
    --query 'Policy.Arn' \
    --output text 2>/dev/null || aws iam list-policies --query "Policies[?PolicyName=='${ROLE_NAME}-policy'].Arn" --output text)

aws iam attach-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-arn "${POLICY_ARN}" 2>/dev/null || echo "Policy already attached"

echo "✅ IAM role created: ${ROLE_NAME}"

# ============================================================================
# 6. OUTPUT CONFIGURATION
# ============================================================================
echo ""
echo "============================================================================"
echo "✅ AWS INFRASTRUCTURE SETUP COMPLETE!"
echo "============================================================================"
echo ""
echo "📋 Configuration for your .env files:"
echo ""
echo "# Backend (.env)"
echo "DATABASE_HOST=${DB_ENDPOINT}"
echo "DATABASE_PORT=5432"
echo "DATABASE_USER=${DB_USERNAME}"
echo "DATABASE_PASSWORD=${DB_PASSWORD}"
echo "DATABASE_NAME=${DB_NAME}"
echo ""
echo "AWS_REGION=${AWS_REGION}"
echo "AWS_S3_BUCKET=${BUCKET_NAME}"
echo "AWS_SQS_QUEUE_URL=${QUEUE_URL}"
echo ""
echo "# Worker (.env)"
echo "AWS_REGION=${AWS_REGION}"
echo "AWS_S3_BUCKET=${BUCKET_NAME}"
echo "AWS_SQS_QUEUE_URL=${QUEUE_URL}"
echo "AI_PROVIDER=bedrock"
echo "AI_MODEL=amazon.nova-micro-v1:0"
echo ""
echo "# Redis (optional)"
echo "REDIS_HOST=${REDIS_ENDPOINT}"
echo "REDIS_PORT=6379"
echo ""
echo "============================================================================"
echo "💾 Configuration saved to: aws-config.env"
echo "============================================================================"

# Save to file
cat > aws-config.env <<EOF
# VisionX Eval AWS Configuration
# Generated: $(date)

# Backend Configuration
DATABASE_HOST=${DB_ENDPOINT}
DATABASE_PORT=5432
DATABASE_USER=${DB_USERNAME}
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_NAME=${DB_NAME}

# AWS Resources
AWS_REGION=${AWS_REGION}
AWS_S3_BUCKET=${BUCKET_NAME}
AWS_SQS_QUEUE_URL=${QUEUE_URL}

# Worker Configuration
AI_PROVIDER=bedrock
AI_MODEL=amazon.nova-micro-v1:0

# Redis Configuration
REDIS_HOST=${REDIS_ENDPOINT}
REDIS_PORT=6379

# IAM Role
ECS_TASK_ROLE_ARN=arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/${ROLE_NAME}
EOF

echo ""
echo "📌 IMPORTANT: Save your database password securely!"
echo "   DB Password: ${DB_PASSWORD}"
echo ""
echo "🔗 Next Steps:"
echo "1. Copy configuration to your apps:"
echo "   cp aws-config.env apps/backend/.env"
echo "   cp aws-config.env apps/worker/.env"
echo ""
echo "2. Update security groups in AWS Console to allow:"
echo "   - RDS: Port 5432 from your IP"
echo "   - Redis: Port 6379 from ECS tasks"
echo ""
echo "3. Test the connection:"
echo "   psql -h ${DB_ENDPOINT} -U ${DB_USERNAME} -d ${DB_NAME}"
echo ""
echo "💰 Estimated Monthly Cost: ~\$25-35"
echo "   - RDS t3.micro: ~\$15"
echo "   - ElastiCache t3.micro: ~\$12"
echo "   - S3 + SQS: ~\$1-5 (usage-based)"
echo "   - Amazon Nova Micro AI: ~\$8 (300 teams, hourly)"
echo ""
echo "✅ Done! Your AWS infrastructure is ready."
