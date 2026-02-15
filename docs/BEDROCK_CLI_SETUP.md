# AWS Bedrock CLI Setup - Quick Guide

## Current Status ✅

- ✅ AWS CLI installed
- ✅ AWS credentials configured (Account: 668226797980)
- ✅ Region: us-east-1 (Bedrock available)
- ✅ Claude 3 Haiku model exists
- ❌ **Model access not enabled** ← Need to fix this

## Enable Model Access (2 minutes)

### Method 1: Automatic (Recommended)

```bash
./scripts/enable-bedrock.sh
```

This will:
1. Open AWS Console in your browser
2. Guide you through enabling the model
3. Test the connection automatically

### Method 2: Manual Steps

1. **Open AWS Console:**
   ```
   https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess
   ```

2. **Enable Model:**
   - Click "Manage model access" or "Edit"
   - Find **Anthropic** section
   - Check ✅ **Claude 3 Haiku**
   - (Optional) Check ✅ **Claude 3 Sonnet** (better quality)
   - Click **"Save changes"**
   - Wait ~30 seconds

3. **Verify:**
   ```bash
   ./scripts/setup-bedrock.sh
   ```

## IAM Permissions Required

Your AWS user/role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
```

### Add Permissions via CLI:

```bash
# Create policy
cat > /tmp/bedrock-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Attach to your user (replace YOUR_USERNAME)
aws iam put-user-policy \
  --user-name YOUR_USERNAME \
  --policy-name BedrockAccess \
  --policy-document file:///tmp/bedrock-policy.json
```

## Test Integration

Once enabled, run:

```bash
# Full setup test
./scripts/setup-bedrock.sh

# Or test with TypeScript
cd apps/worker
pnpm add -D ts-node
ts-node scripts/test-bedrock.ts
```

## Troubleshooting

### "AccessDeniedException"
→ IAM permissions missing. Add the policy above.

### "ValidationException: Model not found"
→ Model access not enabled. Follow Method 1 or 2 above.

### "ThrottlingException"
→ Too many requests. Wait 1 minute and retry.

### "ResourceNotFoundException"
→ Wrong region. Use us-east-1, us-west-2, or eu-west-1.

## Cost Monitoring

Set up billing alert:

```bash
# Create SNS topic for alerts
aws sns create-topic --name bedrock-billing-alerts

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:668226797980:bedrock-billing-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Create billing alarm ($10/day threshold)
aws cloudwatch put-metric-alarm \
  --alarm-name bedrock-daily-cost \
  --alarm-description "Alert when Bedrock costs exceed $10/day" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:668226797980:bedrock-billing-alerts
```

## Expected Costs

| Usage | Input Tokens | Output Tokens | Cost |
|-------|--------------|---------------|------|
| 1 evaluation | ~4,000 | ~1,000 | $0.002 |
| 100 evaluations | ~400K | ~100K | $0.20 |
| 1,000 evaluations | ~4M | ~1M | $2.25 |
| 300 teams × 24h | ~28.8M | ~7.2M | $16.20/day |

**Total estimated cost for hackathon (24h):** ~$16-20

---

## Next Steps After Enabling

1. ✅ Enable model access (above)
2. Run setup: `./scripts/setup-bedrock.sh`
3. Test integration: `cd apps/worker && ts-node scripts/test-bedrock.ts`
4. Start worker: `cd apps/worker && pnpm run start:dev`
5. Upload test snapshot to trigger evaluation

🎉 You're ready to evaluate hackathon projects with AI!
