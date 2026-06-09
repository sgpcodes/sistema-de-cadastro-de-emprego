import { Plus } from 'lucide-react';
import Button from '../components/Button';
import Table from '../components/Table';

type VacancyRow = {
  id: string;
  cargo: string;
  empresa: string;
  salario: string;
  status: string;
};

const rows: VacancyRow[] = [
  { id: '1', cargo: 'Assistente Administrativo', empresa: 'Alfa Serviços', salario: 'R$ 2.100', status: 'Aberta' },
  { id: '2', cargo: 'Operador de Caixa', empresa: 'Mercado Central', salario: 'R$ 1.780', status: 'Triagem' },
  { id: '3', cargo: 'Técnico de Suporte', empresa: 'Conecta TI', salario: 'R$ 2.850', status: 'Aberta' }
];

export default function VacanciesPage() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Oportunidades</span>
          <h1>Vagas</h1>
          <p>Gerencie vagas recebidas das empresas parceiras.</p>
        </div>
        <Button type="button" icon={<Plus size={18} />}>
          Nova Vaga
        </Button>
      </div>

      <Table<VacancyRow>
        columns={[
          { key: 'cargo', label: 'Cargo' },
          { key: 'empresa', label: 'Empresa' },
          { key: 'salario', label: 'Salário' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <span className="status-badge status-blue">{row.status}</span>
          }
        ]}
        data={rows}
        emptyMessage="Nenhuma vaga cadastrada"
        searchPlaceholder="Buscar por cargo ou empresa"
      />
    </div>
  );
}
