import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3004;
const DATABASE_URL = process.env.DATABASE_URL || '';

const pool = new Pool({ connectionString: DATABASE_URL });

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? true,
  credentials: true,
}));

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Garante que a tabela existe com o schema atualizado
    await client.query(`
      CREATE TABLE IF NOT EXISTS atendimentos (
        id SERIAL PRIMARY KEY,
        trabalhador_id INTEGER,
        nome_atendido VARCHAR(255),
        cpf_atendido VARCHAR(11),
        telefone_atendido VARCHAR(20),
        escolaridade VARCHAR(100),
        profissao VARCHAR(255),
        experiencia TEXT,
        cargo_desejado VARCHAR(255),
        tipo VARCHAR(100),
        descricao TEXT,
        data_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'CONCLUIDO',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Remove restrição NOT NULL de trabalhador_id (torna o campo opcional)
    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE atendimentos ALTER COLUMN trabalhador_id DROP NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // Remove CHECK constraint antiga de tipo para aceitar novos valores
    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE atendimentos DROP CONSTRAINT IF EXISTS atendimentos_tipo_check;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // Adiciona colunas de dados da pessoa atendida (para tabelas existentes)
    const newColumns: [string, string][] = [
      ['nome_atendido', 'VARCHAR(255)'],
      ['cpf_atendido', 'VARCHAR(11)'],
      ['telefone_atendido', 'VARCHAR(20)'],
      ['escolaridade', 'VARCHAR(100)'],
      ['profissao', 'VARCHAR(255)'],
      ['experiencia', 'TEXT'],
      ['cargo_desejado', 'VARCHAR(255)'],
    ];

    for (const [col, type] of newColumns) {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='atendimentos' AND column_name='${col}'
          ) THEN
            ALTER TABLE atendimentos ADD COLUMN ${col} ${type};
          END IF;
        END $$;
      `);
    }

    console.log('Assistance Service: migrations aplicadas com sucesso.');
  } catch (err) {
    console.error('Assistance Service: erro nas migrations:', err);
  } finally {
    client.release();
  }
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Assistance Service is running' });
});

// Assistance Records CRUD
app.post('/assistance', async (req, res) => {
  try {
    const {
      nome_atendido, cpf_atendido, telefone_atendido,
      escolaridade, profissao, experiencia, cargo_desejado,
      tipo, descricao
    } = req.body;

    const result = await pool.query(
      `INSERT INTO atendimentos
         (nome_atendido, cpf_atendido, telefone_atendido,
          escolaridade, profissao, experiencia, cargo_desejado,
          tipo, descricao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nome_atendido || null,
        cpf_atendido ? cpf_atendido.replace(/\D/g, '').slice(0, 11) : null,
        telefone_atendido || null,
        escolaridade || null,
        profissao || null,
        experiencia || null,
        cargo_desejado || null,
        tipo || null,
        descricao || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.get('/assistance', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM atendimentos ORDER BY criado_em DESC'
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM atendimentos WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Atendimento não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.put('/assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome_atendido, cpf_atendido, telefone_atendido,
      escolaridade, profissao, experiencia, cargo_desejado,
      tipo, descricao
    } = req.body;

    const result = await pool.query(
      `UPDATE atendimentos
       SET nome_atendido = $1, cpf_atendido = $2, telefone_atendido = $3,
           escolaridade = $4, profissao = $5, experiencia = $6,
           cargo_desejado = $7, tipo = $8, descricao = $9,
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        nome_atendido || null,
        cpf_atendido ? cpf_atendido.replace(/\D/g, '').slice(0, 11) : null,
        telefone_atendido || null,
        escolaridade || null,
        profissao || null,
        experiencia || null,
        cargo_desejado || null,
        tipo || null,
        descricao || null,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Atendimento não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.delete('/assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM atendimentos WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Atendimento não encontrado' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`Assistance Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Assistance Service: falha nas migrations, iniciando mesmo assim:', err);
  app.listen(PORT, () => {
    console.log(`Assistance Service running on port ${PORT}`);
  });
});
