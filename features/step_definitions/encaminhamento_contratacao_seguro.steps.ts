import { Given, When, Then, Before } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import * as assert from 'assert';

const WORKERS_URL = process.env.WORKERS_SERVICE_URL || 'http://localhost:3002';
const REFERRALS_URL = process.env.REFERRALS_SERVICE_URL || 'http://localhost:3003';
const ASSISTANCE_URL = process.env.ASSISTANCE_SERVICE_URL || 'http://localhost:3004';

async function post(url: string, body: object): Promise<{ status: number; data: any }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function put(url: string, body: object): Promise<{ status: number; data: any }> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function get(url: string): Promise<{ status: number; data: any }> {
  const res = await fetch(url);
  const data: any = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

Before(function (this: CustomWorld) {
  this.reset();
});

// ── Encaminhamento ─────────────────────────────────────────────────────────

Given('que existe um trabalhador disponível com CPF {string}', async function (
  this: CustomWorld, cpf: string
) {
  const res = await post(`${WORKERS_URL}/workers`, {
    nome: 'Trabalhador BDD',
    cpf: cpf.replace(/\D/g, ''),
    status: 'ATIVO',
  });
  this.context.response = { status: res.status, data: res.data };
  if (res.data?.id) (this as any)._workerId = res.data.id;
});

Given('que existe uma vaga aberta com ID registrado', async function (this: CustomWorld) {
  const compRes = await post(`${REFERRALS_URL}/companies`, {
    razao_social: 'Empresa BDD Teste',
    status: 'ATIVA',
  });
  const empresaId = compRes.data?.id;
  const vagaRes = await post(`${REFERRALS_URL}/vacancies`, {
    empresa_id: empresaId,
    cargo: 'Analista BDD',
    status: 'ABERTA',
  });
  (this as any)._vagaId = vagaRes.data?.id;
});

When('o atendente registra o encaminhamento do trabalhador para a vaga', async function (
  this: CustomWorld
) {
  const res = await post(`${REFERRALS_URL}/referrals`, {
    trabalhadorId: (this as any)._workerId || 1,
    vagaId: (this as any)._vagaId || 1,
  });
  this.context.response = { status: res.status, data: res.data };
});

Then('o encaminhamento é salvo com status {string}', function (
  this: CustomWorld, status: string
) {
  assert.ok(
    this.context.response?.status === 201 || this.context.response?.status === 200,
    `Esperado 201/200, recebido ${this.context.response?.status}`
  );
  if (this.context.response?.data?.status) {
    assert.strictEqual(this.context.response.data.status, status);
  }
});

// ── Status do trabalhador ─────────────────────────────────────────────────

Given('que o trabalhador com CPF {string} está disponível', async function (
  this: CustomWorld, cpf: string
) {
  const res = await post(`${WORKERS_URL}/workers`, {
    nome: 'Trabalhador Status BDD',
    cpf: cpf.replace(/\D/g, ''),
    status: 'ATIVO',
  });
  (this as any)._workerId = res.data?.id;
});

Given('que o trabalhador com CPF {string} está encaminhado', async function (
  this: CustomWorld, cpf: string
) {
  const res = await post(`${WORKERS_URL}/workers`, {
    nome: 'Trabalhador Contratacao BDD',
    cpf: cpf.replace(/\D/g, ''),
    status: 'ENCAMINHADO',
  });
  (this as any)._workerId = res.data?.id;
});

When('o atendente atualiza o status do trabalhador para {string}', async function (
  this: CustomWorld, status: string
) {
  const id = (this as any)._workerId;
  const res = await put(`${WORKERS_URL}/workers/${id}`, {
    nome: 'Trabalhador Status BDD',
    cpf: '20030040050',
    status,
  });
  this.context.response = { status: res.status, data: res.data };
});

Then('o trabalhador é atualizado com sucesso', function (this: CustomWorld) {
  assert.strictEqual(this.context.response?.status, 200,
    `Esperado 200, recebido ${this.context.response?.status}`);
});

Then('o novo status do trabalhador é {string}', function (this: CustomWorld, status: string) {
  assert.strictEqual(this.context.response?.data?.status, status);
});

// ── Contratação ────────────────────────────────────────────────────────────

When('a empresa confirma a contratação', async function (this: CustomWorld) {
  const id = (this as any)._workerId;
  const res = await put(`${WORKERS_URL}/workers/${id}`, {
    nome: 'Trabalhador Contratacao BDD',
    cpf: '30040050060',
    status: 'CONTRATADO',
  });
  this.context.response = { status: res.status, data: res.data };
});

Then('o status do trabalhador é atualizado para {string}', function (
  this: CustomWorld, status: string
) {
  assert.strictEqual(this.context.response?.data?.status, status);
});

Then('as informações são persistidas no sistema', function (this: CustomWorld) {
  assert.ok(this.context.response?.data?.id, 'ID do trabalhador deve estar presente');
});

Given('que existem trabalhadores cadastrados no sistema', async function (this: CustomWorld) {
  await post(`${WORKERS_URL}/workers`, {
    nome: 'Trabalhador Lista BDD',
    cpf: '99988877700',
    status: 'ATIVO',
  });
});

When('o atendente consulta a lista de trabalhadores', async function (this: CustomWorld) {
  const res = await get(`${WORKERS_URL}/workers`);
  this.context.response = { status: res.status, data: res.data };
});

Then('o sistema retorna a listagem com sucesso', function (this: CustomWorld) {
  assert.strictEqual(this.context.response?.status, 200);
  assert.ok(Array.isArray(this.context.response?.data), 'Deve retornar um array');
});

// ── Seguro-Desemprego / Assistência ─────────────────────────────────────

Given('que o atendente está na tela de assistência', function (this: CustomWorld) {
  this.context.nome = undefined;
});

When('registra um atendimento de tipo {string} para {string}', async function (
  this: CustomWorld, tipo: string, nome: string
) {
  const res = await post(`${ASSISTANCE_URL}/assistance`, {
    nome_atendido: nome,
    cpf_atendido: null,
    tipo,
    descricao: 'Atendimento registrado via teste BDD',
  });
  this.context.response = { status: res.status, data: res.data };
});

Then('o atendimento é registrado com sucesso', function (this: CustomWorld) {
  assert.strictEqual(this.context.response?.status, 201,
    `Esperado 201, recebido ${this.context.response?.status}: ${JSON.stringify(this.context.response?.data)}`
  );
});

Then('o tipo do atendimento é {string}', function (this: CustomWorld, tipo: string) {
  assert.strictEqual(this.context.response?.data?.tipo, tipo);
});

Given('que existem atendimentos cadastrados no sistema', async function (this: CustomWorld) {
  await post(`${ASSISTANCE_URL}/assistance`, {
    nome_atendido: 'Pessoa BDD Lista',
    tipo: 'ORIENTACAO_PROFISSIONAL',
    descricao: 'Atendimento de teste BDD',
  });
});

When('o atendente consulta a lista de atendimentos', async function (this: CustomWorld) {
  const res = await get(`${ASSISTANCE_URL}/assistance`);
  this.context.response = { status: res.status, data: res.data };
});

Then('o sistema retorna os atendimentos cadastrados', function (this: CustomWorld) {
  assert.strictEqual(this.context.response?.status, 200);
  assert.ok(Array.isArray(this.context.response?.data), 'Deve retornar um array');
});
