#!/bin/bash

# Quick AWS EC2 Setup - Manual Steps

echo "📋 VisionX EC2 Quick Setup Guide"
echo "================================="
echo ""

echo "✅ Already created:"
echo "- SSH Key: ~/.ssh/visionx-key.pem"
echo "- Security Group: sg-027aa75f15f6d863f"
echo ""

echo "🚀 Option 1: Use AWS Console (Easiest - 5 minutes)"
echo "=================================================="
echo ""
echo "1. Go to: https://console.aws.amazon.com/ec2"
echo "2. Click 'Launch Instance'"
echo "3. Settings:"
echo "   - Name: visionx-eval-server"
echo "   - AMI: Amazon Linux 2023"
echo "   - Instance type: t3.micro (FREE tier)"
echo "   - Key pair: visionx-key"
echo "   - Security group: visionx-sg (sg-027aa75f15f6d863f)"
echo "   - Storage: 20 GB"
echo "4. Click 'Launch Instance'"
echo "5. Wait 2 minutes for it to start"
echo "6. Copy the Public IP address"
echo ""

echo "🔧 Option 2: Use CLI Command (30 seconds)"
echo "=========================================="
echo ""
echo "Run this command:"
echo ""
cat << 'EOF'
aws ec2 run-instances \
  --image-id resolve:ssm:/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --instance-type t3.micro \
  --key-name visionx-key \
  --security-group-ids sg-027aa75f15f6d863f \
  --user-data '#!/bin/bash
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=visionx-eval-server}]' \
  --region us-east-1
EOF

echo ""
echo "Then get the Instance ID and Public IP:"
echo ""
echo "aws ec2 describe-instances --filters 'Name=tag:Name,Values=visionx-eval-server' --query 'Reservations[0].Instances[0].[InstanceId,PublicIpAddress]' --output text --region us-east-1"
echo ""

echo "📝 After instance is running:"
echo "  1. Get Public IP from command above"
echo "  2. Run: ./scripts/deploy-to-ec2.sh <PUBLIC_IP>"
echo ""
echo "💰 Cost: FREE (12 months), then ~\$7/month"
