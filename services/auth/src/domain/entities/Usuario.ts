export interface IUsuario {
  id?: number;
  email: string;
  senhaHash: string;
  nome: string;
  perfil: 'ADMIN' | 'ATENDENTE' | 'EMPRESA' | 'TRABALHADOR';
  ativo: boolean;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Usuario {
  constructor(
    public email: string,
    public senhaHash: string,
    public nome: string,
    public perfil: 'ADMIN' | 'ATENDENTE' | 'EMPRESA' | 'TRABALHADOR',
    public ativo: boolean = true,
    public id?: number,
    public criadoEm?: Date,
    public atualizadoEm?: Date
  ) {}
}
