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

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Workers Service is running' });
});

app.post('/workers', async (req, res) => {
  try {
    const { usuarioId, cpf, telefone, escolaridade, profissao, experiencia } = req.body;
    const result = await pool.query(
      `INSERT INTO trabalhadores (usuario_id, cpf, telefone, escolaridade, profissao, experiencia)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [usuarioId, cpf, telefone, escolaridade, profissao, experiencia]
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
    const { cpf, telefone, escolaridade, profissao, experiencia, status } = req.body;
    const result = await pool.query(
      `UPDATE trabalhadores
       SET cpf = $1, telefone = $2, escolaridade = $3, profissao = $4, experiencia = $5, status = $6, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [cpf, telefone, escolaridade, profissao, experiencia, status, id]
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

app.listen(PORT, () => {
  console.log(`Workers Service running on port ${PORT}`);
});
