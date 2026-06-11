import { Worker, IWorker } from '../entities/Worker';

export interface IWorkerRepository {
  create(worker: IWorker): Promise<Worker>;
  findAll(): Promise<Worker[]>;
  findById(id: number): Promise<Worker | null>;
  update(id: number, worker: Partial<IWorker>): Promise<Worker>;
  delete(id: number): Promise<boolean>;
}
