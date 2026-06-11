import { Worker } from '../../domain/entities/Worker';
import { IWorkerFilterStrategy } from './IWorkerFilterStrategy';

export class FilterByNameStrategy implements IWorkerFilterStrategy {
  constructor(private readonly query: string) {}

  filter(workers: Worker[]): Worker[] {
    const q = this.query.toLowerCase();
    return workers.filter((w) => w.nome.toLowerCase().includes(q));
  }
}
