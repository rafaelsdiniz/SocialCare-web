// Tipos espelhando os DTOs da SocialCare API (PT-BR, como na API).

export interface PagedResult<T> {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
  totalPaginas: number;
}

// ---- Autenticação ----
export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  login: string;
  perfis: string[];
}

export interface LoginResponse {
  token: string;
  expiraEm: string;
  usuario: UsuarioAutenticado;
}

// ---- Público ----
export interface Estado {
  id: number;
  codigoIbge: number;
  sigla: string;
  nome: string;
  regiao: string;
}

export interface Municipio {
  id: number;
  codigoIbge: number;
  nome: string;
  uf: string;
}

export interface ProgramaPublico {
  id: number;
  nome: string;
  descricao?: string | null;
  orgaoResponsavel: string;
  requisitos?: string | null;
  iconeBase64?: string | null;
  valorPadrao?: number | null;
}

export interface ProgramaPublicoDetalhe extends ProgramaPublico {
  duracaoMesesPadrao?: number | null;
  vigenciaInicio?: string | null;
  vigenciaFim?: string | null;
}

export interface IndicadorPorUf {
  uf: string;
  quantidade: number;
}
export interface IndicadorPorPrograma {
  programa: string;
  quantidade: number;
}
export interface IndicadorPorMunicipio {
  municipio: string;
  quantidade: number;
}
export interface IndicadorPorStatus {
  status: string;
  quantidade: number;
}
export interface Indicadores {
  totalFamiliasAtivas: number;
  totalMembros: number;
  totalBeneficiosAtivos: number;
  totalProgramas: number;
  totalVisitasUltimos30Dias: number;
  populacaoAbrangida: number;
  familiasPorUf: IndicadorPorUf[];
  beneficiosPorPrograma: IndicadorPorPrograma[];
  familiasPorMunicipio: IndicadorPorMunicipio[];
  familiasPorStatus: IndicadorPorStatus[];
}

export interface ContextoFederal {
  disponivel: boolean;
  municipiosConsultados: number;
  beneficiarios: number;
  valorTotal: number;
  ano?: number | null;
  mes?: number | null;
}

export interface PontoMapa {
  lat: number;
  lng: number;
  municipio: string;
  familias: number;
}

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string | null;
  estado?: string | null;
}

// ---- Famílias ----
export interface EnderecoRequest {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  pontoReferencia?: string | null;
  municipioId: number;
}
export interface EnderecoDto extends EnderecoRequest {
  id: number;
  municipio?: string | null;
  uf?: string | null;
}

export interface FamiliaResumo {
  id: number;
  codigoFamiliar: string;
  nomeResponsavel: string;
  quantidadeMembros: number;
  rendaPerCapita: number;
  status: string;
  municipio?: string | null;
  uf?: string | null;
}

export interface Familia {
  id: number;
  codigoFamiliar: string;
  nomeResponsavel: string;
  quantidadeMembros: number;
  rendaTotalMensal: number;
  rendaPerCapita: number;
  status: string;
  observacoes?: string | null;
  dataCadastro: string;
  endereco?: EnderecoDto | null;
  criadoEm: string;
  atualizadoEm?: string | null;
  ativo: boolean;
}

export interface CriarFamiliaRequest {
  codigoFamiliar: string;
  nomeResponsavel: string;
  observacoes?: string | null;
  endereco: EnderecoRequest;
}
export interface AtualizarFamiliaRequest {
  nomeResponsavel: string;
  status: number;
  observacoes?: string | null;
  endereco: EnderecoRequest;
}

// ---- Membros ----
export interface DocumentoRequest {
  tipoDocumentoId: number;
  numero: string;
  orgaoEmissor?: string | null;
  dataEmissao?: string | null;
  dataValidade?: string | null;
}
export interface DocumentoDto extends DocumentoRequest {
  id: number;
  tipoDocumento?: string | null;
}
export interface RendaRequest {
  tipoRendaId: number;
  valor: number;
  mesReferencia: number;
  anoReferencia: number;
  fonte?: string | null;
  observacao?: string | null;
}
export interface RendaDto extends RendaRequest {
  id: number;
  tipoRenda?: string | null;
  consideradaParaCalculo: boolean;
}

export interface MembroResumo {
  id: number;
  nome: string;
  idade: number;
  sexo: string;
  parentesco?: string | null;
  rendaMensalConsiderada: number;
}

export interface MembroRequest {
  nome: string;
  dataNascimento: string;
  sexo: number;
  estadoCivil: number;
  parentescoId: number;
  nomeMae?: string | null;
  nomePai?: string | null;
  escolaridade?: string | null;
  ocupacao?: string | null;
  pessoaComDeficiencia: boolean;
  descricaoDeficiencia?: string | null;
  telefone?: string | null;
  documentos?: DocumentoRequest[];
  rendas?: RendaRequest[];
}

export interface Membro {
  id: number;
  familiaId: number;
  nome: string;
  dataNascimento: string;
  idade: number;
  sexo: string;
  estadoCivil: string;
  parentescoId: number;
  parentesco?: string | null;
  nomeMae?: string | null;
  nomePai?: string | null;
  escolaridade?: string | null;
  ocupacao?: string | null;
  pessoaComDeficiencia: boolean;
  descricaoDeficiencia?: string | null;
  telefone?: string | null;
  rendaMensalConsiderada: number;
  documentos: DocumentoDto[];
  rendas: RendaDto[];
  criadoEm: string;
  atualizadoEm?: string | null;
  ativo: boolean;
}

// ---- Visitas ----
export interface VisitaResumo {
  id: number;
  familiaId: number;
  familiaCodigo?: string | null;
  tipo: string;
  status: string;
  dataAgendada: string;
  dataRealizacao?: string | null;
  assistente?: string | null;
}
export interface Visita {
  id: number;
  familiaId: number;
  familiaCodigo?: string | null;
  assistenteResponsavelId: number;
  assistente?: string | null;
  tipo: string;
  status: string;
  dataAgendada: string;
  dataRealizacao?: string | null;
  motivo?: string | null;
  observacoes?: string | null;
  encaminhamentos?: string | null;
  aviso?: string | null;
  criadoEm: string;
  atualizadoEm?: string | null;
}
export interface AgendarVisitaRequest {
  familiaId: number;
  dataAgendada: string;
  tipo: number;
  motivo?: string | null;
}
export interface AtualizarVisitaRequest {
  dataAgendada: string;
  tipo: number;
  motivo?: string | null;
  observacoes?: string | null;
}
export interface RegistrarVisitaRequest {
  dataRealizacao?: string | null;
  observacoes?: string | null;
  encaminhamentos?: string | null;
}

// ---- Atendimentos ----
export interface AtendimentoResumo {
  id: number;
  familiaId: number;
  familiaCodigo?: string | null;
  motivo: string;
  status: string;
  remoto: boolean;
  dataAtendimento: string;
  assistente?: string | null;
}
export interface Atendimento {
  id: number;
  familiaId: number;
  familiaCodigo?: string | null;
  assistenteResponsavelId: number;
  assistente?: string | null;
  motivo: string;
  demanda?: string | null;
  parecer?: string | null;
  remoto: boolean;
  status: string;
  dataAtendimento: string;
  criadoEm: string;
  atualizadoEm?: string | null;
}
export interface AbrirAtendimentoRequest {
  familiaId: number;
  dataAtendimento?: string | null;
  motivo: string;
  demanda?: string | null;
  remoto: boolean;
}
export interface AtualizarAtendimentoRequest {
  motivo: string;
  demanda?: string | null;
  parecer?: string | null;
  remoto: boolean;
  status: number;
}

// ---- Encaminhamentos ----
export interface EncaminhamentoResumo {
  id: number;
  familiaId: number;
  familiaCodigo?: string | null;
  instituicaoParceiraId: number;
  instituicao?: string | null;
  motivo: string;
  status: string;
  dataEncaminhamento: string;
}
export interface Encaminhamento {
  id: number;
  familiaId: number;
  familiaCodigo?: string | null;
  instituicaoParceiraId: number;
  instituicao?: string | null;
  membroId?: number | null;
  membro?: string | null;
  motivo: string;
  demanda?: string | null;
  status: string;
  dataEncaminhamento: string;
  dataRetorno?: string | null;
  retorno?: string | null;
  criadoEm: string;
  atualizadoEm?: string | null;
}
export interface CriarEncaminhamentoRequest {
  familiaId: number;
  instituicaoParceiraId: number;
  membroId?: number | null;
  motivo: string;
  demanda?: string | null;
  dataEncaminhamento?: string | null;
}
export interface RegistrarRetornoRequest {
  status: number;
  retorno?: string | null;
  dataRetorno?: string | null;
}

// ---- Benefícios ----
export interface BeneficioResumo {
  id: number;
  familiaId: number;
  familiaCodigo?: string | null;
  programaSocialId: number;
  programa?: string | null;
  valor: number;
  status: string;
  dataInicio: string;
  dataFim?: string | null;
}
export interface Beneficio {
  id: number;
  familiaId: number;
  familiaCodigo?: string | null;
  familiaResponsavel?: string | null;
  programaSocialId: number;
  programa?: string | null;
  valor: number;
  status: string;
  dataInicio: string;
  dataFim?: string | null;
  observacao?: string | null;
  motivoEncerramento?: string | null;
  aprovadoPorUsuarioId?: number | null;
  aprovadoPor?: string | null;
  criadoEm: string;
  atualizadoEm?: string | null;
}
export interface ConcederBeneficioRequest {
  familiaId: number;
  programaSocialId: number;
  dataInicio: string;
  dataFim?: string | null;
  valor: number;
  observacao?: string | null;
}
export interface AtualizarBeneficioRequest {
  dataInicio: string;
  dataFim?: string | null;
  valor: number;
  observacao?: string | null;
}

// ---- Programas ----
export interface ProgramaResumo {
  id: number;
  nome: string;
  orgaoResponsavel: string;
  iconeBase64?: string | null;
  valorPadrao?: number | null;
  ativo: boolean;
}
export interface Programa {
  id: number;
  nome: string;
  orgaoResponsavel: string;
  descricao?: string | null;
  requisitos?: string | null;
  iconeBase64?: string | null;
  valorPadrao?: number | null;
  duracaoMesesPadrao?: number | null;
  vigenciaInicio?: string | null;
  vigenciaFim?: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string | null;
}
export interface ProgramaRequest {
  nome: string;
  orgaoResponsavel: string;
  descricao?: string | null;
  requisitos?: string | null;
  iconeBase64?: string | null;
  valorPadrao?: number | null;
  duracaoMesesPadrao?: number | null;
  vigenciaInicio?: string | null;
  vigenciaFim?: string | null;
  ativo?: boolean;
}

// ---- Instituições parceiras ----
export interface InstituicaoResumo {
  id: number;
  nome: string;
  cnpj: string;
  areaAtuacao: string;
  ativo: boolean;
}
export interface Instituicao {
  id: number;
  nome: string;
  cnpj: string;
  areaAtuacao: string;
  telefone?: string | null;
  email?: string | null;
  responsavelContato?: string | null;
  enderecoCompleto?: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string | null;
}
export interface InstituicaoRequest {
  nome: string;
  cnpj: string;
  areaAtuacao: string;
  telefone?: string | null;
  email?: string | null;
  responsavelContato?: string | null;
  enderecoCompleto?: string | null;
  ativo?: boolean;
}
export interface CnpjResponse {
  cnpj: string;
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
  situacaoCadastral?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  municipio?: string | null;
  uf?: string | null;
  cep?: string | null;
  telefone?: string | null;
  email?: string | null;
  enderecoCompleto?: string | null;
}

// ---- Usuários ----
export interface UsuarioResumo {
  id: number;
  nome: string;
  login: string;
  email: string;
  ativo: boolean;
  perfis: string[];
}
export interface Usuario {
  id: number;
  nome: string;
  login: string;
  email: string;
  ativo: boolean;
  ultimoLoginEm?: string | null;
  perfis: string[];
  criadoEm: string;
  atualizadoEm?: string | null;
}
export interface CriarUsuarioRequest {
  nome: string;
  email: string;
  login: string;
  senha: string;
  perfilIds: number[];
}
export interface AtualizarUsuarioRequest {
  nome: string;
  email: string;
  perfilIds: number[];
  ativo: boolean;
}

// ---- Relatórios ----
export interface FamiliasPorVulnerabilidade {
  vulnerabilidadeId: number;
  vulnerabilidade: string;
  severidade: number;
  quantidadeFamilias: number;
}
export interface BeneficiosPorPrograma {
  programaSocialId: number;
  programa: string;
  quantidadeTotal: number;
  quantidadeAtivos: number;
  valorTotalAtivos: number;
}
export interface VisitasPorAssistente {
  assistenteId: number;
  assistente: string;
  total: number;
  realizadas: number;
  agendadas: number;
  canceladas: number;
}

// ---- Auditoria ----
export interface LogAuditoria {
  id: number;
  usuarioId?: number | null;
  usuario?: string | null;
  tipo: string;
  entidade: string;
  entidadeId?: string | null;
  dadosDepois?: string | null;
  enderecoIp?: string | null;
  userAgent?: string | null;
  criadoEm: string;
}
