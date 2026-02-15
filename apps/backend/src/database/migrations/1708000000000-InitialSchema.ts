import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1708000000000 implements MigrationInterface {
  name = 'InitialSchema1708000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "snapshot_status_enum" AS ENUM ('pending', 'processing', 'completed', 'failed');
      CREATE TYPE "project_status_enum" AS ENUM ('active', 'submitted', 'disqualified');
    `);

    // Create teams table
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL UNIQUE,
        "slug" varchar NOT NULL UNIQUE,
        "members" jsonb NOT NULL,
        "registered_at" timestamp NOT NULL,
        "last_snapshot_at" timestamp,
        "total_snapshots" integer NOT NULL DEFAULT 0,
        "current_score" decimal(5,2) NOT NULL DEFAULT 0,
        "rank" integer NOT NULL DEFAULT 0,
        "is_disqualified" boolean NOT NULL DEFAULT false,
        "disqualification_reason" varchar,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create projects table
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "team_id" uuid NOT NULL,
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "category" varchar NOT NULL,
        "tech_stack" text NOT NULL,
        "repository_url" varchar,
        "demo_url" varchar,
        "status" "project_status_enum" NOT NULL DEFAULT 'active',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_projects_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE
      )
    `);

    // Create snapshots table
    await queryRunner.query(`
      CREATE TABLE "snapshots" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "team_id" uuid NOT NULL,
        "project_id" uuid NOT NULL,
        "timestamp" timestamp NOT NULL,
        "snapshot_number" integer NOT NULL,
        "s3_key" varchar NOT NULL,
        "size" bigint NOT NULL,
        "hash" varchar NOT NULL,
        "metadata" jsonb NOT NULL,
        "status" "snapshot_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_snapshots_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_snapshots_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
      )
    `);

    // Create static_metrics table
    await queryRunner.query(`
      CREATE TABLE "static_metrics" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "snapshot_id" uuid NOT NULL UNIQUE,
        "lint_score" decimal(5,2) NOT NULL,
        "lint_issues" jsonb NOT NULL,
        "complexity_score" decimal(5,2) NOT NULL,
        "complexity_metrics" jsonb NOT NULL,
        "security_score" decimal(5,2) NOT NULL,
        "security_issues" jsonb NOT NULL,
        "test_coverage" jsonb,
        "code_quality_score" decimal(5,2) NOT NULL,
        "total_score" decimal(5,2) NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_static_metrics_snapshot" FOREIGN KEY ("snapshot_id") REFERENCES "snapshots"("id") ON DELETE CASCADE
      )
    `);

    // Create ai_reports table
    await queryRunner.query(`
      CREATE TABLE "ai_reports" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "snapshot_id" uuid NOT NULL,
        "creativity_score" decimal(5,2) NOT NULL,
        "innovation_score" decimal(5,2) NOT NULL,
        "code_quality_score" decimal(5,2) NOT NULL,
        "architecture_score" decimal(5,2) NOT NULL,
        "documentation_score" decimal(5,2) NOT NULL,
        "overall_score" decimal(5,2) NOT NULL,
        "feedback" jsonb NOT NULL,
        "summary" text NOT NULL,
        "model" varchar NOT NULL,
        "tokens_used" integer NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create final_scores table
    await queryRunner.query(`
      CREATE TABLE "final_scores" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "team_id" uuid NOT NULL,
        "snapshot_id" uuid NOT NULL,
        "static_score" decimal(5,2) NOT NULL,
        "ai_score" decimal(5,2) NOT NULL,
        "total_score" decimal(5,2) NOT NULL,
        "rank" integer NOT NULL DEFAULT 0,
        "weight" jsonb NOT NULL,
        "breakdown" jsonb NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_final_scores_team" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE
      )
    `);

    // Create manual_overrides table
    await queryRunner.query(`
      CREATE TABLE "manual_overrides" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "team_id" uuid NOT NULL,
        "snapshot_id" uuid NOT NULL,
        "judge_id" uuid NOT NULL,
        "original_score" decimal(5,2) NOT NULL,
        "override_score" decimal(5,2) NOT NULL,
        "reason" text NOT NULL,
        "category" varchar NOT NULL,
        "approved" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_snapshots_team_id" ON "snapshots" ("team_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_snapshots_project_id" ON "snapshots" ("project_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_snapshots_status" ON "snapshots" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_final_scores_team_id" ON "final_scores" ("team_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_final_scores_rank" ON "final_scores" ("rank")`);
    await queryRunner.query(`CREATE INDEX "IDX_teams_rank" ON "teams" ("rank")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "manual_overrides"`);
    await queryRunner.query(`DROP TABLE "final_scores"`);
    await queryRunner.query(`DROP TABLE "ai_reports"`);
    await queryRunner.query(`DROP TABLE "static_metrics"`);
    await queryRunner.query(`DROP TABLE "snapshots"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE "project_status_enum"`);
    await queryRunner.query(`DROP TYPE "snapshot_status_enum"`);
  }
}
