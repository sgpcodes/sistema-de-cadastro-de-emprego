import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3002;
const DATABASE_URL = process.env.DATABASE_URL || '';

const pool = new Pool({ connectionString: DATABASE_URL });

app.use(express.json());
app.use(cors());

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Garante que a tabela existe com o schema correto.
    // Necessário quando o volume Docker foi criado com um schema antigo,
    // pois o init.sql só executa na primeira criação do volume.
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

    // Adiciona colunas que possam estar faltando em tabelas já existentes
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='nome') THEN
          ALTER TABLE trabalhadores ADD COLUMN nome VARCHAR(255);
          UPDATE trabalhadores SET nome = 'Não informado' WHERE nome IS NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='cpf') THEN
          ALTER TABLE trabalhadores ADD COLUMN cpf VARCHAR(11);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='telefone') THEN
          ALTER TABLE trabalhadores ADD COLUMN telefone VARCHAR(20);
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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='criado_em') THEN
          ALTER TABLE trabalhadores ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trabalhadores' AND column_name='atualizado_em') THEN
          ALTER TABLE trabalhadores ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
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

// Servidor só sobe depois que as migrations terminam — evita race condition
runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`Workers Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Workers Service: falha crítica nas migrations, iniciando mesmo assim:', err);
  app.listen(PORT, () => {
    console.log(`Workers Service running on port ${PORT}`);
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Workers Service is running' });
});

app.post('/workers', async (req, res) => {
  try {
    const { nome, cpf, telefone, escolaridade, profissao, experiencia, status } = req.body;
    const result = await pool.query(
      `INSERT INTO trabalhadores (nome, cpf, telefone, escolaridade, profissao, experiencia, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nome, cpf, telefone, escolaridade, profissao, experiencia, status || 'ATIVO']
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.get('/workers', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trabalhadores');
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM trabalhadores WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Trabalhador não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.put('/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, telefone, escolaridade, profissao, experiencia, status } = req.body;
    const result = await pool.query(
      `UPDATE trabalhadores
       SET nome = $1, cpf = $2, telefone = $3, escolaridade = $4, profissao = $5, experiencia = $6, status = $7, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [nome, cpf, telefone, escolaridade, profissao, experiencia, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Trabalhador não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.delete('/workers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM trabalhadores WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Trabalhador não encontrado' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

