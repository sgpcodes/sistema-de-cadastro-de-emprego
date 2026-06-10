import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Pencil } from 'lucide-react';
import Button from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Toast from '../components/Toast';
import { workersApi } from '../api/apiClient';

type Worker = {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  escolaridade: string;
  profissao: string;
  experiencia: string;
  status: string;
  criado_em: string;
  atualizado_em: string;
};

type WorkerRow = {
  id: number;
  nome: string;
  cpf: string;
  status: string;
  actions: JSX.Element;
};

type FormState = {
  nome: string;
  cpf: string;
  telefone: string;
  escolaridade: string;
  profissao: string;
  experiencia: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  nome: '', cpf: '', telefone: '',
  escolaridade: '', profissao: '', experiencia: '',
  status: 'ATIVO',
};

const STATUS_OPTIONS = [
  { label: 'Disponível', value: 'ATIVO' },
  { label: 'Encaminhado', value: 'ENCAMINHADO' },
  { label: 'Contratado', value: 'CONTRATADO' },
];

const STATUS_LABELS: Record<string, string> = {
  ATIVO: 'Disponível',
  ENCAMINHADO: 'Encaminhado',
  CONTRATADO: 'Contratado',
  INATIVO: 'Inativo',
};

const STATUS_COLORS: Record<string, string> = {
  ATIVO: 'status-blue',
  ENCAMINHADO: 'status-yellow',
  CONTRATADO: 'status-green',
  INATIVO: 'status-gray',
};

const ESCOLARIDADE_OPTIONS = [
  { label: 'Não informado', value: '' },
  { label: 'Fundamental Incompleto', value: 'Fundamental Incompleto' },
  { label: 'Fundamental Completo', value: 'Fundamental Completo' },
  { label: 'Médio Incompleto', value: 'Médio Incompleto' },
  { label: 'Médio Completo', value: 'Médio Completo' },
  { label: 'Superior Incompleto', value: 'Superior Incompleto' },
  { label: 'Superior Completo', value: 'Superior Completo' },
  { label: 'Pós-graduação', value: 'Pós-graduação' },
  { label: 'Mestrado', value: 'Mestrado' },
  { label: 'Doutorado', value: 'Doutorado' },
];

function formatCPF(cpf: string) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatDate(iso: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR');
}

const detailStyle: React.CSSProperties = { display: 'grid', gap: '12px' };

const detailRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '160px 1fr',
  gap: '8px',
  alignItems: 'start',
  borderBottom: '1px solid #edf0f5',
  paddingBottom: '10px',
};

const detailLabelStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '0.86rem',
  fontWeight: 800,
};

const detailValueStyle: React.CSSProperties = {
  color: '#1f2937',
  fontSize: '0.95rem',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function loadWorkers() {
    try {
      const { data } = await workersApi.get<Worker[]>('/workers');
      setWorkers(data);
    } catch {
      showToast('error', 'Erro ao carregar trabalhadores. Verifique se o serviço está em execução.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadWorkers(); }, []);

  function handleOpenCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(worker: Worker) {
    setForm({
      nome: worker.nome || '',
      cpf: formatCPF(worker.cpf),
      telefone: worker.telefone || '',
      escolaridade: worker.escolaridade || '',
      profissao: worker.profissao || '',
      experiencia: worker.experiencia || '',
      status: worker.status || 'ATIVO',
    });
    setEditingId(worker.id);
    setIsFormOpen(true);
  }

  async function handleSave() {
    if (!form.nome.trim() || !form.cpf.trim()) {
      showToast('error', 'Nome e CPF são obrigatórios.');
      return;
    }
    setSaving(true);
    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, '').slice(0, 11),
      telefone: form.telefone.trim() || null,
      escolaridade: form.escolaridade || null,
      profissao: form.profissao.trim() || null,
      experiencia: form.experiencia.trim() || null,
      status: form.status,
    };
    try {
      if (editingId !== null) {
        await workersApi.put(`/workers/${editingId}`, payload);
        showToast('success', 'Trabalhador atualizado com sucesso.');
      } else {
        await workersApi.post('/workers', payload);
        showToast('success', 'Trabalhador cadastrado com sucesso.');
      }
      setIsFormOpen(false);
      loadWorkers();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'Erro ao salvar trabalhador.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, nome: string) {
    if (!confirm(`Deseja realmente excluir "${nome}"?`)) return;
    try {
      await workersApi.delete(`/workers/${id}`);
      setWorkers((prev) => prev.filter((w) => w.id !== id));
      showToast('success', 'Trabalhador removido com sucesso.');
    } catch {
      showToast('error', 'Erro ao remover trabalhador.');
    }
  }

  function handleViewDetails(worker: Worker) {
    setSelected(worker);
    setIsDetailOpen(true);
  }

  const rows: WorkerRow[] = workers.map((w) => ({
    id: w.id,
    nome: w.nome,
    cpf: formatCPF(w.cpf),
    status: w.status,
    actions: (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button type="button" variant="secondary" icon={<Eye size={16} />} onClick={() => handleViewDetails(w)}>
          Detalhes
        </Button>
        <Button type="button" variant="ghost" icon={<Pencil size={16} />} onClick={() => handleOpenEdit(w)}>
          Editar
        </Button>
        <Button type="button" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(w.id, w.nome)}>
          Excluir
        </Button>
      </div>
    ),
  }));

  const formTitle = editingId !== null ? 'Editar Trabalhador' : 'Novo Trabalhador';

  return (
    <div className="page-stack">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="page-heading">
        <div>
          <span className="eyebrow">Cadastros</span>
          <h1>Trabalhadores</h1>
          <p>Consulte, cadastre e atualize dados profissionais.</p>
        </div>
        <Button type="button" icon={<Plus size={18} />} onClick={handleOpenCreate}>
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
            render: (row) => (
              <span className={`status-badge ${STATUS_COLORS[row.status] || 'status-blue'}`}>
                {STATUS_LABELS[row.status] || row.status}
              </span>
            ),
          },
          { key: 'actions', label: 'Ações' },
        ]}
        data={rows}
        emptyMessage={loading ? 'Carregando trabalhadores...' : 'Nenhum trabalhador cadastrado'}
        searchPlaceholder="Buscar por nome, CPF ou status"
      />

      {/* Modal: Cadastro / Edição */}
      <Modal
        isOpen={isFormOpen}
        title={formTitle}
        onClose={() => setIsFormOpen(false)}
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Nome completo"
            name="nome"
            placeholder="Digite o nome"
            value={form.nome}
            onChange={field('nome')}
          />
          <Input
            label="CPF"
            name="cpf"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={field('cpf')}
          />
          <Input
            label="Telefone"
            name="telefone"
            placeholder="(00) 00000-0000"
            value={form.telefone}
            onChange={field('telefone')}
          />
          <Input
            label="Cargo desejado"
            name="profissao"
            placeholder="Ex: Assistente Administrativo, Pedreiro..."
            value={form.profissao}
            onChange={field('profissao')}
          />
          <Select
            label="Escolaridade"
            name="escolaridade"
            value={form.escolaridade}
            onChange={field('escolaridade')}
            options={ESCOLARIDADE_OPTIONS}
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={field('status')}
            options={STATUS_OPTIONS}
          />
          <div style={{ gridColumn: 'span 2' }}>
            <Textarea
              label="Experiência profissional"
              name="experiencia"
              placeholder="Descreva a experiência profissional do trabalhador..."
              value={form.experiencia}
              onChange={field('experiencia')}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Detalhes (somente leitura) */}
      <Modal
        isOpen={isDetailOpen}
        title="Detalhes do Trabalhador"
        onClose={() => setIsDetailOpen(false)}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              icon={<Pencil size={16} />}
              onClick={() => {
                setIsDetailOpen(false);
                if (selected) handleOpenEdit(selected);
              }}
            >
              Editar
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsDetailOpen(false)}>
              Fechar
            </Button>
          </>
        }
      >
        {selected && (
          <div style={detailStyle}>
            {(
              [
                ['Nome', selected.nome],
                ['CPF', formatCPF(selected.cpf)],
                ['Telefone', selected.telefone || '-'],
                ['Status', STATUS_LABELS[selected.status] || selected.status],
                ['Escolaridade', selected.escolaridade || '-'],
                ['Cargo desejado', selected.profissao || '-'],
                ['Experiência', selected.experiencia || '-'],
                ['Cadastrado em', formatDate(selected.criado_em)],
                ['Atualizado em', formatDate(selected.atualizado_em)],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} style={detailRowStyle}>
                <span style={detailLabelStyle}>{label}</span>
                <span style={detailValueStyle}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
