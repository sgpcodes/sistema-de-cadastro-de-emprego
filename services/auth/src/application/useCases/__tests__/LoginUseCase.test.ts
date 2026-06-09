import { LoginUseCase } from '../LoginUseCase';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { Usuario } from '../../../domain/entities/Usuario';
import * as bcrypt from 'bcrypt';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockRepository: IUsuarioRepository;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    loginUseCase = new LoginUseCase(mockRepository, 'test_secret');
  });

  it('should login successfully with valid credentials', async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    const usuario = new Usuario(
      'test@example.com',
      senhaHash,
      'Test User',
      'ATENDENTE',
      true,
      1
    );

    (mockRepository.findByEmail as jest.Mock).mockResolvedValue(usuario);

    const response = await loginUseCase.execute({
      email: 'test@example.com',
      senha: 'senha123'
    });

    expect(response.token).toBeDefined();
    expect(response.usuario.email).toBe('test@example.com');
  });

  it('should fail with non-existent user', async () => {
    (mockRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'notfound@example.com',
        senha: 'senha123'
      })
    ).rejects.toThrow('Usuário não encontrado');
  });

  it('should fail with wrong password', async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    const usuario = new Usuario(
      'test@example.com',
      senhaHash,
      'Test User',
      'ATENDENTE',
      true,
      1
    );

    (mockRepository.findByEmail as jest.Mock).mockResolvedValue(usuario);

    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        senha: 'wrongpassword'
      })
    ).rejects.toThrow('Senha incorreta');
  });

  it('should fail with inactive user', async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    const usuario = new Usuario(
      'test@example.com',
      senhaHash,
      'Test User',
      'ATENDENTE',
      false,
      1
    );

    (mockRepository.findByEmail as jest.Mock).mockResolvedValue(usuario);

    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        senha: 'senha123'
      })
    ).rejects.toThrow('Usuário inativo');
  });
});
