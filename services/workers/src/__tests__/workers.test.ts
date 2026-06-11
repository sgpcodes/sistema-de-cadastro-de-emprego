import { WorkerFactory } from '../domain/factories/WorkerFactory';
import { FilterByStatusStrategy } from '../application/strategies/FilterByStatusStrategy';
import { FilterByNameStrategy } from '../application/strategies/FilterByNameStrategy';
import { Worker } from '../domain/entities/Worker';

describe('WorkerFactory', () => {
  it('deve criar um Worker com dados válidos', () => {
    const worker = WorkerFactory.create({
      nome: 'Ana Paula Santos',
      cpf: '12345678901',
      status: 'ATIVO',
    });
    expect(worker).toBeInstanceOf(Worker);
    expect(worker.nome).toBe('Ana Paula Santos');
    expect(worker.cpf).toBe('12345678901');
    expect(worker.status).toBe('ATIVO');
  });

  it('deve normalizar CPF removendo pontuação', () => {
    const worker = WorkerFactory.create({
      nome: 'João Silva',
      cpf: '123.456.789-01',
    });
    expect(worker.cpf).toBe('12345678901');
  });

  it('deve lançar erro quando nome é vazio', () => {
    expect(() => WorkerFactory.create({ nome: '', cpf: '12345678901' }))
      .toThrow('Nome e CPF são obrigatórios');
  });

  it('deve usar status ATIVO como padrão', () => {
    const worker = WorkerFactory.create({ nome: 'Maria Costa', cpf: '11111111111' });
    expect(worker.status).toBe('ATIVO');
  });
});

describe('FilterByStatusStrategy', () => {
  const workers = [
    Object.assign(new Worker('A', '11111111111', 'ATIVO'), { id: 1 }),
    Object.assign(new Worker('B', '22222222222', 'ENCAMINHADO'), { id: 2 }),
    Object.assign(new Worker('C', '33333333333', 'CONTRATADO'), { id: 3 }),
  ];

  it('deve filtrar apenas trabalhadores com status ATIVO', () => {
    const result = new FilterByStatusStrategy('ATIVO').filter(workers);
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('A');
  });

  it('deve retornar lista vazia se nenhum trabalhador tem o status', () => {
    const result = new FilterByStatusStrategy('INATIVO').filter(workers);
    expect(result).toHaveLength(0);
  });
});

describe('FilterByNameStrategy', () => {
  const workers = [
    Object.assign(new Worker('Ana Souza', '11111111111', 'ATIVO'), { id: 1 }),
    Object.assign(new Worker('Bruno Lima', '22222222222', 'ATIVO'), { id: 2 }),
  ];

  it('deve filtrar por nome parcial (case insensitive)', () => {
    const result = new FilterByNameStrategy('ana').filter(workers);
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Ana Souza');
  });

  it('deve retornar todos quando query corresponde a múltiplos', () => {
    const result = new FilterByNameStrategy('a').filter(workers);
    expect(result).toHaveLength(2);
  });
});
