import { Worker, IWorker, WorkerStatus } from '../entities/Worker';

/**
 * Factory Pattern — centraliza a criação de entidades Worker,
 * garantindo valores padrão e regras de negócio na construção do objeto.
 */
export class WorkerFactory {
  static create(data: Partial<IWorker>): Worker {
    if (!data.nome || !data.cpf) {
      throw new Error('Nome e CPF são obrigatórios para criar um trabalhador');
    }

    return new Worker(
      data.nome.trim(),
      data.cpf.replace(/\D/g, '').slice(0, 11),
      (data.status as WorkerStatus) || 'ATIVO',
      data.telefone?.trim() || undefined,
      data.escolaridade || undefined,
      data.profissao?.trim() || undefined,
      data.experiencia?.trim() || undefined,
      data.id
    );
  }

  static createFromDbRow(row: Record<string, any>): Worker {
    return new Worker(
      row.nome,
      row.cpf,
      row.status,
      row.telefone,
      row.escolaridade,
      row.profissao,
      row.experiencia,
      row.id,
      row.criado_em,
      row.atualizado_em
    );
  }
}
