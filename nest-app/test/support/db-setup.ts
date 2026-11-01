import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execFileSync } from 'node:child_process';
import { createPostgresContainerBuilder } from './postgres-container.support';

let container: StartedPostgreSqlContainer | undefined;

export const dbSetup = async (): Promise<{ DATABASE_URL: string }> => {
  container = await createPostgresContainerBuilder().start();
  const DATABASE_URL = container.getConnectionUri();
  applyMigrations(DATABASE_URL);
  return { DATABASE_URL };
};

export const dbStop = async (): Promise<void> => {
  await container?.stop();
};

const applyMigrations = (databaseUrl: string): void => {
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });
};
