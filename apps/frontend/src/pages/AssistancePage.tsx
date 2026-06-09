import { Plus } from 'lucide-react';
import Button from '../components/Button';
import Table from '../components/Table';

type AssistanceRow = {
  id: string;
  trabalhador: string;
  tipo: string;
  data: string;
  status: string;
};

const rows: AssistanceRow[] = [
  { id: '1', trabalhador: 'Maria Oliveira', tipo: 'Seguro-Desemprego', data: '05/06/2026', status: 'Concluído' },
  { id: '2', trabalhador: 'João Pereira', tipo: 'Orientação profissional', data: '03/06/2026', status: 'Em análise' }
];

export default function AssistancePage() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Atendimento</span>
          <h1>Assistência</h1>
          <p>Registre orientações, solicitações e atendimentos presenciais.</p>
        </div>
        <Button type="button" icon={<Plus size={18} />}>
          Novo Atendimento
        </Button>
      </div>

      <Table<AssistanceRow>
        columns={[
          { key: 'trabalhador', label: 'Trabalhador' },
          { key: 'tipo', label: 'Tipo' },
          { key: 'data', label: 'Data' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <span className="status-badge status-blue">{row.status}</span>
          }
        ]}
        data={rows}
        emptyMessage="Nenhum atendimento registrado"
        searchPlaceholder="Buscar atendimento"
      />
    </div>
  );
}
