import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Pencil } from 'lucide-react';
import Button from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Toast from '../components/Toast';
import { referralsApi } from '../api/apiClient';

type VagaSummary = {
  id: number;
  cargo: string;
  status: string;
  salario: string | number | null;
  criado_em: string;
};

type Company = {
  id: number;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ramo_atividade: string;
  porte: string;
  qtd_funcionarios: number | null;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  nome_responsavel: string;
  cargo_responsavel: string;
  telefone: string;
  celular: string;
  email: string;
  whatsapp: string;
  site: string;
  observacoes: string;
  beneficios: string;
  horario_funcionamento: string;
  status: string;
  localizacao: string;
  total_vagas: string;
  vagas_abertas: string;
  vagas_preenchidas: string;
  vagas_canceladas: string;
  criado_em: string;
  atualizado_em: string;
  vagas?: VagaSummary[];
};

type CompanyRow = {
  id: number;
  razao_social: string;
  cnpj: string;
  cidade: string;
  status: string;
  actions: JSX.Element;
};

type FormState = {
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  ramo_atividade: string;
  porte: string;
  qtd_funcionarios: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  nome_responsavel: string;
  cargo_responsavel: string;
  telefone: string;
  celular: string;
  email: string;
  whatsapp: string;
  site: string;
  observacoes: string;
  beneficios: string;
  horario_funcionamento: string;
  status: string;
};

const EMPTY_FORM: FormState = {
  razao_social: '', nome_fantasia: '', cnpj: '', ramo_atividade: '', porte: '',
  qtd_funcionarios: '', cep: '', endereco: '', numero: '', complemento: '',
  bairro: '', cidade: '', estado: '', nome_responsavel: '', cargo_responsavel: '',
  telefone: '', celular: '', email: '', whatsapp: '', site: '',
  observacoes: '', beneficios: '', horario_funcionamento: '', status: 'ATIVA',
};

const STATUS_OPTIONS = [
  { label: 'Ativa', value: 'ATIVA' },
  { label: 'Inativa', value: 'INATIVA' },
  { label: 'Parceira', value: 'PARCEIRA' },
];

const STATUS_LABELS: Record<string, string> = {
  ATIVA: 'Ativa',
  INATIVA: 'Inativa',
  PARCEIRA: 'Parceira',
};

const STATUS_COLORS: Record<string, string> = {
  ATIVA: 'status-green',
  INATIVA: 'status-red',
  PARCEIRA: 'status-blue',
};

const VAGA_STATUS_LABELS: Record<string, string> = {
  ABERTA: 'Aberta',
  PREENCHIDA: 'Preenchida',
  CANCELADA: 'Cancelada',
};

const VAGA_STATUS_COLORS: Record<string, string> = {
  ABERTA: 'status-blue',
  PREENCHIDA: 'status-green',
  CANCELADA: 'status-red',
};

const PORTE_OPTIONS = [
  { label: 'Selecione...', value: '' },
  { label: 'MEI', value: 'MEI' },
  { label: 'Microempresa', value: 'Microempresa' },
  { label: 'Pequena Empresa', value: 'Pequena Empresa' },
  { label: 'Média Empresa', value: 'Média Empresa' },
  { label: 'Grande Empresa', value: 'Grande Empresa' },
];

const ESTADOS = [
  '', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const ESTADO_OPTIONS = ESTADOS.map((e) => ({ label: e || 'UF', value: e }));

function formatCNPJ(cnpj: string) {
  if (!cnpj) return '-';
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14) return cnpj;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

function formatDateTime(iso: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatSalary(value: string | number | null) {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

const sectionLabel: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 800, color: '#1e88e5',
  textTransform: 'uppercase', letterSpacing: '0.04em',
};


export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Company | null>(null);
  const [detailData, setDetailData] = useState<Company | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function field(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function loadCompanies() {
    try {
      const { data } = await referralsApi.get<Company[]>('/companies');
      setCompanies(data);
    } catch {
      showToast('error', 'Erro ao carregar empresas. Verifique se o serviço está em execução.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCompanies(); }, []);

  function handleOpenCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(company: Company) {
    setForm({
      razao_social: company.razao_social || '',
      nome_fantasia: company.nome_fantasia || '',
      cnpj: formatCNPJ(company.cnpj || ''),
      ramo_atividade: company.ramo_atividade || '',
      porte: company.porte || '',
      qtd_funcionarios: company.qtd_funcionarios != null ? String(company.qtd_funcionarios) : '',
      cep: company.cep || '',
      endereco: company.endereco || '',
      numero: company.numero || '',
      complemento: company.complemento || '',
      bairro: company.bairro || '',
      cidade: company.cidade || '',
      estado: company.estado || '',
      nome_responsavel: company.nome_responsavel || '',
      cargo_responsavel: company.cargo_responsavel || '',
      telefone: company.telefone || '',
      celular: company.celular || '',
      email: company.email || '',
      whatsapp: company.whatsapp || '',
      site: company.site || '',
      observacoes: company.observacoes || '',
      beneficios: company.beneficios || '',
      horario_funcionamento: company.horario_funcionamento || '',
      status: company.status || 'ATIVA',
    });
    setEditingId(company.id);
    setIsFormOpen(true);
  }

  async function handleViewDetails(company: Company) {
    setSelected(company);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const { data } = await referralsApi.get<Company>(`/companies/${company.id}`);
      setDetailData(data);
    } catch {
      setDetailData(company);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleSave() {
    if (!form.razao_social.trim()) {
      showToast('error', 'Razão Social é obrigatória.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      cnpj: form.cnpj.replace(/\D/g, '').slice(0, 14) || null,
      qtd_funcionarios: form.qtd_funcionarios ? parseInt(form.qtd_funcionarios) : null,
    };
    try {
      if (editingId !== null) {
        await referralsApi.put(`/companies/${editingId}`, payload);
        showToast('success', 'Empresa atualizada com sucesso.');
      } else {
        await referralsApi.post('/companies', payload);
        showToast('success', 'Empresa cadastrada com sucesso.');
      }
      setIsFormOpen(false);
      loadCompanies();
    } catch (err: any) {
      const msg = err?.response?.data?.erro || 'Erro ao salvar empresa.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, nome: string) {
    if (!confirm(`Deseja realmente excluir a empresa "${nome}"? Todas as vagas vinculadas também serão excluídas.`)) return;
    try {
      await referralsApi.delete(`/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      showToast('success', 'Empresa removida com sucesso.');
    } catch {
      showToast('error', 'Erro ao remover empresa.');
    }
  }

  const rows: CompanyRow[] = companies.map((c) => ({
    id: c.id,
    razao_social: c.razao_social,
    cnpj: formatCNPJ(c.cnpj || ''),
    cidade: c.cidade ? `${c.cidade}${c.estado ? ` - ${c.estado}` : ''}` : '-',
    status: c.status,
    actions: (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button type="button" variant="secondary" icon={<Eye size={16} />} onClick={() => handleViewDetails(c)}>
          Detalhes
        </Button>
        <Button type="button" variant="ghost" icon={<Pencil size={16} />} onClick={() => handleOpenEdit(c)}>
          Editar
        </Button>
        <Button type="button" variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(c.id, c.razao_social)}>
          Excluir
        </Button>
      </div>
    ),
  }));

  const detail = detailData || selected;

  return (
    <div className="page-stack">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="page-heading">
        <div>
          <span className="eyebrow">Parceiros</span>
          <h1>Empresas</h1>
          <p>Gerencie empresas parceiras e o vínculo com as vagas.</p>
        </div>
        <Button type="button" icon={<Plus size={18} />} onClick={handleOpenCreate}>
          Nova Empresa
        </Button>
      </div>

      <Table<CompanyRow>
        columns={[
          { key: 'razao_social', label: 'Razão Social' },
          { key: 'cnpj', label: 'CNPJ' },
          { key: 'cidade', label: 'Cidade / UF' },
          {
            key: 'status',
            label: 'Status',
            render: (row) => (
              <span className={`status-badge ${STATUS_COLORS[row.status] || 'status-green'}`}>
                {STATUS_LABELS[row.status] || row.status}
              </span>
            ),
          },
          { key: 'actions', label: 'Ações' },
        ]}
        data={rows}
        emptyMessage={loading ? 'Carregando empresas...' : 'Nenhuma empresa cadastrada'}
        searchPlaceholder="Buscar por razão social, CNPJ ou cidade"
      />

      {/* Modal: Cadastro / Edição */}
      <Modal
        isOpen={isFormOpen}
        title={editingId !== null ? 'Editar Empresa' : 'Nova Empresa'}
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
          {/* Dados da Empresa */}
          <div style={{ marginBottom: '4px' }}>
            <span style={sectionLabel}>Dados da Empresa</span>
          </div>
          <div className="form-grid">
            <Input label="Razão Social" name="razao_social" placeholder="Razão Social" value={form.razao_social} onChange={field('razao_social')} />
            <Input label="Nome Fantasia" name="nome_fantasia" placeholder="Nome Fantasia" value={form.nome_fantasia} onChange={field('nome_fantasia')} />
            <Input label="CNPJ" name="cnpj" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={field('cnpj')} />
            <Input label="Ramo de Atividade" name="ramo_atividade" placeholder="Ex: Construção Civil, Comércio..." value={form.ramo_atividade} onChange={field('ramo_atividade')} />
            <Select label="Porte da Empresa" name="porte" value={form.porte} onChange={field('porte')} options={PORTE_OPTIONS} />
            <Input label="Quantidade de Funcionários" name="qtd_funcionarios" type="number" placeholder="Ex: 50" value={form.qtd_funcionarios} onChange={field('qtd_funcionarios')} />
            <Select label="Status" name="status" value={form.status} onChange={field('status')} options={STATUS_OPTIONS} />
          </div>

          {/* Localização */}
          <div style={{ marginTop: '8px', marginBottom: '4px' }}>
            <span style={sectionLabel}>Localização</span>
          </div>
          <div className="form-grid">
            <Input label="CEP" name="cep" placeholder="00000-000" value={form.cep} onChange={field('cep')} />
            <Input label="Endereço" name="endereco" placeholder="Rua, Avenida..." value={form.endereco} onChange={field('endereco')} />
            <Input label="Número" name="numero" placeholder="Nº" value={form.numero} onChange={field('numero')} />
            <Input label="Complemento" name="complemento" placeholder="Sala, Apto..." value={form.complemento} onChange={field('complemento')} />
            <Input label="Bairro" name="bairro" placeholder="Bairro" value={form.bairro} onChange={field('bairro')} />
            <Input label="Cidade" name="cidade" placeholder="Cidade" value={form.cidade} onChange={field('cidade')} />
            <Select label="Estado (UF)" name="estado" value={form.estado} onChange={field('estado')} options={ESTADO_OPTIONS} />
          </div>

          {/* Contato */}
          <div style={{ marginTop: '8px', marginBottom: '4px' }}>
            <span style={sectionLabel}>Contato</span>
          </div>
          <div className="form-grid">
            <Input label="Nome do Responsável" name="nome_responsavel" placeholder="Nome completo" value={form.nome_responsavel} onChange={field('nome_responsavel')} />
            <Input label="Cargo do Responsável" name="cargo_responsavel" placeholder="Ex: Gerente de RH" value={form.cargo_responsavel} onChange={field('cargo_responsavel')} />
            <Input label="Telefone" name="telefone" placeholder="(00) 0000-0000" value={form.telefone} onChange={field('telefone')} />
            <Input label="Celular" name="celular" placeholder="(00) 00000-0000" value={form.celular} onChange={field('celular')} />
            <Input label="E-mail" name="email" type="email" placeholder="email@empresa.com" value={form.email} onChange={field('email')} />
            <Input label="WhatsApp" name="whatsapp" placeholder="(00) 00000-0000" value={form.whatsapp} onChange={field('whatsapp')} />
          </div>

          {/* Informações Adicionais */}
          <div style={{ marginTop: '8px', marginBottom: '4px' }}>
            <span style={sectionLabel}>Informações Adicionais</span>
          </div>
          <Input label="Site da Empresa" name="site" placeholder="https://..." value={form.site} onChange={field('site')} />
          <Input label="Horário de Funcionamento" name="horario_funcionamento" placeholder="Ex: Seg–Sex 08h–18h" value={form.horario_funcionamento} onChange={field('horario_funcionamento')} />
          <Textarea label="Benefícios Oferecidos" name="beneficios" placeholder="Vale-alimentação, plano de saúde..." value={form.beneficios} onChange={field('beneficios')} />
          <Textarea label="Observações" name="observacoes" placeholder="Informações adicionais sobre a empresa..." value={form.observacoes} onChange={field('observacoes')} />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #edf0f5' }}>
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : editingId !== null ? 'Salvar Alterações' : 'Confirmar Cadastro'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Detalhes */}
      <Modal
        isOpen={isDetailOpen}
        title="Detalhes da Empresa"
        onClose={() => { setIsDetailOpen(false); setDetailData(null); }}
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              icon={<Pencil size={16} />}
              onClick={() => {
                setIsDetailOpen(false);
                setDetailData(null);
                if (detail) handleOpenEdit(detail as Company);
              }}
            >
              Editar
            </Button>
            <Button type="button" variant="secondary" onClick={() => { setIsDetailOpen(false); setDetailData(null); }}>
              Fechar
            </Button>
          </>
        }
      >
        {detail && (
          <div className="detail-grid">
            {/* Dados da Empresa */}
            <div style={{ marginBottom: '2px' }}>
              <span style={sectionLabel}>Dados da Empresa</span>
            </div>
            {([
              ['Razão Social', detail.razao_social || '-'],
              ['Nome Fantasia', detail.nome_fantasia || '-'],
              ['CNPJ', formatCNPJ(detail.cnpj || '')],
              ['Ramo de Atividade', detail.ramo_atividade || '-'],
              ['Porte', detail.porte || '-'],
              ['Qtd. Funcionários', detail.qtd_funcionarios != null ? String(detail.qtd_funcionarios) : '-'],
              ['Status', STATUS_LABELS[detail.status] || detail.status || '-'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="detail-row">
                <span className="detail-label">{label}</span>
                {label === 'Status'
                  ? <span className={`status-badge ${STATUS_COLORS[detail.status] || 'status-green'}`}>{value}</span>
                  : <span className="detail-value">{value}</span>}
              </div>
            ))}

            {/* Localização */}
            <div style={{ marginTop: '8px', marginBottom: '2px' }}>
              <span style={sectionLabel}>Localização</span>
            </div>
            {([
              ['CEP', detail.cep || '-'],
              ['Endereço', [detail.endereco, detail.numero, detail.complemento].filter(Boolean).join(', ') || '-'],
              ['Bairro', detail.bairro || '-'],
              ['Cidade / UF', detail.cidade && detail.estado ? `${detail.cidade} - ${detail.estado}` : (detail.cidade || detail.estado || '-')],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="detail-row">
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}

            {/* Contato */}
            <div style={{ marginTop: '8px', marginBottom: '2px' }}>
              <span style={sectionLabel}>Contato</span>
            </div>
            {([
              ['Responsável', detail.nome_responsavel || '-'],
              ['Cargo', detail.cargo_responsavel || '-'],
              ['Telefone', detail.telefone || '-'],
              ['Celular', detail.celular || '-'],
              ['E-mail', detail.email || '-'],
              ['WhatsApp', detail.whatsapp || '-'],
              ['Site', detail.site || '-'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="detail-row">
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}

            {/* Informações Adicionais */}
            {(detail.beneficios || detail.horario_funcionamento || detail.observacoes) && (
              <>
                <div style={{ marginTop: '8px', marginBottom: '2px' }}>
                  <span style={sectionLabel}>Informações Adicionais</span>
                </div>
                {([
                  ['Horário de Funcionamento', detail.horario_funcionamento || '-'],
                  ['Benefícios', detail.beneficios || '-'],
                  ['Observações', detail.observacoes || '-'],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="detail-row">
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value}</span>
                  </div>
                ))}
              </>
            )}

            {/* Histórico de Vagas */}
            <div style={{ marginTop: '8px', marginBottom: '6px' }}>
              <span style={sectionLabel}>Histórico de Vagas</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {[
                { label: 'Total', value: detail.total_vagas || '0', color: '#1e88e5' },
                { label: 'Abertas', value: detail.vagas_abertas || '0', color: '#166534' },
                { label: 'Preenchidas', value: detail.vagas_preenchidas || '0', color: '#92400e' },
                { label: 'Canceladas', value: detail.vagas_canceladas || '0', color: '#991b1b' },
              ].map((item) => (
                <div key={item.label} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: '8px', padding: '8px 16px', textAlign: 'center', minWidth: '72px',
                }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {loadingDetail && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Carregando vagas...</p>}

            {!loadingDetail && detail.vagas && detail.vagas.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {detail.vagas.map((vaga) => (
                  <div key={vaga.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: '8px', padding: '8px 12px',
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1f2937' }}>{vaga.cargo}</span>
                      <span style={{ marginLeft: '8px', fontSize: '0.82rem', color: '#6b7280' }}>{formatSalary(vaga.salario)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`status-badge ${VAGA_STATUS_COLORS[vaga.status] || 'status-blue'}`}>
                        {VAGA_STATUS_LABELS[vaga.status] || vaga.status}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                        {new Date(vaga.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingDetail && detail.vagas && detail.vagas.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Nenhuma vaga cadastrada para esta empresa.</p>
            )}

            {/* Datas */}
            <div style={{ marginTop: '8px' }}>
              {([
                ['Cadastrado em', formatDateTime(detail.criado_em)],
                ['Última atualização', formatDateTime(detail.atualizado_em)],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="detail-row">
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
