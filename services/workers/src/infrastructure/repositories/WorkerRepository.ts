import { IWorkerRepository } from '../../domain/repositories/IWorkerRepository';
import { Worker, IWorker } from '../../domain/entities/Worker';
import { WorkerFactory } from '../../domain/factories/WorkerFactory';
import { DatabaseConnection } from '../database/DatabaseConnection';

export class WorkerRepository implements IWorkerRepository {
  constructor(private readonly db: DatabaseConnection) {}

  async create(worker: IWorker): Promise<Worker> {
    const result = await this.db.query(
      `INSERT INTO trabalhadores (nome, cpf, telefone, escolaridade, profissao, experiencia, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [worker.nome, worker.cpf, worker.telefone || null, worker.escolaridade || null,
       worker.profissao || null, worker.experiencia || null, worker.status || 'ATIVO']
    );
    return WorkerFactory.createFromDbRow(result.rows[0]);
  }

  async findAll(): Promise<Worker[]> {
    const result = await this.db.query(
      'SELECT * FROM trabalhadores ORDER BY nome'
    );
    return result.rows.map(WorkerFactory.createFromDbRow);
  }

  async findById(id: number): Promise<Worker | null> {
    const result = await this.db.query(
      'SELECT * FROM trabalhadores WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return WorkerFactory.createFromDbRow(result.rows[0]);
  }

  async update(id: number, data: Partial<IWorker>): Promise<Worker> {
    const result = await this.db.query(
      `UPDATE trabalhadores
       SET nome=$1, cpf=$2, telefone=$3, escolaridade=$4, profissao=$5, experiencia=$6,
           status=$7, atualizado_em=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [data.nome, data.cpf, data.telefone || null, data.escolaridade || null,
       data.profissao || null, data.experiencia || null, data.status, id]
    );
    return WorkerFactory.createFromDbRow(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query(
      'DELETE FROM trabalhadores WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}
