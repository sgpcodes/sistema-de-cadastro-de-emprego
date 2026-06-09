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

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Referrals Service is running' });
});

// Vacancies CRUD
app.post('/vacancies', async (req, res) => {
  try {
    const { empresaId, cargo, requisitos, salario } = req.body;
    const result = await pool.query(
      `INSERT INTO vagas (empresa_id, cargo, requisitos, salario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [empresaId, cargo, requisitos, salario]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.get('/vacancies', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vagas');
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM vagas WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Vaga não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

// Referrals CRUD
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

app.listen(PORT, () => {
  console.log(`Referrals Service running on port ${PORT}`);
});
