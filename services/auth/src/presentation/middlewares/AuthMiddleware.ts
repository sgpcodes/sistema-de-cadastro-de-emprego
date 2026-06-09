import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuario?: {
    id: number;
    email: string;
    perfil: string;
  };
}

export class AuthMiddleware {
  constructor(private jwtSecret: string) {}

  authenticate = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      req.usuario = {
        id: decoded.id,
        email: decoded.email,
        perfil: decoded.perfil
      };
      return next();
    } catch (error) {
      return res.status(401).json({ erro: 'Token inválido' });
    }
  };

  authorize = (...perfis: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
      if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
        return res.status(403).json({ erro: 'Acesso negado' });
      }
      return next();
    };
  };
}
