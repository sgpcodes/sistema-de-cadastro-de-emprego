import { IWorkerRepository } from '../../domain/repositories/IWorkerRepository';

export class DeleteWorkerUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.workerRepository.findById(id);
    if (!existing) {
      throw new Error('Trabalhador não encontrado');
    }
    await this.workerRepository.delete(id);
  }
}
