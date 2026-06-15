import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Toast from '../components/Toast';
import { referralsApi } from '../api/apiClient';

type Company = { id: number; razao_social: string; cidade?: string; estado?: string; };

type Vacancy = {
  id: number;
  empresa_id: number;
  cargo: string;
  requisitos: string;
  salario: string | number;
  status: string;
  criado_em: string;
  empresa_nome: string;
  empresa_localizacao: string;
  empresa_cidade: string;
  empresa_estado: string;
  empresa_telefone: string;
  empresa_celular: string;
  empresa_email: string;
  empresa_responsavel: string;
  empresa_endereco: string;
};

type VacancyRow = {
  id: number;
  cargo: string;
  empresa: string;
  salario: string;
  status: string;
  actions: JSX.Element;
};

const STATUS_OPTIONS = [
  { label: 'Aberta', value: 'ABERTA' },
  { label: 'Preenchida', value: 'PREENCHIDA' },
  { label: 'Cancelada', value: 'CANCELADA' },
];

const STATUS_LABELS: Record<string, string> = {
  ABERTA: 'Aberta',
  PREENCHIDA: 'Preenchida',
  CANCELADA: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  ABERTA: 'status-blue',
  PREENCHIDA: 'status-green',
  CANCELADA: 'status-red',
};

function formatSalary(value: string | number | null) {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function formatDate(iso: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR');
}


const sectionLabel: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 800, color: '#1e88e5',
  textTransform: 'uppercase', letterSpacing: '0.04em',
};

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selected, setSelected] = useState<Vacancy | null>(null);
  const [newStatus, setNewStatus] = useState('ABERTA');
  const [savingStatus, setSavingStatus] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState({
    cargo: '', empresa_id: '', salario: '', requisitos: '', status: 'ABERTA',
  });
  const [saving, setSaving] = useState(false);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadVacancies() {
    try {
      const { data } = await referralsApi.get<Vacancy[]>('/vacancies');
      setVacancies(data);
    } catch {
      showToast('error', 'Erro ao carregar vagas. Verifique se o serviço está em execução.');
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanies() {
    try {
      const { data } = await referralsApi.get<Company[]>('/companies');
      setCompanies(data);
    } catch {
      // non-fatal — form will show empty dropdown
    }
  }

  useEffect(() => {
    loadVacancies();
    loadCompanies();
  }, []);

  const companyOptions = [
    { label: 'Selecione a empresa...', value: '' },
    ...companies.map((c) => ({
      label: c.razao_social + (c.cidade ? ` — ${c.cidade}${c.estado ? `/${c.estado}` : ''}` : ''),
      value: String(c.id),
    })),
  ];

  async function handleCreate() {
    if (!form.cargo.trim() || !form.empresa_id) {
      showToast('error', 'Cargo e Empresa são obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      await referralsApi.post('/vacancies', {
        cargo: form.cargo.trim(),
        empresa_id: parseInt(form.empresa_id),
        salario: form.salario ? parseFloat(form.salario.replace(',', '.')) : null,
        requisitos: form.requisitos.trim() || null,
        status: form.status,
      });
      setIsCreateOpen(false);
      setForm({ cargo: '', empresa_id: '', salario: '', requisitos: '', status: 'ABERTA' });
      showToast('success', 'Vaga cadastrada com sucesso.');
      loadVacancies();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'Erro ao cadastrar vaga.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, cargo: string) {
    if (!confirm(`Deseja realmente excluir a vaga "${cargo}"?`)) return;
    try {
      await referralsApi.delete(`/vacancies/${id}`);
      setVacancies((prev) => prev.filter((v) => v.id !== id));
      showToast('success', 'Vaga removida com sucesso.');
    } catch {
      showToast('error', 'Erro ao remover vaga.');
    }
  }

  function handleViewDetails(vacancy: Vacancy) {
    setSelected(vacancy);
    setIsDetailOpen(true);
  }

  function handleOpenStatus(vacancy: Vacancy) {
    setSelected(vacancy);
    setNewStatus(vacancy.status);
    setIsStatusOpen(true);
  }

  async function handleSaveStatus() {
    if (!selected) return;
    setSavingStatus(true);
    try {
      const { data } = await referralsApi.put<Vacancy>(`/vacancies/${selected.id}`, { status: newStatus });
      setVacancies((prev) =>
        prev.map((v) => (v.id === selected.id ? { ...v, status: data.status } : v))
      );
      setIsStatusOpen(false);
      showToast('success', 'Status da vaga atualizado com sucesso.');
    } catch {
      showToast('error', 'Erro ao atualizar status da vaga.');
    } finally {
      setSavingStatus(false);
    }
  }

  const rows: VacancyRow[] = vacancies.map((v) => ({
    id: v.id,
    cargo: v.cargo,
    empresa: v.empresa_nome || '-',
    salario: formatSalary(v.salario),
    status: v.status,
    actions: (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button type="button" variant="secondary" icon={<Eye size={16} />} onClick={() => handleViewDetails(v)}>
          Detalhes
        </Button>
        <Button type="button" variant="ghost" icon={<RefreshCw size={16} />} onClick={() => handleOpenStatus(v)}>
          Alterar Status
        </Button>
        <Button type="button" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(v.id, v.cargo)}>
          Excluir
        </Button>
      </div>
    ),
  }));

  return (
    <div className="page-stack">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="page-heading">
        <div>
          <span className="eyebrow">Oportunidades</span>
          <h1>Vagas</h1>
          <p>Gerencie vagas recebidas das empresas parceiras.</p>
        </div>
        <Button type="button" icon={<Plus size={18} />} onClick={() => setIsCreateOpen(true)}>
          Adicionar Nova Vaga
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
            render: (row) => (
              <span className={`status-badge ${STATUS_COLORS[row.status] || 'status-blue'}`}>
                {STATUS_LABELS[row.status] || row.status}
              </span>
            ),
          },
          { key: 'actions', label: 'Ações' },
        ]}
        data={rows}
        emptyMessage={loading ? 'Carregando vagas...' : 'Nenhuma vaga cadastrada'}
        searchPlaceholder="Buscar por cargo ou empresa"
      />

      {/* Modal: Adicionar Nova Vaga */}
      <Modal
        isOpen={isCreateOpen}
        title="Adicionar Nova Vaga"
        onClose={() => setIsCreateOpen(false)}
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreate} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Cargo"
            name="cargo"
            placeholder="Ex: Assistente Administrativo"
            value={form.cargo}
            onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
          />
          <Select
            label="Empresa"
            name="empresa_id"
            value={form.empresa_id}
            onChange={(e) => setForm((f) => ({ ...f, empresa_id: e.target.value }))}
            options={companyOptions}
          />
          <Input
            label="Salário (R$)"
            name="salario"
            placeholder="Ex: 2100.00"
            value={form.salario}
            onChange={(e) => setForm((f) => ({ ...f, salario: e.target.value }))}
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={STATUS_OPTIONS}
          />
          <div style={{ gridColumn: 'span 2' }}>
            <Textarea
              label="Requisitos"
              name="requisitos"
              placeholder="Descreva os requisitos da vaga..."
              value={form.requisitos}
              onChange={(e) => setForm((f) => ({ ...f, requisitos: e.target.value }))}
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Alterar Status da Vaga */}
      <Modal
        isOpen={isStatusOpen}
        title="Alterar Status da Vaga"
        onClose={() => setIsStatusOpen(false)}
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsStatusOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveStatus} disabled={savingStatus}>
              {savingStatus ? 'Salvando...' : 'Confirmar'}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="form-stack">
            <div className="detail-row">
              <span className="detail-label">Vaga</span>
              <span className="detail-value">{selected.cargo}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Empresa</span>
              <span className="detail-value">{selected.empresa_nome || '-'}</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <Select
                label="Novo status"
                name="novo_status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Detalhes da Vaga */}
      <Modal
        isOpen={isDetailOpen}
        title="Detalhes da Vaga"
        onClose={() => setIsDetailOpen(false)}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              icon={<RefreshCw size={16} />}
              onClick={() => {
                setIsDetailOpen(false);
                if (selected) handleOpenStatus(selected);
              }}
            >
              Alterar Status
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsDetailOpen(false)}>
              Fechar
            </Button>
          </>
        }
      >
        {selected && (
          <div className="detail-grid">
            <div style={{ marginBottom: '2px' }}>
              <span style={sectionLabel}>Dados da Vaga</span>
            </div>
            {([
              ['Cargo', selected.cargo],
              ['Salário', formatSalary(selected.salario)],
              ['Status', STATUS_LABELS[selected.status] || selected.status],
              ['Data de publicação', formatDate(selected.criado_em)],
              ['Requisitos', selected.requisitos || '-'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="detail-row">
                <span className="detail-label">{label}</span>
                {label === 'Status'
                  ? <span className={`status-badge ${STATUS_COLORS[selected.status] || 'status-blue'}`}>{value}</span>
                  : <span className="detail-value">{value}</span>}
              </div>
            ))}

            <div style={{ marginTop: '8px', marginBottom: '2px' }}>
              <span style={sectionLabel}>Empresa</span>
            </div>
            {([
              ['Nome', selected.empresa_nome || '-'],
              ['Localização', selected.empresa_cidade && selected.empresa_estado
                ? `${selected.empresa_cidade} - ${selected.empresa_estado}`
                : selected.empresa_localizacao || '-'],
              ['Endereço', selected.empresa_endereco || '-'],
              ['Responsável', selected.empresa_responsavel || '-'],
              ['Telefone', selected.empresa_telefone || selected.empresa_celular || '-'],
              ['E-mail', selected.empresa_email || '-'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="detail-row">
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
