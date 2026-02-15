# 🚨 BEDROCK SETUP STATUS

## Current Situation

✅ **Working:**
- AWS CLI installed and configured
- Credentials valid (Account: 668226797980, User: cli-main)
- Region: us-east-1 (Bedrock available)
- IAM permissions appear correct

❌ **Blocked On:**
**Anthropic use case form not submitted**

## The Error

```
ResourceNotFoundException: Model use case details have not been submitted 
for this account. Fill out the Anthropic use case details form before 
using the model.
```

## What This Means

AWS Bedrock requires you to **submit a use case form** before using Anthropic Claude models. This is a one-time requirement to prevent abuse.

## ✅ Solution: Submit Use Case Form (5 minutes)

### Quick Start

```bash
./scripts/submit-use-case.sh
```

### Manual Steps

1. **Open AWS Console:**
   ```
   https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess
   ```

2. **Request Model Access:**
   - Click **"Manage model access"** or **"Modify model access"**
   - Find **"Anthropic"** section
   - Check boxes:
     - ✅ **Claude 3 Haiku** (required - cheapest)
     - ✅ **Claude 3 Sonnet** (optional - better quality)
   - Click **"Next"** or **"Request model access"**

3. **Fill Out Use Case Form:**
   ```
   Company Name: [Your company/team name]
   Use Case: AI-powered code evaluation for hackathon projects
   Industry: Technology/Software
   Monthly Invocations: 10,000-50,000
   Description: Automated evaluation of student/hackathon code 
                submissions using Claude for code review and scoring
   ```

4. **Submit:**
   - Click **"Submit"**
   - ⏳ Wait **15-30 minutes** (usually instant, up to 2 hours max)
   - 📧 You'll receive email confirmation

5. **Verify:**
   ```bash
   ./scripts/setup-bedrock.sh
   ```
   
   Should see: `✅ Model invocation successful!`

## Alternative: Use Different Models

If you want to start immediately without waiting:

### Option 1: Amazon Titan (No form required)

```bash
# Update model in config
sed -i '' 's/anthropic.claude-3-haiku/amazon.titan-text-express-v1/g' \
  apps/worker/src/config/aws.config.ts
```

**Pros:** Instant access, no form
**Cons:** Lower quality than Claude, ~$0.0008/1K tokens

### Option 2: Meta Llama (No form required)

```bash
# Update model
export AWS_BEDROCK_MODEL_ID=meta.llama3-70b-instruct-v1:0
```

**Pros:** Good quality, instant access
**Cons:** More expensive than Haiku (~$0.00265/1K tokens)

### Option 3: Wait for Claude (Recommended)

**Best choice** - highest quality, cheapest cost, worth 30-min wait

## Timeline

```
Now          Submit form via AWS Console
  ↓
+5 min       Form submitted
  ↓
+15-30 min   AWS approves (check email)
  ↓
Now          Run: ./scripts/setup-bedrock.sh
  ↓
Done!        ✅ Start using Claude 3 Haiku
```

## What To Do Now

1. **Submit the form** (link above)
2. **While waiting**, you can:
   - Continue building other features
   - Use mock AI responses for testing
   - Switch to Titan temporarily
   - Set up the rest of the infrastructure

3. **After approval**, run:
   ```bash
   # Verify setup
   ./scripts/setup-bedrock.sh
   
   # Test integration
   cd apps/worker
   ts-node scripts/test-bedrock.ts
   
   # Start worker
   pnpm run start:dev
   ```

## FAQ

**Q: How long does approval take?**
A: Usually instant to 30 minutes. Max 2 hours. Check email.

**Q: Will my form be rejected?**
A: Very unlikely for legitimate use cases. Be honest about usage.

**Q: Can I use a different model without the form?**
A: Yes - Titan and Llama models don't require forms (see alternatives above)

**Q: Is this a one-time thing?**
A: Yes - once approved, all Anthropic models are accessible forever

**Q: What if I'm rejected?**
A: Contact AWS support or use alternative models

## Current Scripts Available

```bash
./scripts/diagnose-bedrock.sh      # Check what's blocking you
./scripts/submit-use-case.sh       # Guide for form submission
./scripts/setup-bedrock.sh         # Full setup test (run after approval)
./scripts/enable-bedrock.sh        # Enable model access (already done)

cd apps/worker
ts-node scripts/test-bedrock.ts    # Test integration (after approval)
```

## Cost Reminder

Once approved:
- **Input:** $0.25 per 1M tokens (~4 chars/token)
- **Output:** $1.25 per 1M tokens
- **Per evaluation:** ~$0.002
- **300 teams × 24h:** ~$16-20/day

🎯 **Next Action:** Submit the use case form → Wait 30 min → Test!
