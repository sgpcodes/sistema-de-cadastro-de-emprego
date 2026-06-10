import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileHeart,
  Handshake,
  Users
} from 'lucide-react';
import Card from '../components/Card';
import DashboardCard from '../components/DashboardCard';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#4B5563',
        boxWidth: 12,
        font: { size: 12 }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6B7280' }
    },
    y: {
      border: { display: false },
      grid: { color: '#EEF2F7' },
      ticks: { color: '#6B7280', precision: 0 }
    }
  }
};

export default function DashboardPage() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Visão geral</span>
          <h1>Dashboard Ilustrativo</h1>
          <p>Dados demonstrativos — os indicadores abaixo não refletem registros reais do sistema.</p>
        </div>
      </div>

      <section className="dashboard-grid" aria-label="Indicadores principais">
        <DashboardCard
          title="Total de Trabalhadores"
          value="1.284"
          detail="+12% no mês"
          icon={<Users size={22} />}
        />
        <DashboardCard
          title="Total de Empresas"
          value="326"
          detail="18 novas"
          icon={<Building2 size={22} />}
        />
        <DashboardCard
          title="Total de Vagas"
          value="742"
          detail="214 abertas"
          icon={<BriefcaseBusiness size={22} />}
        />
        <DashboardCard
          title="Encaminhamentos"
          value="518"
          detail="86 esta semana"
          icon={<Handshake size={22} />}
        />
        <DashboardCard
          title="Contratações"
          value="193"
          detail="Meta 78%"
          icon={<ClipboardCheck size={22} />}
          tone="red"
        />
        <DashboardCard
          title="Atendimentos"
          value="879"
          detail="Tempo médio 14 min"
          icon={<FileHeart size={22} />}
        />
      </section>

      <section className="charts-grid">
        <Card className="chart-card">
          <div className="section-title">
            <h2>Contratações por mês</h2>
            <span>Últimos 6 meses</span>
          </div>
          <div className="chart-frame">
            <Line
              options={chartOptions}
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'Contratações',
                    data: [18, 26, 31, 28, 42, 46],
                    borderColor: '#1E88E5',
                    backgroundColor: '#E3F2FD',
                    tension: 0.35,
                    pointRadius: 4
                  }
                ]
              }}
            />
          </div>
        </Card>

        <Card className="chart-card">
          <div className="section-title">
            <h2>Encaminhamentos por mês</h2>
            <span>Volume operacional</span>
          </div>
          <div className="chart-frame">
            <Bar
              options={chartOptions}
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'Encaminhamentos',
                    data: [54, 71, 86, 79, 93, 112],
                    backgroundColor: '#1E88E5',
                    borderRadius: 8
                  }
                ]
              }}
            />
          </div>
        </Card>

        <Card className="chart-card">
          <div className="section-title">
            <h2>Atendimentos por categoria</h2>
            <span>Distribuição atual</span>
          </div>
          <div className="chart-frame">
            <Doughnut
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#4B5563', boxWidth: 12 }
                  }
                }
              }}
              data={{
                labels: ['Orientação', 'Seguro', 'Cadastro', 'Encaminhamento'],
                datasets: [
                  {
                    data: [38, 24, 21, 17],
                    backgroundColor: ['#1E88E5', '#E53935', '#90CAF9', '#FFCDD2'],
                    borderColor: '#FFFFFF',
                    borderWidth: 4
                  }
                ]
              }}
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
