# AWS Bedrock Inference Profiles Guide

## Overview

Claude Haiku 4.5 **requires** using **Inference Profiles** instead of direct model IDs. Inference profiles provide:
- ✅ **Cross-region routing** for maximum throughput
- ✅ **~10% cost savings** with global profiles
- ✅ **Automatic failover** during regional outages
- ✅ **No additional routing costs**

## Why Inference Profiles?

Starting with Claude Haiku 4.5 (released Oct 2025), AWS Bedrock requires using inference profiles for on-demand throughput:

```bash
# ❌ This FAILS:
--model-id anthropic.claude-haiku-4-5-20251001-v1:0

# ✅ This WORKS:
--model-id arn:aws:bedrock:us-east-1:668226797980:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0
```

**Error without inference profile:**
```
ValidationException: Invocation of model ID with on-demand throughput isn't supported. 
Retry your request with the ID or ARN of an inference profile that contains this model.
```

## Available Profiles for Claude Haiku 4.5

### 🌍 Global Profile (RECOMMENDED)

**ARN:** `arn:aws:bedrock:us-east-1:668226797980:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0`

**Advantages:**
- 🏆 **~10% cheaper** than regional profiles
- 🚀 **Maximum throughput** via worldwide routing
- 🌐 Routes requests to any AWS commercial region
- 💰 **Best for cost optimization**

**Use when:**
- You prioritize cost savings and performance
- No data residency requirements
- Want maximum availability

**Pricing:**
- Input: $0.001 per 1K tokens
- Output: $0.005 per 1K tokens

### 🇺🇸 US Regional Profile

**ARN:** `arn:aws:bedrock:us-east-1:668226797980:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0`

**Advantages:**
- 📍 **Data stays in US regions** (us-east-1, us-east-2, us-west-2)
- ✅ **Compliance-friendly** for data residency requirements
- 🔒 **Higher control** over data location

**Use when:**
- You have data residency requirements
- GDPR/CCPA/HIPAA compliance needs
- Organization policy requires US-only processing

**Pricing:**
- Same as global: $0.001 / $0.005 per 1K tokens

## Configuration

### Environment Variables

```bash
# Global Profile (Recommended)
AWS_BEDROCK_MODEL_ID=arn:aws:bedrock:us-east-1:668226797980:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0

# US Regional Profile (For compliance)
# AWS_BEDROCK_MODEL_ID=arn:aws:bedrock:us-east-1:668226797980:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0
```

### CLI Usage

```bash
# List available inference profiles
aws bedrock list-inference-profiles --region us-east-1

# Filter for Claude Haiku profiles
aws bedrock list-inference-profiles --region us-east-1 | \
  jq '.inferenceProfileSummaries[] | select(.models[].modelArn | contains("claude-haiku"))'

# Test invocation
aws bedrock-runtime invoke-model \
  --region us-east-1 \
  --model-id "arn:aws:bedrock:us-east-1:ACCOUNT:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0" \
  --body file://request.json \
  response.json
```

### SDK Usage (TypeScript)

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

const command = new InvokeModelCommand({
  // Use inference profile ARN, not model ID
  modelId: 'arn:aws:bedrock:us-east-1:668226797980:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0',
  body: JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

const response = await client.send(command);
```

## Cost Comparison

### VisionX Eval - 300 Team Hackathon (Daily Cost)

| Model | Input Cost | Output Cost | Daily Total | Savings vs OpenAI |
|-------|-----------|-------------|-------------|-------------------|
| **Claude Haiku 4.5 (Global)** | $50 | $550 | **$600** | **$488/day (45%)** |
| Claude Haiku 4.5 (US) | $55 | $605 | $660 | $428/day |
| OpenAI GPT-4o-mini | $165 | $923 | $1,088 | Baseline |

**Annual savings with Global profile**: $178,120 🎉

## Common Errors & Solutions

### Error 1: "Model access is denied due to INVALID_PAYMENT_INSTRUMENT"

**Cause:** No valid payment method on AWS account

**Solution:**
1. Add payment method: https://console.aws.amazon.com/billing/home#/paymentmethods
2. Wait 2 minutes for propagation
3. Retry request

### Error 2: "ValidationException: Invocation with on-demand throughput isn't supported"

**Cause:** Using direct model ID instead of inference profile ARN

**Solution:** Replace model ID with inference profile ARN (see Configuration above)

### Error 3: "AccessDeniedException: Model use case details not submitted"

**Cause:** Marketplace subscription not approved

**Solution:**
1. Visit: https://console.aws.amazon.com/bedrock/home#/modelaccess
2. Click "Edit" → Enable "Claude Haiku 4.5"
3. Accept marketplace agreement
4. Wait 5-10 minutes for provisioning

## Best Practices

### 1. Use Global Profile for Most Cases
```typescript
// ✅ Best: Global profile for cost + performance
const MODEL_ID = 'arn:aws:bedrock:us-east-1:668226797980:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0';
```

### 2. Cache Inference Profile ARNs
```typescript
// Cache ARN at startup, don't query repeatedly
private readonly GLOBAL_PROFILE_ARN = process.env.AWS_BEDROCK_MODEL_ID;
```

### 3. Monitor Cross-Region Routing
```typescript
// Check CloudTrail logs for routing destinations
// Look for: additionalEventData.inferenceRegion
```

### 4. Set CloudWatch Billing Alerts
```bash
# Alert when daily costs exceed $700
aws cloudwatch put-metric-alarm \
  --alarm-name bedrock-daily-cost-alert \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --evaluation-periods 1 \
  --threshold 700
```

## Additional Resources

- **AWS Documentation**: https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html
- **List Profiles CLI**: `./scripts/list-inference-profiles.sh`
- **Test Profile**: `./scripts/test-global-profile.sh`
- **Fix Payment**: `./scripts/fix-payment.sh`
- **AWS Console**: https://console.aws.amazon.com/bedrock/home

## FAQ

### Q: Can I switch between profiles without code changes?

**A:** Yes! Change the `AWS_BEDROCK_MODEL_ID` environment variable:
```bash
# Switch to US profile
export AWS_BEDROCK_MODEL_ID="arn:aws:bedrock:us-east-1:668226797980:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0"
```

### Q: Do inference profiles work with all Claude models?

**A:** No. Older models (Claude 3 Haiku) support direct model IDs. Claude 4.5+ requires inference profiles.

### Q: What happens during a regional outage?

**A:** Inference profiles automatically route to healthy regions. No action needed.

### Q: Are there additional routing costs?

**A:** No. Pricing is based on your source region (us-east-1), not destination.

### Q: Can I create custom inference profiles?

**A:** Yes, using `Application Inference Profiles` for specific cost tracking and routing logic. See AWS docs for details.

---

**Last Updated:** Feb 15, 2026  
**Status:** ✅ Claude Haiku 4.5 Global Profile Active  
**Next Action:** Add payment method if you see INVALID_PAYMENT_INSTRUMENT error
