import { Pool, PoolClient } from 'pg';

export class DatabaseConnection {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async query(text: string, params?: any[]): Promise<any> {
    return this.pool.query(text, params);
  }

  async connect(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async end(): Promise<void> {
    return this.pool.end();
  }
}
