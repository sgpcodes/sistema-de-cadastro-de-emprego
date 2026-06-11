import { IWorkerRepository } from '../../domain/repositories/IWorkerRepository';
import { Worker, IWorker } from '../../domain/entities/Worker';

export class UpdateWorkerUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  async execute(id: number, data: Partial<IWorker>): Promise<Worker> {
    const existing = await this.workerRepository.findById(id);
    if (!existing) {
      throw new Error('Trabalhador não encontrado');
    }
    return this.workerRepository.update(id, data);
  }
}
