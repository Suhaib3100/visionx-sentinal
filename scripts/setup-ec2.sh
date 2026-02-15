#!/bin/bash

# VisionX Eval - AWS EC2 Deployment (Cheapest Option)
# FREE for 12 months (AWS free tier), then $6-7/month

set -e

echo "🚀 VisionX Eval - AWS EC2 Deployment"
echo "===================================="
echo "Cost: FREE (12 months), then ~\$6/month"
echo ""

# Configuration
AWS_REGION="us-east-1"
INSTANCE_TYPE="t3.micro"  # t2.micro for free tier
KEY_NAME="visionx-key"
SECURITY_GROUP="visionx-sg"
INSTANCE_NAME="visionx-eval-server"

# Check if key pair exists
if ! aws ec2 describe-key-pairs --key-names $KEY_NAME --region $AWS_REGION &>/dev/null; then
    echo "Creating SSH key pair..."
    aws ec2 create-key-pair \
        --key-name $KEY_NAME \
        --query 'KeyMaterial' \
        --output text \
        --region $AWS_REGION > ~/.ssh/${KEY_NAME}.pem
    chmod 400 ~/.ssh/${KEY_NAME}.pem
    echo "✓ Key pair created: ~/.ssh/${KEY_NAME}.pem"
fi

# Create security group
if ! aws ec2 describe-security-groups --group-names $SECURITY_GROUP --region $AWS_REGION &>/dev/null; then
    echo "Creating security group..."
    SG_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP \
        --description "VisionX Eval Security Group" \
        --region $AWS_REGION \
        --query 'GroupId' \
        --output text)
    
    # Allow SSH
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION
    
    # Allow HTTP
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION
    
    # Allow Backend API
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 3000 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION
    
    echo "✓ Security group created: $SG_ID"
else
    SG_ID=$(aws ec2 describe-security-groups \
        --group-names $SECURITY_GROUP \
        --region $AWS_REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text)
fi

echo ""
echo "Launching EC2 instance..."

# User data script to install Docker
USER_DATA=$(cat <<'EOF'
#!/bin/bash
# Update and install Docker
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js (for npm)
curl -sL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

echo "✓ Setup complete"
EOF
)

# Launch instance
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2 \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-groups $SECURITY_GROUP \
    --user-data "$USER_DATA" \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
    --region $AWS_REGION \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "✓ Instance launched: $INSTANCE_ID"
echo ""
echo "Waiting for instance to be running..."

aws ec2 wait instance-running \
    --instance-ids $INSTANCE_ID \
    --region $AWS_REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $AWS_REGION \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo ""
echo "=========================================="
echo "✅ EC2 Instance Created!"
echo "=========================================="
echo ""
echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "SSH Key: ~/.ssh/${KEY_NAME}.pem"
echo ""
echo "Next steps:"
echo "1. Wait 2-3 minutes for instance setup to complete"
echo "2. SSH into instance:"
echo "   ssh -i ~/.ssh/${KEY_NAME}.pem ec2-user@${PUBLIC_IP}"
echo ""
echo "3. Then run:"
echo "   ./scripts/deploy-to-ec2.sh $PUBLIC_IP"
echo ""
echo "Backend URL: http://${PUBLIC_IP}:3000"
echo ""
echo "💰 Cost: FREE (12 months free tier), then ~\$6-7/month"
