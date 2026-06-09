import { LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from './Button';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const initials = user?.nome
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'US';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-title">
        <strong>Sistema de Cadastro de Emprego</strong>
        <span>Atendimento, vagas e encaminhamentos</span>
      </div>

      <label className="global-search">
        <Search size={18} aria-hidden="true" />
        <input type="search" placeholder="Pesquisar no sistema" />
      </label>

      <div className="user-menu">
        <div className="avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <strong>{user?.nome || 'Usuário'}</strong>
          <span>{user?.perfil || 'Atendente'}</span>
        </div>
        <Button type="button" variant="ghost" icon={<LogOut size={17} />} onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </header>
  );
}
