import { GetWorkersUseCase } from '../GetWorkersUseCase';
import { IWorkerRepository } from '../../../domain/repositories/IWorkerRepository';
import { Worker } from '../../../domain/entities/Worker';
import { FilterByStatusStrategy } from '../../strategies/FilterByStatusStrategy';
import { FilterByNameStrategy } from '../../strategies/FilterByNameStrategy';

describe('GetWorkersUseCase', () => {
  let getWorkersUseCase: GetWorkersUseCase;
  let mockRepository: IWorkerRepository;

  const workers = [
    Object.assign(new Worker('Ana Souza', '11111111111', 'ATIVO'), { id: 1 }),
    Object.assign(new Worker('Bruno Lima', '22222222222', 'ENCAMINHADO'), { id: 2 }),
    Object.assign(new Worker('Carla Dias', '33333333333', 'CONTRATADO'), { id: 3 }),
  ];

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    getWorkersUseCase = new GetWorkersUseCase(mockRepository);
    (mockRepository.findAll as jest.Mock).mockResolvedValue(workers);
  });

  it('deve retornar todos os trabalhadores sem filtro', async () => {
    const result = await getWorkersUseCase.execute();
    expect(result).toHaveLength(3);
  });

  it('deve filtrar trabalhadores por status usando FilterByStatusStrategy', async () => {
    const strategy = new FilterByStatusStrategy('ATIVO');
    const result = await getWorkersUseCase.execute(strategy);
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Ana Souza');
  });

  it('deve filtrar trabalhadores por nome usando FilterByNameStrategy', async () => {
    const strategy = new FilterByNameStrategy('Bruno');
    const result = await getWorkersUseCase.execute(strategy);
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Bruno Lima');
  });

  it('deve retornar lista vazia quando filtro não encontra resultados', async () => {
    const strategy = new FilterByStatusStrategy('INATIVO');
    const result = await getWorkersUseCase.execute(strategy);
    expect(result).toHaveLength(0);
  });
});
