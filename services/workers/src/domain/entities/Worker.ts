export type WorkerStatus = 'ATIVO' | 'ENCAMINHADO' | 'CONTRATADO' | 'INATIVO';

export interface IWorker {
  id?: number;
  nome: string;
  cpf: string;
  telefone?: string;
  escolaridade?: string;
  profissao?: string;
  experiencia?: string;
  status: WorkerStatus;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Worker {
  constructor(
    public nome: string,
    public cpf: string,
    public status: WorkerStatus = 'ATIVO',
    public telefone?: string,
    public escolaridade?: string,
    public profissao?: string,
    public experiencia?: string,
    public id?: number,
    public criadoEm?: Date,
    public atualizadoEm?: Date
  ) {}
}
