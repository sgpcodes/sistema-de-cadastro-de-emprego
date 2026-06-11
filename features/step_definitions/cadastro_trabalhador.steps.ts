import { Given, When, Then, Before } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import * as assert from 'assert';

const WORKERS_URL = process.env.WORKERS_SERVICE_URL || 'http://localhost:3002';

async function httpPost(path: string, body: object): Promise<{ status: number; data: any }> {
  const res = await fetch(`${WORKERS_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function httpGet(path: string): Promise<{ status: number; data: any }> {
  const res = await fetch(`${WORKERS_URL}${path}`);
  const data: any = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

Before(function (this: CustomWorld) {
  this.reset();
});

// ── Contexto ──────────────────────────────────────────────────────────────

Given('que o atendente está na tela de cadastro de trabalhador', function (this: CustomWorld) {
  this.context.nome = undefined;
  this.context.cpf = undefined;
});

Given('que existe um trabalhador cadastrado com CPF {string}', async function (
  this: CustomWorld, cpf: string
) {
  await httpPost('/workers', {
    nome: 'Trabalhador Existente',
    cpf: cpf.replace(/\D/g, ''),
    status: 'ATIVO',
  });
  this.context.cpf = cpf;
});

// ── Ações ─────────────────────────────────────────────────────────────────

When('preenche o nome {string}', function (this: CustomWorld, nome: string) {
  this.context.nome = nome;
});

When('preenche o CPF {string}', function (this: CustomWorld, cpf: string) {
  this.context.cpf = cpf;
});

When('preenche o telefone {string}', function (this: CustomWorld, tel: string) {
  this.context.telefone = tel;
});

When('clica em Salvar Trabalhador', async function (this: CustomWorld) {
  const res = await httpPost('/workers', {
    nome: this.context.nome,
    cpf: (this.context.cpf || '').replace(/\D/g, ''),
    telefone: this.context.telefone || null,
    status: 'ATIVO',
  });
  this.context.response = { status: res.status, data: res.data };
});

When('tenta cadastrar outro trabalhador com o mesmo CPF', async function (this: CustomWorld) {
  const res = await httpPost('/workers', {
    nome: 'Outro Nome',
    cpf: (this.context.cpf || '').replace(/\D/g, ''),
    status: 'ATIVO',
  });
  this.context.response = { status: res.status, data: res.data };
});

// ── Resultados ────────────────────────────────────────────────────────────

Then('o trabalhador é cadastrado com sucesso', function (this: CustomWorld) {
  assert.strictEqual(this.context.response?.status, 201,
    `Esperado 201, recebido ${this.context.response?.status}: ${JSON.stringify(this.context.response?.data)}`
  );
});

Then('o trabalhador aparece na listagem', async function (this: CustomWorld) {
  const res = await httpGet('/workers');
  const found = res.data.some(
    (w: any) => w.nome === this.context.nome ||
    w.cpf === (this.context.cpf || '').replace(/\D/g, '')
  );
  assert.ok(found, 'Trabalhador não encontrado na listagem');
});

Then('o sistema exibe erro de CPF duplicado', function (this: CustomWorld) {
  assert.strictEqual(this.context.response?.status, 400,
    `Esperado 400, recebido ${this.context.response?.status}`
  );
  assert.ok(
    this.context.response?.data?.erro?.includes('unique') ||
    this.context.response?.data?.erro?.includes('duplicat') ||
    this.context.response?.data?.erro?.includes('constraint'),
    'Mensagem de erro de CPF duplicado esperada'
  );
});

Then('o segundo cadastro não é salvo', function (this: CustomWorld) {
  assert.notStrictEqual(this.context.response?.status, 201,
    'Segundo cadastro não deveria ter sido salvo'
  );
});
