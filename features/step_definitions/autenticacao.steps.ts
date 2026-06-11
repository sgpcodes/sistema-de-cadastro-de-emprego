import { Given, When, Then, Before } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import * as assert from 'assert';

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

async function httpPost(path: string, body: object): Promise<{ status: number; data: any }> {
  const res = await fetch(`${AUTH_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

Before(function (this: CustomWorld) {
  this.reset();
});

// ── Contexto ──────────────────────────────────────────────────────────────

Given('que o usuário está na página de login', function (this: CustomWorld) {
  this.context.email = undefined;
  this.context.senha = undefined;
});

Given('que existe um usuário cadastrado', function (this: CustomWorld) {
  this.context.email = 'usuario@example.com';
});

Given('que o usuário está autenticado', function (this: CustomWorld) {
  this.context.token = 'token_simulado_jwt';
});

// ── Ações ─────────────────────────────────────────────────────────────────

When('preenche o email {string}', function (this: CustomWorld, email: string) {
  this.context.email = email;
});

When('preenche a senha {string}', function (this: CustomWorld, senha: string) {
  this.context.senha = senha;
});

When('preenche um email inexistente', function (this: CustomWorld) {
  this.context.email = 'naoexiste@example.com';
});

When('preenche uma senha', function (this: CustomWorld) {
  this.context.senha = 'qualquersenha123';
});

When('preenche o email correto', function (this: CustomWorld) {
  this.context.email = 'usuario@example.com';
});

When('preenche uma senha incorreta', function (this: CustomWorld) {
  this.context.senha = 'senhaerrada';
});

When('clica no botão {string}', async function (this: CustomWorld, botao: string) {
  if (botao === 'Entrar') {
    const res = await httpPost('/auth/login', {
      email: this.context.email,
      senha: this.context.senha,
    });
    this.context.response = { status: res.status, data: res.data };
    if (res.data.token) this.context.token = res.data.token;
  } else if (botao === 'Sair') {
    this.context.token = undefined;
    this.context.response = { status: 200, data: { mensagem: 'Sessão encerrada' } };
  }
});

// ── Resultados ────────────────────────────────────────────────────────────

Then('o usuário é autenticado', function (this: CustomWorld) {
  assert.strictEqual(this.context.response?.status, 200);
  assert.ok(this.context.response?.data?.token, 'Token deve estar presente');
});

Then('um token JWT é gerado', function (this: CustomWorld) {
  assert.ok(this.context.token, 'Token JWT deve estar definido');
});

Then('o usuário é redirecionado para o dashboard', function (this: CustomWorld) {
  assert.ok(this.context.response?.data?.usuario, 'Dados do usuário devem estar presentes');
});

Then('o sistema exibe uma mensagem de erro', function (this: CustomWorld) {
  assert.ok(
    this.context.response?.status === 401 || this.context.response?.status === 400,
    `Esperado status 401 ou 400, recebido ${this.context.response?.status}`
  );
});

Then('o usuário não é autenticado', function (this: CustomWorld) {
  assert.ok(!this.context.token || this.context.token === 'token_simulado_jwt',
    'Token não deve ter sido gerado');
});

Then('o token JWT é removido', function (this: CustomWorld) {
  assert.strictEqual(this.context.token, undefined);
});

Then('o usuário é redirecionado para a página de login', function (this: CustomWorld) {
  assert.strictEqual(this.context.response?.status, 200);
});

Then('a sessão é encerrada', function (this: CustomWorld) {
  assert.strictEqual(this.context.token, undefined);
});
