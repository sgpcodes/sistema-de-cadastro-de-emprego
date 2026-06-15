import { Pool, PoolClient } from 'pg';

export class DatabaseConnection {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }

  async getConnection(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }
}
