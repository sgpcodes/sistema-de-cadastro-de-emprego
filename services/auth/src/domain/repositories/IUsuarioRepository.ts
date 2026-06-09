import { Usuario, IUsuario } from '../entities/Usuario';

export interface IUsuarioRepository {
  create(usuario: IUsuario): Promise<Usuario>;
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: number): Promise<Usuario | null>;
  update(id: number, usuario: Partial<IUsuario>): Promise<Usuario>;
  delete(id: number): Promise<boolean>;
}
