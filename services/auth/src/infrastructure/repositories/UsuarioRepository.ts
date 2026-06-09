import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { Usuario, IUsuario } from '../../domain/entities/Usuario';
import { DatabaseConnection } from '../database/DatabaseConnection';

export class UsuarioRepository implements IUsuarioRepository {
  constructor(private database: DatabaseConnection) {}

  async create(usuario: IUsuario): Promise<Usuario> {
    const result = await this.database.query(
      `INSERT INTO usuarios (email, senha_hash, nome, perfil, ativo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [usuario.email, usuario.senhaHash, usuario.nome, usuario.perfil, usuario.ativo]
    );
    return this.mapToUsuario(result.rows[0]);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const result = await this.database.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? this.mapToUsuario(result.rows[0]) : null;
  }

  async findById(id: number): Promise<Usuario | null> {
    const result = await this.database.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? this.mapToUsuario(result.rows[0]) : null;
  }

  async update(id: number, usuario: Partial<IUsuario>): Promise<Usuario> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(usuario).forEach(([key, value]) => {
      const dbKey = this.camelToSnakeCase(key);
      fields.push(`${dbKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(id);
    const result = await this.database.query(
      `UPDATE usuarios SET ${fields.join(', ')}, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return this.mapToUsuario(result.rows[0]);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.database.query(
      'DELETE FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rowCount! > 0;
  }

  private mapToUsuario(row: any): Usuario {
    return new Usuario(
      row.email,
      row.senha_hash,
      row.nome,
      row.perfil,
      row.ativo,
      row.id,
      row.criado_em,
      row.atualizado_em
    );
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
