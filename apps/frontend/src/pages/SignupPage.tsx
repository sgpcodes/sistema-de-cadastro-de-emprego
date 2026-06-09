import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import Toast from '../components/Toast';
import { LoadingSpinner } from '../components/Skeleton';

export default function SignupPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('TRABALHADOR');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro('');
    setIsLoading(true);

    try {
      await apiClient.post('/auth/signup', { nome, email, senha, perfil });
      navigate('/login');
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Não foi possível criar a conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-compact">
      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-heading">
            <span className="brand-mark">
              <UserPlus size={22} />
            </span>
            <div>
              <h2>Cadastro</h2>
              <p>Crie um acesso para utilizar o sistema</p>
            </div>
          </div>

          {erro && <Toast type="error" message={erro} />}

          <form onSubmit={handleSubmit} className="form-stack">
            <Input
              label="Nome"
              name="nome"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Senha"
              name="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
            <Select
              label="Perfil"
              name="perfil"
              value={perfil}
              onChange={(event) => setPerfil(event.target.value)}
              options={[
                { label: 'Trabalhador', value: 'TRABALHADOR' },
                { label: 'Atendente', value: 'ATENDENTE' },
                { label: 'Empresa', value: 'EMPRESA' }
              ]}
            />
            <Button type="submit" disabled={isLoading} icon={isLoading ? <LoadingSpinner /> : undefined}>
              Cadastrar
            </Button>
            <p className="auth-footer">
              Já tem conta? <Link to="/login">Faça login</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
