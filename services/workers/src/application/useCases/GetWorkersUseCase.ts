import { IWorkerRepository } from '../../domain/repositories/IWorkerRepository';
import { Worker } from '../../domain/entities/Worker';
import { IWorkerFilterStrategy } from '../strategies/IWorkerFilterStrategy';

export class GetWorkersUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  async execute(filterStrategy?: IWorkerFilterStrategy): Promise<Worker[]> {
    const workers = await this.workerRepository.findAll();
    if (filterStrategy) {
      return filterStrategy.filter(workers);
    }
    return workers;
  }
}
