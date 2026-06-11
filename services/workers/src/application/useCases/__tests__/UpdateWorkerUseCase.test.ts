import { UpdateWorkerUseCase } from '../UpdateWorkerUseCase';
import { IWorkerRepository } from '../../../domain/repositories/IWorkerRepository';
import { Worker } from '../../../domain/entities/Worker';

describe('UpdateWorkerUseCase', () => {
  let updateWorkerUseCase: UpdateWorkerUseCase;
  let mockRepository: IWorkerRepository;

  const existingWorker = new Worker('Carlos Lima', '11122233344', 'ATIVO');
  existingWorker.id = 1;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    updateWorkerUseCase = new UpdateWorkerUseCase(mockRepository);
  });

  it('deve atualizar um trabalhador existente', async () => {
    const updated = new Worker('Carlos Lima', '11122233344', 'ENCAMINHADO');
    updated.id = 1;

    (mockRepository.findById as jest.Mock).mockResolvedValue(existingWorker);
    (mockRepository.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateWorkerUseCase.execute(1, { status: 'ENCAMINHADO' });

    expect(result.status).toBe('ENCAMINHADO');
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(mockRepository.update).toHaveBeenCalledWith(1, { status: 'ENCAMINHADO' });
  });

  it('deve lançar erro ao tentar atualizar trabalhador inexistente', async () => {
    (mockRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      updateWorkerUseCase.execute(999, { status: 'CONTRATADO' })
    ).rejects.toThrow('Trabalhador não encontrado');

    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('deve atualizar status para CONTRATADO', async () => {
    const updated = new Worker('Carlos Lima', '11122233344', 'CONTRATADO');
    updated.id = 1;

    (mockRepository.findById as jest.Mock).mockResolvedValue(existingWorker);
    (mockRepository.update as jest.Mock).mockResolvedValue(updated);

    const result = await updateWorkerUseCase.execute(1, { status: 'CONTRATADO' });
    expect(result.status).toBe('CONTRATADO');
  });
});
