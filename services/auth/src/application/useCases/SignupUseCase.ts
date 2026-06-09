import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import * as bcrypt from 'bcrypt';

export interface SignupRequest {
  email: string;
  senha: string;
  nome: string;
  perfil: 'ADMIN' | 'ATENDENTE' | 'EMPRESA' | 'TRABALHADOR';
}

export interface SignupResponse {
  id: number;
  email: string;
  nome: string;
  perfil: string;
}

export class SignupUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(request: SignupRequest): Promise<SignupResponse> {
    const usuarioExistente = await this.usuarioRepository.findByEmail(request.email);

    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(request.senha, 10);

    const usuario = await this.usuarioRepository.create({
      email: request.email,
      senhaHash,
      nome: request.nome,
      perfil: request.perfil,
      ativo: true
    });

    return {
      id: usuario.id!,
      email: usuario.email,
      nome: usuario.nome,
      perfil: usuario.perfil
    };
  }
}
