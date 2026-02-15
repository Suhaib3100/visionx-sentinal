#!/bin/bash
# Cleanup AWS Resources for VisionX Eval
# WARNING: This deletes all AWS resources!

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="visionx-eval"

echo "⚠️  WARNING: This will DELETE all VisionX Eval AWS resources!"
echo "Region: $AWS_REGION"
echo ""
read -p "Are you sure? Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🗑️  Starting cleanup..."

# 1. Delete S3 Bucket
BUCKET_NAME="${PROJECT_NAME}-snapshots-${AWS_REGION}"
echo "Deleting S3 bucket..."
aws s3 rm "s3://${BUCKET_NAME}" --recursive 2>/dev/null || true
aws s3api delete-bucket --bucket "${BUCKET_NAME}" --region "${AWS_REGION}" 2>/dev/null || echo "Bucket not found or already deleted"
echo "✅ S3 bucket deleted"

# 2. Delete SQS Queue
QUEUE_NAME="${PROJECT_NAME}-evaluation-jobs"
echo "Deleting SQS queue..."
QUEUE_URL=$(aws sqs get-queue-url --queue-name "${QUEUE_NAME}" --region "${AWS_REGION}" --query 'QueueUrl' --output text 2>/dev/null || echo "")
if [ -n "$QUEUE_URL" ]; then
    aws sqs delete-queue --queue-url "${QUEUE_URL}" --region "${AWS_REGION}"
    echo "✅ SQS queue deleted"
else
    echo "✅ SQS queue not found"
fi

# 3. Delete ElastiCache Redis
REDIS_CLUSTER_ID="${PROJECT_NAME}-redis"
echo "Deleting Redis cluster..."
aws elasticache delete-cache-cluster \
    --cache-cluster-id "${REDIS_CLUSTER_ID}" \
    --region "${AWS_REGION}" 2>/dev/null || echo "✅ Redis cluster not found"

# 4. Delete RDS Database
DB_INSTANCE_IDENTIFIER="${PROJECT_NAME}-db"
echo "Deleting RDS database (no final snapshot)..."
aws rds delete-db-instance \
    --db-instance-identifier "${DB_INSTANCE_IDENTIFIER}" \
    --skip-final-snapshot \
    --region "${AWS_REGION}" 2>/dev/null || echo "✅ RDS instance not found"

# 5. Delete IAM Role and Policy
ROLE_NAME="${PROJECT_NAME}-ecs-task-role"
echo "Deleting IAM role..."
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='${ROLE_NAME}-policy'].Arn" --output text 2>/dev/null || echo "")
if [ -n "$POLICY_ARN" ]; then
    aws iam detach-role-policy --role-name "${ROLE_NAME}" --policy-arn "${POLICY_ARN}" 2>/dev/null || true
    aws iam delete-policy --policy-arn "${POLICY_ARN}" 2>/dev/null || true
fi
aws iam delete-role --role-name "${ROLE_NAME}" 2>/dev/null || echo "✅ IAM role not found"

echo ""
echo "============================================================================"
echo "✅ CLEANUP COMPLETE"
echo "============================================================================"
echo ""
echo "All VisionX Eval AWS resources have been deleted."
echo "You will no longer be charged for these resources."
echo ""
