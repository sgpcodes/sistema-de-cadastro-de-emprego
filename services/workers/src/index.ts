import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { DatabaseConnection } from './infrastructure/database/DatabaseConnection';
import { WorkerRepository } from './infrastructure/repositories/WorkerRepository';
import { CreateWorkerUseCase } from './application/useCases/CreateWorkerUseCase';
import { GetWorkersUseCase } from './application/useCases/GetWorkersUseCase';
import { UpdateWorkerUseCase } from './application/useCases/UpdateWorkerUseCase';
import { DeleteWorkerUseCase } from './application/useCases/DeleteWorkerUseCase';
import { WorkerController } from './presentation/controllers/WorkerController';
import { createWorkerRoutes } from './presentation/routes/workerRoutes';

const app = express();
const PORT = process.env.PORT || 3002;
const DATABASE_URL = process.env.DATABASE_URL || '';

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? true,
  credentials: true,
}));

// Dependency Injection — wires all layers together
const db = new DatabaseConnection(DATABASE_URL);
const workerRepository = new WorkerRepository(db);
const createWorkerUseCase = new CreateWorkerUseCase(workerRepository);
const getWorkersUseCase = new GetWorkersUseCase(workerRepository);
const updateWorkerUseCase = new UpdateWorkerUseCase(workerRepository);
const deleteWorkerUseCase = new DeleteWorkerUseCase(workerRepository);
const workerController = new WorkerController(
  createWorkerUseCase,
  getWorkersUseCase,
  updateWorkerUseCase,
  deleteWorkerUseCase
);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Workers Service is running' });
});

app.use('/workers', createWorkerRoutes(workerController));

async function runMigrations() {
  const client = await db.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS trabalhadores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        cpf VARCHAR(11) UNIQUE,
        telefone VARCHAR(20),
        escolaridade VARCHAR(100),
        profissao VARCHAR(255),
        experiencia TEXT,
        status VARCHAR(50) DEFAULT 'ATIVO',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='nome') THEN
          ALTER TABLE trabalhadores ADD COLUMN nome VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='cpf') THEN
          ALTER TABLE trabalhadores ADD COLUMN cpf VARCHAR(11);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='escolaridade') THEN
          ALTER TABLE trabalhadores ADD COLUMN escolaridade VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='profissao') THEN
          ALTER TABLE trabalhadores ADD COLUMN profissao VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='experiencia') THEN
          ALTER TABLE trabalhadores ADD COLUMN experiencia TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='status') THEN
          ALTER TABLE trabalhadores ADD COLUMN status VARCHAR(50) DEFAULT 'ATIVO';
        END IF;
      END $$;
    `);

    console.log('Workers Service: migrations aplicadas com sucesso.');
  } catch (err) {
    console.error('Workers Service: erro ao aplicar migrations:', err);
  } finally {
    client.release();
  }
}

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`Workers Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Workers Service: falha nas migrations, iniciando mesmo assim:', err);
  app.listen(PORT, () => {
    console.log(`Workers Service running on port ${PORT}`);
  });
});
