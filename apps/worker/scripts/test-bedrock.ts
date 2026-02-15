#!/usr/bin/env node

/**
 * Test script for AWS Bedrock integration
 * 
 * This script tests the LLM client with a simple code evaluation
 * to verify Bedrock connectivity and token usage tracking.
 * 
 * Usage:
 *   cd apps/worker
 *   ts-node scripts/test-bedrock.ts
 */

import { LLMClientService } from '../src/modules/ai/services/llm-client.service';
import { PromptBuilderService } from '../src/modules/ai/services/prompt-builder.service';
import { ConfigService } from '@nestjs/config';

async function testBedrock() {
  console.log('🧪 Testing AWS Bedrock Integration...\n');

  // Mock ConfigService with test values
  const mockConfigService = {
    get: (key: string) => {
      const config = {
        'aws.region': process.env.AWS_REGION || 'us-east-1',
        'aws.accessKeyId': process.env.AWS_ACCESS_KEY_ID,
        'aws.secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
        'aws.bedrock.modelId': process.env.AWS_BEDROCK_MODEL_ID || 
          'anthropic.claude-3-haiku-20240307-v1:0',
        'aws.bedrock.maxTokens': parseInt(process.env.AWS_BEDROCK_MAX_TOKENS || '4096', 10),
        'aws.bedrock.temperature': parseFloat(process.env.AWS_BEDROCK_TEMPERATURE || '0.3'),
      };
      return config[key];
    },
  } as ConfigService;

  // Initialize services
  const llmClient = new LLMClientService(mockConfigService);
  const promptBuilder = new PromptBuilderService();

  try {
    console.log('📝 Building test prompt...');
    const testPrompt = promptBuilder.buildTestPrompt();
    console.log(`Prompt length: ${testPrompt.length} characters\n`);

    console.log('🚀 Calling Bedrock API...');
    const startTime = Date.now();
    
    const response = await llmClient.evaluateCode(testPrompt);
    
    const duration = Date.now() - startTime;

    console.log('\n✅ SUCCESS! Bedrock API response received\n');
    console.log('📊 Evaluation Results:');
    console.log('─────────────────────────────────────');
    console.log(`Innovation Score:     ${response.innovation_score}/100`);
    console.log(`Architecture Score:   ${response.architecture_score}/100`);
    console.log(`Scalability Score:    ${response.scalability_score}/100`);
    console.log(`Alignment Score:      ${response.alignment_score}/100`);
    console.log(`Readability Score:    ${response.readability_score}/100`);
    console.log(`Documentation Score:  ${response.documentation_score}/100`);
    console.log('─────────────────────────────────────');
    console.log(`\n💬 Feedback: ${response.feedback}`);
    console.log(`\n⚠️  Risk Flags: ${response.risk_flags.length ? response.risk_flags.join(', ') : 'None'}`);
    console.log(`\n⏱️  Response Time: ${duration}ms`);

    // Calculate estimated cost (approximate)
    const estimatedInputTokens = Math.ceil(testPrompt.length / 4); // ~4 chars per token
    const estimatedOutputTokens = 300; // Typical response size
    const cost = (estimatedInputTokens / 1_000_000 * 0.25) + 
                 (estimatedOutputTokens / 1_000_000 * 1.25);
    
    console.log(`\n💰 Estimated Cost: $${cost.toFixed(6)}`);
    console.log('─────────────────────────────────────\n');
    console.log('✨ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPossible issues:');
    console.error('  1. AWS credentials not configured');
    console.error('  2. Bedrock model access not enabled');
    console.error('  3. IAM permissions missing');
    console.error('  4. Invalid AWS region');
    console.error('\nCheck AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }
}

// Run test
testBedrock();
