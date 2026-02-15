import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

export interface LLMResponse {
  innovation_score: number;
  architecture_score: number;
  scalability_score: number;
  alignment_score: number;
  readability_score: number;
  documentation_score: number;
  feedback: string;
  risk_flags: string[];
}

@Injectable()
export class LLMClientService {
  private readonly logger = new Logger(LLMClientService.name);
  private bedrockClient: BedrockRuntimeClient;
  private modelId: string;
  private maxTokens: number;
  private temperature: number;
  private maxRetries: number = 3;
  private modelProvider: 'amazon' | 'anthropic' | 'other';

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('aws.region') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    
    this.modelId = this.configService.get<string>('aws.bedrock.modelId') || 
      'amazon.nova-micro-v1:0';
    this.maxTokens = this.configService.get<number>('aws.bedrock.maxTokens') || 4096;
    this.temperature = this.configService.get<number>('aws.bedrock.temperature') || 0.7;

    // Detect model provider for API format selection
    if (this.modelId.includes('amazon.nova') || this.modelId.includes('amazon.titan')) {
      this.modelProvider = 'amazon';
    } else if (this.modelId.includes('anthropic') || this.modelId.includes('claude')) {
      this.modelProvider = 'anthropic';
    } else {
      this.modelProvider = 'other';
    }

    // Initialize Bedrock client with optional credentials
    const clientConfig: any = { region };
    
    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }
    // If credentials are not provided, SDK will use default credential chain
    // (environment variables, EC2 instance profile, etc.)

    this.bedrockClient = new BedrockRuntimeClient(clientConfig);

    const isInferenceProfile = this.modelId.includes('inference-profile');
    const modelType = isInferenceProfile ? 'inference profile' : 'model';

    this.logger.log(
      `Bedrock LLM initialized - Provider: ${this.modelProvider}, ${modelType}: ${this.modelId}, Region: ${region}`
    );
    if (isInferenceProfile) {
      this.logger.log(`Using cross-region routing for maximum throughput and cost savings`);
    }
  }

  async evaluateCode(prompt: string): Promise<LLMResponse> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(
          `Calling Bedrock API (attempt ${attempt}/${this.maxRetries})...`
        );

        const fullPrompt = `You are an expert code reviewer evaluating hackathon projects. Provide structured JSON responses with scores and feedback.\n\n${prompt}\n\nRespond with a valid JSON object containing: innovation_score, architecture_score, scalability_score, alignment_score, readability_score, documentation_score (all 0-100), feedback (string), and risk_flags (array of strings).`;

        // Prepare request body based on model provider
        let requestBody: any;
        
        if (this.modelProvider === 'amazon') {
          // Amazon Nova format
          requestBody = {
            messages: [
              {
                role: 'user',
                content: [{ text: fullPrompt }],
              },
            ],
            inferenceConfig: {
              maxTokens: this.maxTokens,
              temperature: this.temperature,
            },
          };
        } else if (this.modelProvider === 'anthropic') {
          // Claude format
          requestBody = {
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            messages: [
              {
                role: 'user',
                content: fullPrompt,
              },
            ],
          };
        } else {
          throw new Error(`Unsupported model provider: ${this.modelProvider}`);
        }

        const command = new InvokeModelCommand({
          modelId: this.modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify(requestBody),
        });

        const response = await this.bedrockClient.send(command);
        const responseBody = JSON.parse(
          new TextDecoder().decode(response.body)
        );

        // Extract content based on provider
        let contentText: string = '';
        
        if (this.modelProvider === 'amazon') {
          // Amazon Nova response format
          if (!responseBody.output?.message?.content?.[0]?.text) {
            throw new Error('Empty response from Bedrock (Amazon Nova)');
          }
          contentText = responseBody.output.message.content[0].text;
          
          // Log token usage for Amazon Nova
          const inputTokens = responseBody.usage?.inputTokens || 0;
          const outputTokens = responseBody.usage?.outputTokens || 0;
          this.logger.log(
            `Bedrock API usage: ${inputTokens} input + ${outputTokens} output tokens`
          );
        } else if (this.modelProvider === 'anthropic') {
          // Claude response format
          if (!responseBody.content || !responseBody.content[0]) {
            throw new Error('Empty response from Bedrock (Claude)');
          }
          contentText = responseBody.content[0].text;
          
          // Log token usage for Claude
          this.logger.log(
            `Bedrock API usage: ${responseBody.usage?.input_tokens} input + ${responseBody.usage?.output_tokens} output tokens. Stop reason: ${responseBody.stop_reason}`
          );
        }

        // Extract JSON from the response (models might wrap it in markdown)
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in Bedrock response');
        }

        const parsed = JSON.parse(jsonMatch[0]) as LLMResponse;
        this.validateResponse(parsed);

        return parsed;
      } catch (error) {
        lastError = error as Error;

        if (this.isThrottlingError(error)) {
          this.logger.warn(`Throttling error, waiting before retry...`);
          await this.sleep(10000); // Wait 10 seconds
        } else if (this.isTimeoutError(error)) {
          this.logger.warn(`Timeout error: ${error.message}`);
          await this.sleep(5000);
        } else {
          this.logger.error(
            `Bedrock API error: ${error.message}`,
            error.stack
          );
        }

        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(delay);
        }
      }
    }

    // If all retries failed, log and return default scores
    this.logger.error(
      `Failed to evaluate code after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`
    );

    return this.getDefaultScores();
  }

  private validateResponse(response: LLMResponse): void {
    const requiredFields = [
      'innovation_score',
      'architecture_score',
      'scalability_score',
      'alignment_score',
      'readability_score',
      'documentation_score',
      'feedback',
      'risk_flags',
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate score ranges
    const scores = [
      response.innovation_score,
      response.architecture_score,
      response.scalability_score,
      response.alignment_score,
      response.readability_score,
      response.documentation_score,
    ];

    for (const score of scores) {
      if (typeof score !== 'number' || score < 0 || score > 100) {
        throw new Error(`Invalid score: ${score}. Must be between 0 and 100.`);
      }
    }

    if (!Array.isArray(response.risk_flags)) {
      throw new Error('risk_flags must be an array');
    }
  }

  private getDefaultScores(): LLMResponse {
    return {
      innovation_score: 50,
      architecture_score: 50,
      scalability_score: 50,
      alignment_score: 50,
      readability_score: 50,
      documentation_score: 50,
      feedback: 'Unable to complete AI evaluation. Manual review recommended.',
      risk_flags: ['evaluation_failed'],
    };
  }

  private isThrottlingError(error: any): boolean {
    return (
      error?.name === 'ThrottlingException' ||
      error?.$metadata?.httpStatusCode === 429
    );
  }

  private isTimeoutError(error: any): boolean {
    return (
      error?.code === 'ETIMEDOUT' ||
      error?.message?.includes('timeout') ||
      error?.name === 'TimeoutError'
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
