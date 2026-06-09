import { Request, Response } from 'express';
import { LoginUseCase, LoginRequest } from '../../application/useCases/LoginUseCase';
import { SignupUseCase, SignupRequest } from '../../application/useCases/SignupUseCase';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private signupUseCase: SignupUseCase
  ) {}

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      const request: LoginRequest = { email, senha };
      const response = await this.loginUseCase.execute(request);

      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(401).json({ erro: error.message });
    }
  }

  async signup(req: Request, res: Response): Promise<Response> {
    try {
      const { email, senha, nome, perfil } = req.body;

      if (!email || !senha || !nome || !perfil) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      const request: SignupRequest = { email, senha, nome, perfil };
      const response = await this.signupUseCase.execute(request);

      return res.status(201).json(response);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }
}
