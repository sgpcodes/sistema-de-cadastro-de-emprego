import { CreateWorkerUseCase } from '../CreateWorkerUseCase';
import { IWorkerRepository } from '../../../domain/repositories/IWorkerRepository';
import { Worker } from '../../../domain/entities/Worker';

describe('CreateWorkerUseCase', () => {
  let createWorkerUseCase: CreateWorkerUseCase;
  let mockRepository: IWorkerRepository;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    createWorkerUseCase = new CreateWorkerUseCase(mockRepository);
  });

  it('deve criar um trabalhador com dados válidos', async () => {
    const worker = new Worker('Ana Paula Santos', '12345678901', 'ATIVO', '11999999999');
    worker.id = 1;
    (mockRepository.create as jest.Mock).mockResolvedValue(worker);

    const result = await createWorkerUseCase.execute({
      nome: 'Ana Paula Santos',
      cpf: '12345678901',
      telefone: '11999999999',
    });

    expect(result.nome).toBe('Ana Paula Santos');
    expect(result.cpf).toBe('12345678901');
    expect(result.status).toBe('ATIVO');
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar erro quando nome não é informado', async () => {
    await expect(
      createWorkerUseCase.execute({ nome: '', cpf: '12345678901' })
    ).rejects.toThrow('Nome é obrigatório');
  });

  it('deve lançar erro quando CPF não é informado', async () => {
    await expect(
      createWorkerUseCase.execute({ nome: 'João Silva', cpf: '' })
    ).rejects.toThrow('CPF é obrigatório');
  });

  it('deve normalizar o CPF removendo formatação antes de salvar', async () => {
    const worker = new Worker('João Silva', '12345678901', 'ATIVO');
    worker.id = 2;
    (mockRepository.create as jest.Mock).mockResolvedValue(worker);

    await createWorkerUseCase.execute({
      nome: 'João Silva',
      cpf: '123.456.789-01',
    });

    const callArg = (mockRepository.create as jest.Mock).mock.calls[0][0];
    expect(callArg.cpf).toBe('12345678901');
  });

  it('deve usar status ATIVO como padrão quando não informado', async () => {
    const worker = new Worker('Maria Costa', '98765432100', 'ATIVO');
    (mockRepository.create as jest.Mock).mockResolvedValue(worker);

    await createWorkerUseCase.execute({ nome: 'Maria Costa', cpf: '98765432100' });

    const callArg = (mockRepository.create as jest.Mock).mock.calls[0][0];
    expect(callArg.status).toBe('ATIVO');
  });
});
