import { Search, UserCircle } from 'lucide-react';

export default function Header() {
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
          <UserCircle size={24} />
        </div>
        <div>
          <strong>Sistema aberto</strong>
          <span>Acesso sem login</span>
        </div>
      </div>
    </header>
  );
}
