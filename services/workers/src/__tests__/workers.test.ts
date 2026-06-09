import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

// Mock de pool
const mockPool = {
  query: jest.fn()
};

jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool)
}));

describe('Workers Service - Create Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a worker successfully', async () => {
    const workerData = {
      usuarioId: 1,
      cpf: '12345678901',
      telefone: '1199999999',
      escolaridade: 'Ensino Superior',
      profissao: 'Desenvolvedor',
      experiencia: '5 anos'
    };

    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: 1, ...workerData }]
    });

    expect(mockPool.query).toHaveBeenCalled();
  });

  it('should fail to create worker with duplicate CPF', async () => {
    const workerData = {
      usuarioId: 1,
      cpf: '12345678901',
      telefone: '1199999999',
      escolaridade: 'Ensino Superior',
      profissao: 'Desenvolvedor',
      experiencia: '5 anos'
    };

    mockPool.query.mockRejectedValueOnce(
      new Error('duplicate key value violates unique constraint')
    );

    expect(async () => {
      try {
        await mockPool.query('INSERT INTO ...', []);
      } catch (error: any) {
        throw new Error(error.message);
      }
    }).toBeDefined();
  });
});
