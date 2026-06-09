import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import WorkersPage from './pages/WorkersPage';
import VacanciesPage from './pages/VacanciesPage';
import ReferralsPage from './pages/ReferralsPage';
import AssistancePage from './pages/AssistancePage';
import AppLayout from './components/AppLayout';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Módulo</span>
          <h1>{title}</h1>
          <p>Área preparada para expansão do sistema.</p>
        </div>
      </div>
      <section className="card empty-state">
        <strong>Funcionalidade em desenvolvimento</strong>
        <span>Este módulo seguirá o mesmo padrão visual e de usabilidade.</span>
      </section>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      {isAuthenticated ? (
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/companies" element={<PlaceholderPage title="Empresas" />} />
            <Route path="/vacancies" element={<VacanciesPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/unemployment-insurance" element={<PlaceholderPage title="Seguro-Desemprego" />} />
            <Route path="/assistance" element={<AssistancePage />} />
            <Route path="/events" element={<PlaceholderPage title="Eventos" />} />
            <Route path="/reports" element={<PlaceholderPage title="Relatórios" />} />
            <Route path="/settings" element={<PlaceholderPage title="Configurações" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
