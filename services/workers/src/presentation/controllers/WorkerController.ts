import { Request, Response } from 'express';
import { CreateWorkerUseCase } from '../../application/useCases/CreateWorkerUseCase';
import { GetWorkersUseCase } from '../../application/useCases/GetWorkersUseCase';
import { UpdateWorkerUseCase } from '../../application/useCases/UpdateWorkerUseCase';
import { DeleteWorkerUseCase } from '../../application/useCases/DeleteWorkerUseCase';
import { FilterByStatusStrategy } from '../../application/strategies/FilterByStatusStrategy';
import { FilterByNameStrategy } from '../../application/strategies/FilterByNameStrategy';
import { WorkerStatus } from '../../domain/entities/Worker';

export class WorkerController {
  constructor(
    private readonly createWorkerUseCase: CreateWorkerUseCase,
    private readonly getWorkersUseCase: GetWorkersUseCase,
    private readonly updateWorkerUseCase: UpdateWorkerUseCase,
    private readonly deleteWorkerUseCase: DeleteWorkerUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const worker = await this.createWorkerUseCase.execute(req.body);
      res.status(201).json(worker);
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status, nome } = req.query;
      let strategy;
      if (status) strategy = new FilterByStatusStrategy(status as WorkerStatus);
      else if (nome) strategy = new FilterByNameStrategy(nome as string);

      const workers = await this.getWorkersUseCase.execute(strategy);
      res.status(200).json(workers);
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const workers = await this.getWorkersUseCase.execute();
      const worker = workers.find((w) => w.id === parseInt(req.params.id));
      if (!worker) {
        res.status(404).json({ erro: 'Trabalhador não encontrado' });
        return;
      }
      res.status(200).json(worker);
    } catch (error: any) {
      res.status(500).json({ erro: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const worker = await this.updateWorkerUseCase.execute(
        parseInt(req.params.id),
        req.body
      );
      res.status(200).json(worker);
    } catch (error: any) {
      const status = error.message === 'Trabalhador não encontrado' ? 404 : 400;
      res.status(status).json({ erro: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await this.deleteWorkerUseCase.execute(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      const status = error.message === 'Trabalhador não encontrado' ? 404 : 500;
      res.status(status).json({ erro: error.message });
    }
  }
}
