import {
  BriefcaseBusiness,
  Building2,
  FileHeart,
  FileText,
  LayoutDashboard,
  Settings,
  Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard Ilustrativo', path: '/', icon: LayoutDashboard },
  { label: 'Trabalhadores', path: '/workers', icon: Users },
  { label: 'Empresas', path: '/companies', icon: Building2 },
  { label: 'Vagas', path: '/vacancies', icon: BriefcaseBusiness },
  { label: 'Assistência', path: '/assistance', icon: FileHeart },
  { label: 'Configurações', path: '/settings', icon: Settings }
];

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <FileText size={22} />
        </div>
        <div>
          <strong>EmpregaGov</strong>
          <span>Gestão de Empregos</span>
        </div>
      </div>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
