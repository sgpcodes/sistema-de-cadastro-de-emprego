import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3005;
const DATABASE_URL = process.env.DATABASE_URL || '';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? true,
  credentials: true,
}));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Reports Service is running' });
});

app.get('/dashboard', async (_req, res) => {
  try {
    const totalTrabalhadores = await pool.query('SELECT COUNT(*) FROM trabalhadores');
    const totalVagas = await pool.query('SELECT COUNT(*) FROM vagas');
    const totalEncaminhamentos = await pool.query('SELECT COUNT(*) FROM encaminhamentos');
    const totalAtendimentos = await pool.query('SELECT COUNT(*) FROM atendimentos');
    const contratacoes = await pool.query(
      'SELECT COUNT(*) FROM encaminhamentos WHERE status = $1',
      ['CONTRATADO']
    );

    const totalTrabalhador = parseInt(totalTrabalhadores.rows[0].count);
    const totalVaga = parseInt(totalVagas.rows[0].count);
    const totalEncaminhamento = parseInt(totalEncaminhamentos.rows[0].count);
    const totalAtendimento = parseInt(totalAtendimentos.rows[0].count);
    const totalContratacoes = parseInt(contratacoes.rows[0].count);

    const taxaEmpregabilidade = totalTrabalhador > 0
      ? ((totalContratacoes / totalTrabalhador) * 100).toFixed(2)
      : 0;

    res.status(200).json({
      totalTrabalhadores: totalTrabalhador,
      totalVagas: totalVaga,
      totalEncaminhamentos: totalEncaminhamento,
      totalAtendimentos: totalAtendimento,
      totalContratacoes,
      taxaEmpregabilidade
    });
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/reports/workers-status', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT status, COUNT(*) FROM trabalhadores GROUP BY status'
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/reports/vacancies-status', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT status, COUNT(*) FROM vagas GROUP BY status'
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Reports Service running on port ${PORT}`);
});
