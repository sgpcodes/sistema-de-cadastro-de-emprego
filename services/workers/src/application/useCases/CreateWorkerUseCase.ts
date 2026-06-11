import { IWorkerRepository } from '../../domain/repositories/IWorkerRepository';
import { Worker, IWorker } from '../../domain/entities/Worker';
import { WorkerFactory } from '../../domain/factories/WorkerFactory';

export interface CreateWorkerRequest {
  nome: string;
  cpf: string;
  telefone?: string;
  escolaridade?: string;
  profissao?: string;
  experiencia?: string;
  status?: string;
}

export class CreateWorkerUseCase {
  constructor(private readonly workerRepository: IWorkerRepository) {}

  async execute(request: CreateWorkerRequest): Promise<Worker> {
    if (!request.nome?.trim()) {
      throw new Error('Nome é obrigatório');
    }
    if (!request.cpf?.trim()) {
      throw new Error('CPF é obrigatório');
    }

    const worker = WorkerFactory.create(request as Partial<IWorker>);
    return this.workerRepository.create(worker);
  }
}
