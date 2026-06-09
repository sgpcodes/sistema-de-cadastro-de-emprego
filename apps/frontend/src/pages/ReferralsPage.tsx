import { Plus } from 'lucide-react';
import Button from '../components/Button';
import Table from '../components/Table';

type ReferralRow = {
  id: string;
  trabalhador: string;
  vaga: string;
  data: string;
  status: string;
};

const rows: ReferralRow[] = [
  { id: '1', trabalhador: 'Ana Paula Santos', vaga: 'Assistente Administrativo', data: '05/06/2026', status: 'Entrevista' },
  { id: '2', trabalhador: 'Carlos Henrique Lima', vaga: 'Técnico de Suporte', data: '04/06/2026', status: 'Encaminhado' }
];

export default function ReferralsPage() {
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Intermediação</span>
          <h1>Encaminhamentos</h1>
          <p>Acompanhe trabalhadores encaminhados para vagas.</p>
        </div>
        <Button type="button" icon={<Plus size={18} />}>
          Novo Encaminhamento
        </Button>
      </div>

      <Table<ReferralRow>
        columns={[
          { key: 'trabalhador', label: 'Trabalhador' },
          { key: 'vaga', label: 'Vaga' },
          { key: 'data', label: 'Data' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <span className="status-badge status-red">{row.status}</span>
          }
        ]}
        data={rows}
        emptyMessage="Nenhum encaminhamento realizado"
        searchPlaceholder="Buscar encaminhamento"
      />
    </div>
  );
}
