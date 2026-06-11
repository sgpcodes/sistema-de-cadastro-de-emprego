import { Worker, WorkerStatus } from '../../domain/entities/Worker';
import { IWorkerFilterStrategy } from './IWorkerFilterStrategy';

export class FilterByStatusStrategy implements IWorkerFilterStrategy {
  constructor(private readonly status: WorkerStatus) {}

  filter(workers: Worker[]): Worker[] {
    return workers.filter((w) => w.status === this.status);
  }
}
