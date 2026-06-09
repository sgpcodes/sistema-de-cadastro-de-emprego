import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Toast from '../components/Toast';

type WorkerRow = {
  id: string;
  nome: string;
  cpf: string;
  status: string;
  actions: JSX.Element;
};

export default function WorkersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const rows: WorkerRow[] = [
    {
      id: '1',
      nome: 'Ana Paula Santos',
      cpf: '123.456.789-00',
      status: 'Disponível',
      actions: (
        <Button
          type="button"
          variant="danger"
          icon={<Trash2 size={16} />}
          onClick={() => {
            if (confirm('Deseja realmente excluir este trabalhador?')) {
              setToast('Trabalhador removido com sucesso.');
            }
          }}
        >
          Excluir
        </Button>
      )
    },
    {
      id: '2',
      nome: 'Carlos Henrique Lima',
      cpf: '987.654.321-00',
      status: 'Encaminhado',
      actions: (
        <Button type="button" variant="secondary">
          Ver detalhes
        </Button>
      )
    }
  ];

  return (
    <div className="page-stack">
      {toast && <Toast type="success" message={toast} />}

      <div className="page-heading">
        <div>
          <span className="eyebrow">Cadastros</span>
          <h1>Trabalhadores</h1>
          <p>Consulte, cadastre e atualize dados profissionais.</p>
        </div>
        <Button type="button" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Novo Trabalhador
        </Button>
      </div>

      <Table<WorkerRow>
        columns={[
          { key: 'nome', label: 'Nome' },
          { key: 'cpf', label: 'CPF' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <span className="status-badge status-blue">{row.status}</span>
          },
          { key: 'actions', label: 'Ações' }
        ]}
        data={rows}
        emptyMessage="Nenhum trabalhador cadastrado"
        searchPlaceholder="Buscar por nome, CPF ou status"
      />

      <Modal
        isOpen={isModalOpen}
        title="Novo trabalhador"
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setToast('Cadastro salvo com sucesso.');
              }}
            >
              Salvar
            </Button>
          </>
        }
      >
        <form className="form-grid">
          <Input label="Nome completo" name="nome" placeholder="Digite o nome" />
          <Input label="CPF" name="cpf" placeholder="000.000.000-00" />
          <Input label="Telefone" name="telefone" placeholder="(00) 00000-0000" />
          <Select
            label="Status"
            name="status"
            options={[
              { label: 'Disponível', value: 'disponivel' },
              { label: 'Encaminhado', value: 'encaminhado' },
              { label: 'Contratado', value: 'contratado' }
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
