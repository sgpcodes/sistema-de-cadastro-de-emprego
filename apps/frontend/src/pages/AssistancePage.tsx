import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Pencil } from 'lucide-react';
import Button from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Toast from '../components/Toast';
import { assistanceApi } from '../api/apiClient';

type Assistance = {
  id: number;
  nome_atendido: string;
  cpf_atendido: string;
  telefone_atendido: string;
  escolaridade: string;
  profissao: string;
  experiencia: string;
  cargo_desejado: string;
  tipo: string;
  descricao: string;
  criado_em: string;
  atualizado_em: string;
};

type AssistanceRow = {
  id: number;
  nome: string;
  tipo: string;
  data: string;
  actions: JSX.Element;
};

type FormState = {
  nome_atendido: string;
  cpf_atendido: string;
  telefone_atendido: string;
  escolaridade: string;
  profissao: string;
  experiencia: string;
  cargo_desejado: string;
  tipo: string;
  descricao: string;
};

const EMPTY_FORM: FormState = {
  nome_atendido: '', cpf_atendido: '', telefone_atendido: '',
  escolaridade: '', profissao: '', experiencia: '',
  cargo_desejado: '', tipo: '', descricao: '',
};

const TIPO_OPTIONS = [
  { label: 'Selecione o tipo...', value: '' },
  { label: 'Orientação Profissional', value: 'ORIENTACAO_PROFISSIONAL' },
  { label: 'Assistência Psicológica', value: 'ASSISTENCIA_PSICOLOGICA' },
  { label: 'Seguro-Desemprego', value: 'SEGURO_DESEMPREGO' },
  { label: 'Informações e Cadastros', value: 'INFORMACOES_CADASTROS' },
  { label: 'Outros', value: 'OUTROS' },
];

const TIPO_LABELS: Record<string, string> = {
  ORIENTACAO_PROFISSIONAL: 'Orientação Profissional',
  ASSISTENCIA_PSICOLOGICA: 'Assistência Psicológica',
  SEGURO_DESEMPREGO: 'Seguro-Desemprego',
  INFORMACOES_CADASTROS: 'Informações e Cadastros',
  OUTROS: 'Outros',
  // valores legados do banco
  PSICOLOGICO: 'Psicológico',
  CURRICULO: 'Currículo',
  OUTRO: 'Outro',
  ORIENTACAO_PROFISSIONAL_OLD: 'Orientação Profissional',
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
  if (!cpf) return '-';
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatDateTime(iso: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const detailStyle: React.CSSProperties = { display: 'grid', gap: '12px' };

const detailRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '170px 1fr',
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

export default function AssistancePage() {
  const [records, setRecords] = useState<Assistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Assistance | null>(null);
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

  async function loadRecords() {
    try {
      const { data } = await assistanceApi.get<Assistance[]>('/assistance');
      setRecords(data);
    } catch {
      showToast('error', 'Erro ao carregar atendimentos. Verifique se o serviço está em execução.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRecords(); }, []);

  function handleOpenCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(record: Assistance) {
    setForm({
      nome_atendido: record.nome_atendido || '',
      cpf_atendido: formatCPF(record.cpf_atendido || ''),
      telefone_atendido: record.telefone_atendido || '',
      escolaridade: record.escolaridade || '',
      profissao: record.profissao || '',
      experiencia: record.experiencia || '',
      cargo_desejado: record.cargo_desejado || '',
      tipo: record.tipo || '',
      descricao: record.descricao || '',
    });
    setEditingId(record.id);
    setIsFormOpen(true);
  }

  async function handleSave() {
    if (!form.nome_atendido.trim()) {
      showToast('error', 'Nome do atendido é obrigatório.');
      return;
    }
    if (!form.tipo) {
      showToast('error', 'Tipo de assistência é obrigatório.');
      return;
    }
    setSaving(true);
    const payload = {
      nome_atendido: form.nome_atendido.trim(),
      cpf_atendido: form.cpf_atendido.replace(/\D/g, '').slice(0, 11) || null,
      telefone_atendido: form.telefone_atendido.trim() || null,
      escolaridade: form.escolaridade || null,
      profissao: form.profissao.trim() || null,
      experiencia: form.experiencia.trim() || null,
      cargo_desejado: form.cargo_desejado.trim() || null,
      tipo: form.tipo,
      descricao: form.descricao.trim() || null,
    };
    try {
      if (editingId !== null) {
        await assistanceApi.put(`/assistance/${editingId}`, payload);
        showToast('success', 'Atendimento atualizado com sucesso.');
      } else {
        await assistanceApi.post('/assistance', payload);
        showToast('success', 'Atendimento registrado com sucesso.');
      }
      setIsFormOpen(false);
      loadRecords();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'Erro ao salvar atendimento.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, nome: string) {
    if (!confirm(`Deseja realmente excluir o atendimento de "${nome}"?`)) return;
    try {
      await assistanceApi.delete(`/assistance/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast('success', 'Atendimento removido com sucesso.');
    } catch {
      showToast('error', 'Erro ao remover atendimento.');
    }
  }

  function handleViewDetails(record: Assistance) {
    setSelected(record);
    setIsDetailOpen(true);
  }

  const rows: AssistanceRow[] = records.map((r) => ({
    id: r.id,
    nome: r.nome_atendido || '-',
    tipo: TIPO_LABELS[r.tipo] || r.tipo || '-',
    data: formatDateTime(r.criado_em),
    actions: (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button type="button" variant="secondary" icon={<Eye size={16} />} onClick={() => handleViewDetails(r)}>
          Detalhes
        </Button>
        <Button type="button" variant="ghost" icon={<Pencil size={16} />} onClick={() => handleOpenEdit(r)}>
          Editar
        </Button>
        <Button type="button" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(r.id, r.nome_atendido || 'sem nome')}>
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
          <span className="eyebrow">Atendimento</span>
          <h1>Assistência</h1>
          <p>Registre orientações, solicitações e atendimentos presenciais.</p>
        </div>
        <Button type="button" icon={<Plus size={18} />} onClick={handleOpenCreate}>
          Novo Atendimento
        </Button>
      </div>

      <Table<AssistanceRow>
        columns={[
          { key: 'nome', label: 'Nome' },
          { key: 'tipo', label: 'Tipo de Assistência' },
          { key: 'data', label: 'Data / Hora' },
          { key: 'actions', label: 'Ações' },
        ]}
        data={rows}
        emptyMessage={loading ? 'Carregando atendimentos...' : 'Nenhum atendimento registrado'}
        searchPlaceholder="Buscar por nome ou tipo"
      />

      {/* Modal: Cadastro / Edição */}
      <Modal
        isOpen={isFormOpen}
        title={editingId !== null ? 'Editar Atendimento' : 'Novo Atendimento'}
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
        <form className="form-stack" onSubmit={(e) => e.preventDefault()}>
          {/* Seção: Dados da Pessoa */}
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e88e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dados da Pessoa Atendida
            </span>
          </div>
          <div className="form-grid">
            <Input
              label="Nome completo"
              name="nome_atendido"
              placeholder="Nome da pessoa atendida"
              value={form.nome_atendido}
              onChange={field('nome_atendido')}
            />
            <Input
              label="CPF"
              name="cpf_atendido"
              placeholder="000.000.000-00"
              value={form.cpf_atendido}
              onChange={field('cpf_atendido')}
            />
            <Input
              label="Telefone"
              name="telefone_atendido"
              placeholder="(00) 00000-0000"
              value={form.telefone_atendido}
              onChange={field('telefone_atendido')}
            />
            <Input
              label="Cargo / Vaga desejada"
              name="cargo_desejado"
              placeholder="Ex: Assistente Administrativo"
              value={form.cargo_desejado}
              onChange={field('cargo_desejado')}
            />
            <Select
              label="Escolaridade"
              name="escolaridade"
              value={form.escolaridade}
              onChange={field('escolaridade')}
              options={ESCOLARIDADE_OPTIONS}
            />
            <Input
              label="Profissão"
              name="profissao"
              placeholder="Profissão atual ou anterior"
              value={form.profissao}
              onChange={field('profissao')}
            />
            <div style={{ gridColumn: 'span 2' }}>
              <Textarea
                label="Experiência profissional"
                name="experiencia"
                placeholder="Descreva a experiência profissional..."
                value={form.experiencia}
                onChange={field('experiencia')}
              />
            </div>
          </div>

          {/* Seção: Atendimento */}
          <div style={{ marginTop: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e88e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Informações do Atendimento
            </span>
          </div>
          <Select
            label="Tipo de assistência"
            name="tipo"
            value={form.tipo}
            onChange={field('tipo')}
            options={TIPO_OPTIONS}
          />
          <Textarea
            label="Descrição do atendimento"
            name="descricao"
            placeholder="Descreva detalhadamente o que foi realizado: orientações fornecidas, procedimentos, informações passadas ao cidadão, observações importantes..."
            value={form.descricao}
            onChange={field('descricao')}
            rows={5}
          />
        </form>
      </Modal>

      {/* Modal: Detalhes */}
      <Modal
        isOpen={isDetailOpen}
        title="Detalhes do Atendimento"
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
            <div style={{ marginBottom: '2px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e88e5', textTransform: 'uppercase' }}>
                Dados da Pessoa Atendida
              </span>
            </div>
            {(
              [
                ['Nome', selected.nome_atendido || '-'],
                ['CPF', formatCPF(selected.cpf_atendido || '')],
                ['Telefone', selected.telefone_atendido || '-'],
                ['Escolaridade', selected.escolaridade || '-'],
                ['Profissão', selected.profissao || '-'],
                ['Cargo desejado', selected.cargo_desejado || '-'],
                ['Experiência', selected.experiencia || '-'],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} style={detailRowStyle}>
                <span style={detailLabelStyle}>{label}</span>
                <span style={detailValueStyle}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e88e5', textTransform: 'uppercase' }}>
                Informações do Atendimento
              </span>
            </div>
            {(
              [
                ['Tipo', TIPO_LABELS[selected.tipo] || selected.tipo || '-'],
                ['Data / Hora', formatDateTime(selected.criado_em)],
                ['Descrição', selected.descricao || '-'],
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
