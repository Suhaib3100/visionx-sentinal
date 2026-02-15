import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import awsConfig from './config/aws.config';
import workerConfig from './config/worker.config';

import { SQSModule } from './modules/sqs/sqs.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, awsConfig, workerConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [
          __dirname + '/entities/*.entity{.ts,.js}',
          __dirname + '/**/*.entity{.ts,.js}',
        ],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
      }),
    }),
    ScheduleModule.forRoot(),
    SQSModule,
    EvaluationModule,
    ScoringModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
