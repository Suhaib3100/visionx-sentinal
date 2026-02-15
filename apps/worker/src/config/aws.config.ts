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
    // Claude 3 Haiku - Most cost-effective model
    modelId: process.env.AWS_BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0',
    maxTokens: parseInt(process.env.AWS_BEDROCK_MAX_TOKENS || '4096', 10),
    temperature: parseFloat(process.env.AWS_BEDROCK_TEMPERATURE || '0.3'),
  },
}));
