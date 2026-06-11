import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { DatabaseConnection } from './infrastructure/database/DatabaseConnection';
import { UsuarioRepository } from './infrastructure/repositories/UsuarioRepository';
import { LoginUseCase } from './application/useCases/LoginUseCase';
import { SignupUseCase } from './application/useCases/SignupUseCase';
import { AuthController } from './presentation/controllers/AuthController';
import { createAuthRoutes } from './presentation/routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_muito_seguro_aqui';

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? true,
  credentials: true,
}));

const database = new DatabaseConnection(DATABASE_URL);
const usuarioRepository = new UsuarioRepository(database);
const loginUseCase = new LoginUseCase(usuarioRepository, JWT_SECRET);
const signupUseCase = new SignupUseCase(usuarioRepository);
const authController = new AuthController(loginUseCase, signupUseCase);

app.use('/auth', createAuthRoutes(authController));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Auth Service is running' });
});

async function runMigrations() {
  try {
    await database.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        perfil VARCHAR(50) DEFAULT 'user',
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Auth Service: migrations aplicadas com sucesso.');
  } catch (err) {
    console.error('Auth Service: erro ao aplicar migrations:', err);
  }
}

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Auth Service: falha nas migrations, iniciando mesmo assim:', err);
  app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
  });
});
