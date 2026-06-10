import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3003;
const DATABASE_URL = process.env.DATABASE_URL || '';

const pool = new Pool({ connectionString: DATABASE_URL });

app.use(express.json());
app.use(cors());

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Garante que as tabelas existam (proteção contra volume Docker com schema antigo)
    await client.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        cnpj VARCHAR(14) UNIQUE,
        contato VARCHAR(255),
        email VARCHAR(255),
        telefone VARCHAR(20),
        localizacao VARCHAR(255),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS vagas (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
        cargo VARCHAR(255) NOT NULL,
        requisitos TEXT,
        salario DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'ABERTA',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS encaminhamentos (
        id SERIAL PRIMARY KEY,
        trabalhador_id INTEGER,
        vaga_id INTEGER REFERENCES vagas(id) ON DELETE CASCADE,
        data_encaminhamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'PENDENTE',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adiciona colunas faltantes em tabelas existentes com schema antigo
    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE empresas ALTER COLUMN cnpj DROP NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);
    await client.query(`
      ALTER TABLE empresas ADD COLUMN IF NOT EXISTS localizacao VARCHAR(255);
    `);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='cargo') THEN
          ALTER TABLE vagas ADD COLUMN cargo VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='requisitos') THEN
          ALTER TABLE vagas ADD COLUMN requisitos TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='salario') THEN
          ALTER TABLE vagas ADD COLUMN salario DECIMAL(10,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='status') THEN
          ALTER TABLE vagas ADD COLUMN status VARCHAR(50) DEFAULT 'ABERTA';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vagas' AND column_name='criado_em') THEN
          ALTER TABLE vagas ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    console.log('Referrals Service: migrations aplicadas com sucesso.');
  } catch (err) {
    console.error('Referrals Service: erro ao aplicar migrations:', err);
  } finally {
    client.release();
  }
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Referrals Service is running' });
});

// Companies
app.get('/companies', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM empresas ORDER BY razao_social');
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.post('/companies', async (req, res) => {
  try {
    const { razao_social, cnpj, contato, email, telefone, localizacao } = req.body;
    const result = await pool.query(
      `INSERT INTO empresas (razao_social, cnpj, contato, email, telefone, localizacao)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [razao_social, cnpj || null, contato || null, email || null, telefone || null, localizacao || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

// Vacancies
app.post('/vacancies', async (req, res) => {
  const client = await pool.connect();
  try {
    const { empresa, localizacao, cargo, requisitos, salario, status } = req.body;

    // Find existing company by name or create a new one
    let empresaId: number;
    const existing = await client.query(
      'SELECT id FROM empresas WHERE LOWER(razao_social) = LOWER($1) LIMIT 1',
      [empresa]
    );

    if (existing.rows.length > 0) {
      empresaId = existing.rows[0].id;
    } else {
      const created = await client.query(
        'INSERT INTO empresas (razao_social, localizacao) VALUES ($1, $2) RETURNING id',
        [empresa, localizacao || null]
      );
      empresaId = created.rows[0].id;
    }

    const result = await client.query(
      `INSERT INTO vagas (empresa_id, cargo, requisitos, salario, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [empresaId, cargo, requisitos || null, salario ? parseFloat(salario) : null, status || 'ABERTA']
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  } finally {
    client.release();
  }
});

app.get('/vacancies', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, e.razao_social AS empresa_nome, e.localizacao AS empresa_localizacao
      FROM vagas v
      LEFT JOIN empresas e ON v.empresa_id = e.id
      ORDER BY v.criado_em DESC
    `);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT v.*, e.razao_social AS empresa_nome, e.localizacao AS empresa_localizacao
       FROM vagas v
       LEFT JOIN empresas e ON v.empresa_id = e.id
       WHERE v.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Vaga não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.put('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE vagas SET status = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Vaga não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.delete('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vagas WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Vaga não encontrada' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

// Referrals
app.post('/referrals', async (req, res) => {
  try {
    const { trabalhadorId, vagaId } = req.body;
    const result = await pool.query(
      `INSERT INTO encaminhamentos (trabalhador_id, vaga_id)
       VALUES ($1, $2)
       RETURNING *`,
      [trabalhadorId, vagaId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.get('/referrals', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM encaminhamentos');
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.put('/referrals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE encaminhamentos
       SET status = $1, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Encaminhamento não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`Referrals Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Referrals Service: falha nas migrations, iniciando mesmo assim:', err);
  app.listen(PORT, () => {
    console.log(`Referrals Service running on port ${PORT}`);
  });
});
