import { SignupUseCase } from '../../useCases/SignupUseCase';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { Usuario } from '../../../domain/entities/Usuario';
import * as bcrypt from 'bcrypt';

describe('SignupUseCase', () => {
  let signupUseCase: SignupUseCase;
  let mockRepository: IUsuarioRepository;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    signupUseCase = new SignupUseCase(mockRepository);
  });

  it('should signup successfully with valid data', async () => {
    (mockRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    const novoUsuario = new Usuario(
      'newuser@example.com',
      await bcrypt.hash('senha123', 10),
      'New User',
      'TRABALHADOR',
      true,
      1
    );

    (mockRepository.create as jest.Mock).mockResolvedValue(novoUsuario);

    const response = await signupUseCase.execute({
      email: 'newuser@example.com',
      senha: 'senha123',
      nome: 'New User',
      perfil: 'TRABALHADOR'
    });

    expect(response.email).toBe('newuser@example.com');
    expect(response.id).toBe(1);
    expect(mockRepository.create).toHaveBeenCalled();
  });

  it('should fail if email already exists', async () => {
    const usuarioExistente = new Usuario(
      'existing@example.com',
      'hash',
      'Existing User',
      'TRABALHADOR',
      true,
      1
    );

    (mockRepository.findByEmail as jest.Mock).mockResolvedValue(usuarioExistente);

    await expect(
      signupUseCase.execute({
        email: 'existing@example.com',
        senha: 'senha123',
        nome: 'New User',
        perfil: 'TRABALHADOR'
      })
    ).rejects.toThrow('Email já cadastrado');
  });
});
