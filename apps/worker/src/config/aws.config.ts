import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3: {
    bucket: process.env.AWS_S3_BUCKET || 'visionx-snapshots',
  },
  sqs: {
    queueUrl: process.env.AWS_SQS_QUEUE_URL,
  },
  bedrock: {
    // Amazon Nova Micro - AWS's own model, INSTANT ACCESS (no marketplace), 7x cheaper than Claude
    // Input: $0.000035/1K tokens, Output: $0.00014/1K tokens
    modelId: process.env.AWS_BEDROCK_MODEL_ID || 'amazon.nova-micro-v1:0',
    maxTokens: parseInt(process.env.AWS_BEDROCK_MAX_TOKENS || '4096', 10),
    temperature: parseFloat(process.env.AWS_BEDROCK_TEMPERATURE || '0.7'),
  },
}));
