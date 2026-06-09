import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    email: string;
    nome: string;
    perfil: string;
  };
}

export class LoginUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private jwtSecret: string
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const usuario = await this.usuarioRepository.findByEmail(request.email);

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(request.senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new Error('Senha incorreta');
    }

    if (!usuario.ativo) {
      throw new Error('Usuário inativo');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    return {
      token,
      usuario: {
        id: usuario.id!,
        email: usuario.email,
        nome: usuario.nome,
        perfil: usuario.perfil
      }
    };
  }
}
