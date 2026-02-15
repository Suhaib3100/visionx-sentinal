# AWS Bedrock Integration Guide

## Overview

VisionX Eval now uses **AWS Bedrock with Claude 3 Haiku** for cost-effective AI evaluation of hackathon projects. This is significantly cheaper than OpenAI GPT-4 while maintaining high-quality code analysis.

## Cost Comparison

| Provider | Model | Cost per 1M Input Tokens | Cost per 1M Output Tokens |
|----------|-------|-------------------------|---------------------------|
| AWS Bedrock | Claude 3 Haiku | **$0.25** | **$1.25** |
| AWS Bedrock | Claude 3 Sonnet | $3.00 | $15.00 |
| OpenAI | GPT-4 Turbo | $10.00 | $30.00 |

**Estimated cost per evaluation (~4K tokens in, ~1K tokens out): $0.002 vs $0.07 with GPT-4** 🎉

## Architecture

```
┌─────────────────┐
│  Backend API    │
│  (NestJS)       │
└────────┬────────┘
         │ Upload Snapshot
         ▼
┌─────────────────┐
│   AWS S3        │
│  (Storage)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│   AWS SQS       │────▶│  Worker Service  │
│  (Queue)        │     │  (NestJS)        │
└─────────────────┘     └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │ Static   │  │   AWS    │  │ Database │
            │ Analysis │  │ Bedrock  │  │ Storage  │
            └──────────┘  └──────────┘  └──────────┘
                          │ Claude 3 │
                          │  Haiku   │
                          └──────────┘
```

## Configuration

### Environment Variables

Update your `.env.aws` file:

```bash
# AWS Bedrock Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here

# Bedrock Model Settings
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
AWS_BEDROCK_MAX_TOKENS=4096
AWS_BEDROCK_TEMPERATURE=0.3
```

### Available Models

You can change the model by updating `AWS_BEDROCK_MODEL_ID`:

- **`anthropic.claude-3-haiku-20240307-v1:0`** (Recommended) - Fastest, cheapest, great for code analysis
- **`anthropic.claude-3-sonnet-20240229-v1:0`** - Balanced performance and cost
- **`anthropic.claude-3-opus-20240229-v1:0`** - Highest quality, most expensive

## AWS Setup

### 1. Enable Bedrock Model Access

1. Go to AWS Console → Bedrock → Model Access
2. Click "Enable specific models"
3. Enable:
   - Claude 3 Haiku
   - Claude 3 Sonnet (optional)
4. Wait for approval (usually instant for Haiku)

### 2. IAM Permissions

Your AWS credentials need these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
      ]
    }
  ]
}
```

### 3. Regional Availability

Claude 3 models are available in these regions:
- `us-east-1` (N. Virginia) ✅ Recommended
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `ap-southeast-1` (Singapore)

## Implementation Details

### Services

1. **LLMClientService** (`llm-client.service.ts`)
   - Manages Bedrock API calls
   - Handles retries with exponential backoff
   - Logs token usage for cost tracking
   - Returns default scores if AI fails

2. **PromptBuilderService** (`prompt-builder.service.ts`)
   - Constructs evaluation prompts
   - Selects most relevant files
   - Limits token usage to control costs
   - Prioritizes key files (main, config, README)

3. **EvaluationOrchestratorService** (`evaluation-orchestrator.service.ts`)
   - Coordinates full evaluation pipeline
   - Runs static analysis (lint, complexity, security, tests)
   - Calls AI evaluation via Bedrock
   - Calculates final score: 60% static + 40% AI

### Evaluation Metrics

#### Static Analysis (60% weight)
- ✅ Lint Score (25%)
- ✅ Complexity Score (20%)
- ✅ Security Score (30%)
- ✅ Test Coverage (25%)

#### AI Evaluation (40% weight)
- 🤖 Innovation (25%)
- 🏗️ Architecture (20%)
- 📈 Scalability (15%)
- 🎯 Alignment (20%)
- 📖 Readability (10%)
- 📝 Documentation (10%)

## Testing

### Test Bedrock Connection

```bash
# In worker directory
pnpm run start:dev
```

The service will log:
```
[LLMClientService] Bedrock LLM initialized with model: anthropic.claude-3-haiku-20240307-v1:0 in region: us-east-1
```

### Monitor Token Usage

Check logs for cost tracking:
```
[LLMClientService] Bedrock API usage: 3482 input + 892 output tokens. Stop reason: end_turn
```

### Calculate Costs

```
Cost = (Input Tokens / 1M * $0.25) + (Output Tokens / 1M * $1.25)
Example: (3482 / 1M * 0.25) + (892 / 1M * 1.25) = $0.0020
```

## Error Handling

The system handles:
- ✅ **Throttling**: Automatic retry with 10s delay
- ✅ **Timeouts**: Exponential backoff
- ✅ **Invalid JSON**: Extracts JSON from markdown-wrapped responses
- ✅ **API Failures**: Returns default scores (50/100) to continue pipeline
- ✅ **Rate Limits**: Configurable retry attempts

## Monitoring

### CloudWatch Metrics

Track via AWS Console → Bedrock → Metrics:
- Model invocations
- Input/output tokens
- Errors and throttles
- Latency

### Cost Monitoring

Set up billing alerts in AWS:
1. CloudWatch → Billing → Create Alarm
2. Set threshold (e.g., $10/day)
3. Add SNS notification

## Best Practices

1. **Use Haiku for Development**: Cheapest option, fast responses
2. **Batch Processing**: Process evaluations in parallel (up to 10 concurrent)
3. **Token Limits**: Current limit is 50K characters per prompt (~12K tokens)
4. **Prompt Optimization**: Only send most relevant files (max 20 files)
5. **Cache Results**: Store AI evaluations to avoid re-processing

## Troubleshooting

### "Model not available"
→ Check Bedrock model access in AWS Console

### "AccessDeniedException"
→ Verify IAM permissions include `bedrock:InvokeModel`

### "ThrottlingException"
→ Reduce `WORKER_CONCURRENCY` in .env file

### "Empty response"
→ Check CloudWatch logs for Bedrock API errors

## Migration from OpenAI

**Completed changes:**
- ✅ Replaced `openai` package with `@aws-sdk/client-bedrock-runtime`
- ✅ Updated `LLMClientService` to use Bedrock API
- ✅ Added Bedrock configuration to `aws.config.ts`
- ✅ Updated environment files with Bedrock settings
- ✅ Fixed TypeScript types and error handling

**No code changes needed** - the service automatically uses Bedrock!

## Next Steps

- [ ] Test with real evaluation workload
- [ ] Monitor token usage and costs
- [ ] Tune prompt to reduce token usage
- [ ] Consider caching frequent evaluations
- [ ] Add A/B testing between Haiku and Sonnet

## Resources

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Claude 3 Model Card](https://www.anthropic.com/claude)
- [Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
