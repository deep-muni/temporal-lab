import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Wait } from 'testcontainers';

const POSTGRES_IMAGE = 'pgvector/pgvector:0.8.6-pg16-trixie';
const READY_LOG_LINE = 'database system is ready to accept connections';

// Postgres logs the ready line once during initdb and once when it really
// starts; waiting for the log avoids health checks that Podman never reports.
export const createPostgresContainerBuilder = () =>
  new PostgreSqlContainer(POSTGRES_IMAGE).withWaitStrategy(
    Wait.forLogMessage(READY_LOG_LINE, 2),
  );
