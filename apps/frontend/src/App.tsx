import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import WorkersPage from './pages/WorkersPage';
import CompaniesPage from './pages/CompaniesPage';
import VacanciesPage from './pages/VacanciesPage';
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
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/assistance" element={<AssistancePage />} />
          <Route path="/settings" element={<PlaceholderPage title="Configurações" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
