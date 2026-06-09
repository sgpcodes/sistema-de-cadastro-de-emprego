import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, LockKeyhole, UserRound } from 'lucide-react';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import { Input } from '../components/Input';
import Toast from '../components/Toast';
import { LoadingSpinner } from '../components/Skeleton';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErro('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, senha });
      login(response.data.usuario, response.data.token);
      navigate('/');
    } catch (err: any) {
      setErro(err.response?.data?.erro || 'Não foi possível entrar. Verifique seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-illustration" aria-label="Oportunidades de emprego">
        <div className="auth-visual">
          <div className="visual-person">
            <UserRound size={52} />
          </div>
          <div className="visual-card visual-card-primary">
            <BriefcaseBusiness size={28} />
            <span>Vagas ativas</span>
            <strong>742</strong>
          </div>
          <div className="visual-card visual-card-secondary">
            <span>Encaminhamentos</span>
            <strong>518</strong>
          </div>
        </div>
        <div>
          <h1>Sistema de Cadastro de Emprego</h1>
          <p>Gestão integrada de trabalhadores, empresas, vagas e atendimentos.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-heading">
            <span className="brand-mark">
              <LockKeyhole size={22} />
            </span>
            <div>
              <h2>Entrar</h2>
              <p>Acesse sua área administrativa</p>
            </div>
          </div>

          {erro && <Toast type="error" message={erro} />}

          <form onSubmit={handleSubmit} className="form-stack">
            <Input
              label="Usuário"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Senha"
              name="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              required
            />

            <div className="form-row-between">
              <Link to="/signup">Criar conta</Link>
              <a href="#recuperar-senha">Esqueceu a senha?</a>
            </div>

            <Button type="submit" disabled={isLoading} icon={isLoading ? <LoadingSpinner /> : undefined}>
              Entrar
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
