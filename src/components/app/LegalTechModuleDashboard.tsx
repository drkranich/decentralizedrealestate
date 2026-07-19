import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileClock,
  FileLock2,
  FileSearch,
  Gavel,
  Globe2,
  Landmark,
  LockKeyhole,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Signature,
  UserCheck,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  StatCard,
  Card,
  SectionTitle,
  Badge,
  DemoDataBadge,
} from "@/components/app/ui";
import { Progress } from "@/components/ui/progress";

type LegalTechModuleKey =
  | "jurisdictions"
  | "token-classifications"
  | "compliance-engine"
  | "legal-vault"
  | "contract-lifecycle"
  | "identity-aml"
  | "escrow-reconciliation"
  | "audit-evidence";

type BadgeVariant = "default" | "emerald" | "blue" | "warn" | "muted";

type StatConfig = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  accent?: "emerald" | "skyblue";
};

type WorkItem = {
  title: string;
  meta: string;
  status: string;
  statusVariant: BadgeVariant;
  risk: string;
};

type RecordRow = {
  ref: string;
  name: string;
  owner: string;
  state: string;
  due: string;
  risk: string;
};

type ControlItem = {
  label: string;
  detail: string;
  progress: number;
};

type ModuleConfig = {
  key: LegalTechModuleKey;
  path: string;
  title: string;
  menuTitle: string;
  subtitle: string;
  icon: LucideIcon;
  operationalNote: string;
  stats: StatConfig[];
  workQueue: WorkItem[];
  controls: ControlItem[];
  records: RecordRow[];
  evidence: string[];
  blockers: string[];
  automations: string[];
};

const legalTechModules: Record<LegalTechModuleKey, ModuleConfig> = {
  jurisdictions: {
    key: "jurisdictions",
    path: "/admin/jurisdictions",
    title: "Jurisdiction Rule Packs",
    menuTitle: "Jurisdições",
    subtitle: "Pacotes regulatórios por país, versão, vigência, restrição e responsável jurídico.",
    icon: Globe2,
    operationalNote:
      "Brasil é o pacote prioritário. Outras jurisdições permanecem bloqueadas até matriz local, parceiros licenciados e aprovação jurídica.",
    stats: [
      { label: "Pacotes", value: "6", change: "1 operacional, 5 bloqueados", icon: Globe2 },
      {
        label: "Versões ativas",
        value: "1.0-BR",
        change: "base de diagnóstico",
        icon: FileCheck2,
        accent: "skyblue",
      },
      {
        label: "Regras pendentes",
        value: "42",
        change: "dependem de validação local",
        icon: Gavel,
      },
      {
        label: "Jurisdições travadas",
        value: "5",
        change: "sem revisão externa",
        icon: LockKeyhole,
        accent: "skyblue",
      },
    ],
    workQueue: [
      {
        title: "Brasil: matriz inicial de tokenização imobiliária",
        meta: "CVM, BACEN, COAF, LGPD, registro imobiliário e tributação",
        status: "Em diagnóstico",
        statusVariant: "blue",
        risk: "alto",
      },
      {
        title: "Portugal: regra de oferta pública e suitability",
        meta: "CMVM, AML, assinatura, proteção de dados e registro",
        status: "Bloqueado",
        statusVariant: "warn",
        risk: "alto",
      },
      {
        title: "Estados Unidos: bloqueio por estado e Reg D/Reg S",
        meta: "SEC, FinCEN, money transmitter e restrições estaduais",
        status: "Revisão externa",
        statusVariant: "muted",
        risk: "crítico",
      },
    ],
    controls: [
      {
        label: "Matriz regulatória Brasil",
        detail: "Atividades permitidas, bloqueadas e dependentes de terceiros licenciados.",
        progress: 42,
      },
      {
        label: "Tabela de restrições por país",
        detail: "Oferta, investidor, escrow, assinatura, custódia, cripto e privacidade.",
        progress: 28,
      },
      {
        label: "Versionamento e vigência",
        detail: "Cada regra precisa de versão, início, fim e responsável aprovador.",
        progress: 64,
      },
    ],
    records: [
      {
        ref: "BR-REAL-1.0",
        name: "Brasil Real Estate Pack",
        owner: "Legal",
        state: "Diagnóstico",
        due: "jul 2026",
        risk: "alto",
      },
      {
        ref: "PT-REAL-DRAFT",
        name: "Portugal Property Pack",
        owner: "Externo",
        state: "Bloqueado",
        due: "a definir",
        risk: "alto",
      },
      {
        ref: "US-SEC-HOLD",
        name: "US Securities Hold",
        owner: "Compliance",
        state: "Legal hold",
        due: "a definir",
        risk: "crítico",
      },
      {
        ref: "AE-FREEZONE",
        name: "UAE Free Zone Review",
        owner: "Parcerias",
        state: "Pré-análise",
        due: "ago 2026",
        risk: "médio",
      },
    ],
    evidence: [
      "Reguladores aplicáveis e links de referência",
      "Parecer jurídico local por jurisdição",
      "Lista de parceiros licenciados aceitos",
      "Versão vigente, responsável e data de aprovação",
    ],
    blockers: [
      "Publicação comercial em país sem rule pack aprovado",
      "Aplicação de regra expirada ou sem versão",
      "Operação com cripto sem análise local",
      "Oferta pública sem restrição de elegibilidade",
    ],
    automations: [
      "Avisar quando uma regra estiver perto de expirar",
      "Bloquear criação de produto sem jurisdição válida",
      "Gerar checklist por país antes de cada oferta",
    ],
  },
  "token-classifications": {
    key: "token-classifications",
    path: "/admin/token-classifications",
    title: "Legal Token Classification",
    menuTitle: "Classificação de tokens",
    subtitle:
      "Ficha jurídica obrigatória para cada ativo tokenizado, produto fracionado ou participação.",
    icon: BadgeCheck,
    operationalNote:
      "Nenhum token deve ser tratado como escritura ou propriedade registral direta. A ficha classifica o produto e decide se ele pode avançar.",
    stats: [
      { label: "Projetos token", value: "8", change: "todos em demonstração", icon: WalletCards },
      {
        label: "Classificações",
        value: "0",
        change: "nenhuma aprovada",
        icon: BadgeCheck,
        accent: "skyblue",
      },
      { label: "Bloqueios", value: "8", change: "sem parecer vinculante", icon: LockKeyhole },
      {
        label: "Campos críticos",
        value: "17",
        change: "natureza, oferta, público e direitos",
        icon: FileSearch,
        accent: "skyblue",
      },
    ],
    workQueue: [
      {
        title: "Classificar frações de ativo residencial",
        meta: "Direitos econômicos, governança, repasse e restrição de transferência",
        status: "Requer parecer",
        statusVariant: "warn",
        risk: "alto",
      },
      {
        title: "Separar token de governança e token econômico",
        meta: "Evitar confusão entre participação econômica, escritura e posse",
        status: "Em desenho",
        statusVariant: "blue",
        risk: "alto",
      },
      {
        title: "Criar matriz de suitability por investidor",
        meta: "Investidor qualificado, varejo, limites, residência fiscal e aceites",
        status: "Pendente",
        statusVariant: "muted",
        risk: "médio",
      },
    ],
    controls: [
      {
        label: "Legal Token Classification Record",
        detail: "Natureza jurídica, direitos do titular, riscos, restrições e jurisdição.",
        progress: 35,
      },
      {
        label: "Restrições de transferência",
        detail: "Whitelist, lock-up, bloqueio por país, suitability e AML.",
        progress: 24,
      },
      {
        label: "Vínculo documental",
        detail: "Cada token precisa apontar para contrato, parecer, cap table e evidências.",
        progress: 18,
      },
    ],
    records: [
      {
        ref: "LTC-001",
        name: "Residencial fracionado BR",
        owner: "Legal",
        state: "Rascunho",
        due: "jul 2026",
        risk: "alto",
      },
      {
        ref: "LTC-002",
        name: "Hotelaria com repasse",
        owner: "Investimentos",
        state: "Bloqueado",
        due: "ago 2026",
        risk: "alto",
      },
      {
        ref: "LTC-003",
        name: "Governança de empreendimento",
        owner: "Produto",
        state: "Pré-análise",
        due: "ago 2026",
        risk: "médio",
      },
      {
        ref: "LTC-004",
        name: "Mercado secundário interno",
        owner: "Compliance",
        state: "Indisponível",
        due: "a definir",
        risk: "crítico",
      },
    ],
    evidence: [
      "Parecer jurídico assinado",
      "Termo de risco do investidor",
      "Contrato de participação ou veículo",
      "Cap table e regras de distribuição",
    ],
    blockers: [
      "Token sem classificação jurídica aprovada",
      "Oferta com expectativa de lucro não enquadrada",
      "Transferência sem suitability e AML",
      "Documento de direitos econômicos ausente",
    ],
    automations: [
      "Bloquear oferta quando o record estiver incompleto",
      "Exigir nova revisão ao mudar direito econômico",
      "Gerar pacote de disclosure por classe de investidor",
    ],
  },
  "compliance-engine": {
    key: "compliance-engine",
    path: "/admin/compliance-engine",
    title: "Heritage Compliance Engine",
    menuTitle: "Compliance Engine",
    subtitle:
      "Motor de decisões com regra aplicada, fundamento, versão, evidência e revisão humana.",
    icon: ShieldCheck,
    operationalNote:
      "A decisão de compliance nunca é invisível: toda aprovação, bloqueio ou exceção precisa de regra versionada e trilha de evidências.",
    stats: [
      {
        label: "Decisões simuladas",
        value: "128",
        change: "sem efeito regulatório real",
        icon: ShieldCheck,
      },
      {
        label: "Revisão humana",
        value: "39%",
        change: "casos com risco elevado",
        icon: UserCheck,
        accent: "skyblue",
      },
      {
        label: "Regras críticas",
        value: "24",
        change: "AML, suitability, oferta e contrato",
        icon: Gavel,
      },
      {
        label: "Bloqueios hard-stop",
        value: "11",
        change: "sanções, jurisdição e documentação",
        icon: ShieldAlert,
        accent: "skyblue",
      },
    ],
    workQueue: [
      {
        title: "Decisão: oferta tokenizada BR sem classificação",
        meta: "Rule BR-TOKEN-001 v0.1, falta parecer jurídico",
        status: "Bloqueada",
        statusVariant: "warn",
        risk: "alto",
      },
      {
        title: "Decisão: investidor com residência fiscal divergente",
        meta: "Suitability e KYC reforçado antes de aceite",
        status: "Revisão",
        statusVariant: "blue",
        risk: "médio",
      },
      {
        title: "Decisão: documento assinado com tentativa de sobrescrita",
        meta: "Legal Vault deve preservar original e abrir nova versão",
        status: "Hard-stop",
        statusVariant: "warn",
        risk: "crítico",
      },
    ],
    controls: [
      {
        label: "Decision record",
        detail: "Resultado, regra, versão, evidência, justificativa e aprovador.",
        progress: 58,
      },
      {
        label: "Human override",
        detail: "Exceções exigem justificativa, segundo aprovador e expiração.",
        progress: 34,
      },
      {
        label: "Rule tests",
        detail: "Casos de falha: regra expirada, documento ausente e usuário sancionado.",
        progress: 41,
      },
    ],
    records: [
      {
        ref: "DEC-2026-001",
        name: "Offer legal gate",
        owner: "Compliance",
        state: "Bloqueada",
        due: "agora",
        risk: "alto",
      },
      {
        ref: "DEC-2026-014",
        name: "Investor AML review",
        owner: "AML",
        state: "Revisão",
        due: "24h",
        risk: "médio",
      },
      {
        ref: "DEC-2026-027",
        name: "Contract approval gate",
        owner: "Legal",
        state: "Condição",
        due: "48h",
        risk: "alto",
      },
      {
        ref: "DEC-2026-051",
        name: "Document vault immutability",
        owner: "Security",
        state: "Hard-stop",
        due: "agora",
        risk: "crítico",
      },
    ],
    evidence: [
      "Rule id e versão aplicada",
      "Snapshot dos dados avaliados",
      "Documentos e verificações externas",
      "Justificativa da decisão humana",
    ],
    blockers: [
      "Decisão sem rule pack versionado",
      "Override sem justificativa e aprovador",
      "Operação sem evidência anexada",
      "Aprovação automática em caso de alto risco",
    ],
    automations: [
      "Calcular severidade por regra e jurisdição",
      "Abrir revisão quando um documento expirar",
      "Gerar relatório de decisões por período",
    ],
  },
  "legal-vault": {
    key: "legal-vault",
    path: "/admin/legal-vault",
    title: "Heritage Legal Vault",
    menuTitle: "Legal Vault",
    subtitle: "Cofre documental com hash, versão, retenção, legal hold e cadeia de custódia.",
    icon: FileLock2,
    operationalNote:
      "Documentos sensíveis não ficam públicos, documentos assinados não são sobrescritos e evidências críticas não são apagadas.",
    stats: [
      {
        label: "Categorias",
        value: "12",
        change: "imóvel, pessoa, oferta, contrato e prova",
        icon: Archive,
      },
      {
        label: "Legal holds",
        value: "3",
        change: "retenção obrigatória",
        icon: FileLock2,
        accent: "skyblue",
      },
      {
        label: "Hashes pendentes",
        value: "0",
        change: "exigido antes de assinatura",
        icon: CheckCircle2,
      },
      {
        label: "Documentos públicos",
        value: "0",
        change: "sensíveis ficam privados",
        icon: LockKeyhole,
        accent: "skyblue",
      },
    ],
    workQueue: [
      {
        title: "Definir política de retenção por tipo documental",
        meta: "KYC, contrato, matrícula, comprovantes, assinatura e disputa",
        status: "Em desenho",
        statusVariant: "blue",
        risk: "alto",
      },
      {
        title: "Separar original, normalizado, assinado e evidência",
        meta: "Impede sobrescrita e mantém cadeia de custódia",
        status: "Planejado",
        statusVariant: "muted",
        risk: "médio",
      },
      {
        title: "Criar legal hold para disputa e ordem judicial",
        meta: "Bloqueio de exclusão e exportação controlada",
        status: "Obrigatório",
        statusVariant: "warn",
        risk: "alto",
      },
    ],
    controls: [
      {
        label: "Imutabilidade de assinatura",
        detail: "Documento assinado só pode ganhar nova versão, nunca ser alterado.",
        progress: 62,
      },
      {
        label: "Retenção e legal hold",
        detail: "Políticas por jurisdição, tipo documental e situação de disputa.",
        progress: 44,
      },
      {
        label: "Auditoria de visualização",
        detail: "Acesso a documento sensível exige log, papel, motivo e usuário.",
        progress: 38,
      },
    ],
    records: [
      {
        ref: "VAULT-PROP",
        name: "Documentos do imóvel",
        owner: "Operação",
        state: "Privado",
        due: "jul 2026",
        risk: "alto",
      },
      {
        ref: "VAULT-KYC",
        name: "KYC/KYB",
        owner: "Compliance",
        state: "Restrito",
        due: "jul 2026",
        risk: "alto",
      },
      {
        ref: "VAULT-SIGN",
        name: "Assinaturas",
        owner: "Legal",
        state: "Imutável",
        due: "ago 2026",
        risk: "médio",
      },
      {
        ref: "VAULT-EVID",
        name: "Evidências",
        owner: "Audit",
        state: "Append-only",
        due: "ago 2026",
        risk: "alto",
      },
    ],
    evidence: [
      "Hash SHA-256 do arquivo",
      "Metadados de upload e visualização",
      "Versão do documento e vínculo com contrato",
      "Motivo de legal hold e responsável",
    ],
    blockers: [
      "Bucket público para documento sensível",
      "Exclusão de documento sob legal hold",
      "Sobrescrita de contrato assinado",
      "Visualização sem log de auditoria",
    ],
    automations: [
      "Gerar hash ao receber arquivo",
      "Exigir motivo ao baixar documento sensível",
      "Aplicar retenção quando houver disputa",
    ],
  },
  "contract-lifecycle": {
    key: "contract-lifecycle",
    path: "/admin/contract-lifecycle",
    title: "Contract Lifecycle Management",
    menuTitle: "CLM",
    subtitle:
      "Templates, cláusulas, versões, revisão jurídica, assinatura, vigência e arquivamento.",
    icon: Signature,
    operationalNote:
      "Contrato gerado por IA ou template só avança para assinatura após revisão jurídica, versão aprovada e evidências vinculadas.",
    stats: [
      {
        label: "Templates",
        value: "9",
        change: "compra, venda, locação, investimento e escrow",
        icon: FileCheck2,
      },
      {
        label: "Cláusulas",
        value: "64",
        change: "biblioteca versionada",
        icon: FileSearch,
        accent: "skyblue",
      },
      { label: "Estados", value: "15", change: "do rascunho ao legal hold", icon: FileClock },
      {
        label: "Assinaturas reais",
        value: "0",
        change: "provedor não conectado",
        icon: Signature,
        accent: "skyblue",
      },
    ],
    workQueue: [
      {
        title: "Template de compra e venda tradicional",
        meta: "Partes, imóvel, preço, condições, escritura e registro",
        status: "Rascunho",
        statusVariant: "blue",
        risk: "médio",
      },
      {
        title: "Termo de investimento fracionado",
        meta: "Direitos econômicos, disclosure, risco, suitability e distribuição",
        status: "Requer parecer",
        statusVariant: "warn",
        risk: "alto",
      },
      {
        title: "Contrato de escrow e liberação",
        meta: "Condições precedentes, devolução, disputa e conciliação",
        status: "Parceiro necessário",
        statusVariant: "muted",
        risk: "alto",
      },
    ],
    controls: [
      {
        label: "Estados contratuais",
        detail: "Rascunho, revisão, aprovado, assinatura, vigente, substituído, legal hold.",
        progress: 68,
      },
      {
        label: "Biblioteca de cláusulas",
        detail: "Cláusulas por jurisdição, operação, versão, risco e aprovador.",
        progress: 33,
      },
      {
        label: "Assinatura eletrônica",
        detail: "Provider, evidência, certificado, IP, trilha de aceite e cofre.",
        progress: 21,
      },
    ],
    records: [
      {
        ref: "TPL-SALE-BR",
        name: "Compra e venda BR",
        owner: "Legal",
        state: "Rascunho",
        due: "jul 2026",
        risk: "médio",
      },
      {
        ref: "TPL-LEASE-BR",
        name: "Locação residencial BR",
        owner: "Legal",
        state: "Revisão",
        due: "jul 2026",
        risk: "médio",
      },
      {
        ref: "TPL-TOKEN-BR",
        name: "Investimento tokenizado",
        owner: "Legal",
        state: "Bloqueado",
        due: "ago 2026",
        risk: "alto",
      },
      {
        ref: "TPL-ESCROW",
        name: "Escrow conditions",
        owner: "Finance",
        state: "Parceiro",
        due: "a definir",
        risk: "alto",
      },
    ],
    evidence: [
      "Versão do template e cláusulas usadas",
      "Aprovação jurídica e data",
      "Assinaturas e certificado do provedor",
      "Documento final arquivado no Legal Vault",
    ],
    blockers: [
      "Assinatura sem aprovação jurídica",
      "Contrato com cláusula expirada",
      "Alteração de contrato assinado",
      "Template sem jurisdição definida",
    ],
    automations: [
      "Bloquear assinatura se contrato estiver em revisão",
      "Criar nova versão ao alterar cláusula",
      "Alertar vencimento e renovação de contrato",
    ],
  },
  "identity-aml": {
    key: "identity-aml",
    path: "/admin/identity-aml",
    title: "KYC, KYB, AML & Sanctions",
    menuTitle: "KYC/KYB/AML",
    subtitle:
      "Identidade, beneficiário final, sanções, PEP, origem de recursos e monitoramento contínuo.",
    icon: UserCheck,
    operationalNote:
      "Identidade e AML dependem de provedores e políticas aprovadas. O dashboard modela filas, bloqueios e evidências, sem substituir verificação licenciada.",
    stats: [
      { label: "Casos KYC", value: "24", change: "modelo operacional", icon: UserCheck },
      {
        label: "Casos KYB",
        value: "7",
        change: "beneficiário final pendente",
        icon: Landmark,
        accent: "skyblue",
      },
      { label: "PEP/Sanções", value: "0", change: "hard-stop quando positivo", icon: ShieldAlert },
      {
        label: "EDD",
        value: "9",
        change: "due diligence reforçada",
        icon: FileSearch,
        accent: "skyblue",
      },
    ],
    workQueue: [
      {
        title: "Investidor com origem de recursos incompleta",
        meta: "Solicitar comprovante adicional e declaração de patrimônio",
        status: "EDD",
        statusVariant: "warn",
        risk: "alto",
      },
      {
        title: "Proprietário PJ sem beneficiário final",
        meta: "KYB, poderes de representação e sanções",
        status: "Pendente",
        statusVariant: "blue",
        risk: "médio",
      },
      {
        title: "Wallet screening antes de aporte cripto",
        meta: "Não aceitar cripto sem análise de endereço e origem",
        status: "Parceiro necessário",
        statusVariant: "muted",
        risk: "alto",
      },
    ],
    controls: [
      {
        label: "KYC/KYB workflow",
        detail: "Identidade, endereço, beneficiário final, poderes e risco.",
        progress: 52,
      },
      {
        label: "Sanções e PEP",
        detail: "Checagem inicial e monitoramento contínuo antes de operação.",
        progress: 30,
      },
      {
        label: "Origem de recursos",
        detail: "EDD, evidências financeiras e justificativa de aprovação.",
        progress: 26,
      },
    ],
    records: [
      {
        ref: "KYC-INV-001",
        name: "Investidor varejo BR",
        owner: "Compliance",
        state: "EDD",
        due: "24h",
        risk: "alto",
      },
      {
        ref: "KYB-OWN-004",
        name: "Proprietário PJ",
        owner: "Compliance",
        state: "Beneficiário final",
        due: "48h",
        risk: "médio",
      },
      {
        ref: "AML-WALLET",
        name: "Wallet screening",
        owner: "AML",
        state: "Sem provedor",
        due: "a definir",
        risk: "alto",
      },
      {
        ref: "PEP-MON",
        name: "Monitoramento PEP",
        owner: "Compliance",
        state: "Planejado",
        due: "ago 2026",
        risk: "médio",
      },
    ],
    evidence: [
      "Documento de identidade e prova de vida",
      "Comprovante de endereço e residência fiscal",
      "Beneficiário final e poderes de representação",
      "Resultado de sanções, PEP e adverse media",
    ],
    blockers: [
      "Usuário sancionado ou PEP sem EDD",
      "KYB sem beneficiário final",
      "Aporte sem origem de recursos",
      "Cripto sem wallet screening",
    ],
    automations: [
      "Reabrir KYC quando documento expirar",
      "Aplicar EDD por risco, país e valor",
      "Bloquear operação quando houver match de sanções",
    ],
  },
  "escrow-reconciliation": {
    key: "escrow-reconciliation",
    path: "/admin/escrow-reconciliation",
    title: "Payments, Escrow & Reconciliation",
    menuTitle: "Escrow & Reconciliação",
    subtitle:
      "Pagamentos, escrow, condições precedentes, liberação, devolução, disputa e conciliação.",
    icon: Landmark,
    operationalNote:
      "A plataforma não deve custodiar recursos sem validação jurídica, financeira e parceiro licenciado. Este módulo desenha os gates e a conciliação.",
    stats: [
      {
        label: "Fluxos",
        value: "7",
        change: "compra, locação, token, escrow e repasse",
        icon: Landmark,
      },
      {
        label: "Estados de pagamento",
        value: "13",
        change: "iniciado até conciliado",
        icon: WalletCards,
        accent: "skyblue",
      },
      { label: "Condições", value: "18", change: "precedentes de liberação", icon: ClipboardCheck },
      {
        label: "Custódia própria",
        value: "0",
        change: "bloqueada pelo PDF",
        icon: LockKeyhole,
        accent: "skyblue",
      },
    ],
    workQueue: [
      {
        title: "Fluxo de compra com escrow externo",
        meta: "Sinal, saldo, escritura, registro e liberação condicionada",
        status: "Parceiro necessário",
        statusVariant: "warn",
        risk: "alto",
      },
      {
        title: "Repasse de rendimentos tokenizados",
        meta: "Receita, retenção, taxa, distribuição e relatório do investidor",
        status: "Planejado",
        statusVariant: "blue",
        risk: "médio",
      },
      {
        title: "Compra com criptoativos",
        meta: "AML, volatilidade, conversão, parceiro VASP e registro contábil",
        status: "Bloqueado",
        statusVariant: "warn",
        risk: "crítico",
      },
    ],
    controls: [
      {
        label: "Estados de escrow",
        detail: "Iniciado, pago, em escrow, condição pendente, liberado, devolvido, disputa.",
        progress: 55,
      },
      {
        label: "Conciliação financeira",
        detail: "Pagamento, taxa, repasse, retenção, disputa e comprovante.",
        progress: 36,
      },
      {
        label: "Parceiros licenciados",
        detail: "Pagamentos, escrow, custódia, câmbio, cripto e relatórios.",
        progress: 14,
      },
    ],
    records: [
      {
        ref: "ESC-SALE",
        name: "Compra tradicional",
        owner: "Finance",
        state: "Desenho",
        due: "jul 2026",
        risk: "alto",
      },
      {
        ref: "ESC-LEASE",
        name: "Locação e garantia",
        owner: "Finance",
        state: "Rascunho",
        due: "ago 2026",
        risk: "médio",
      },
      {
        ref: "ESC-TOKEN",
        name: "Distribuição tokenizada",
        owner: "Investimentos",
        state: "Bloqueado",
        due: "a definir",
        risk: "alto",
      },
      {
        ref: "ESC-CRYPTO",
        name: "Compra com cripto",
        owner: "Compliance",
        state: "Indisponível",
        due: "a definir",
        risk: "crítico",
      },
    ],
    evidence: [
      "Comprovante de pagamento",
      "Condições precedentes atendidas",
      "Autorização de liberação",
      "Recibo, nota, retenções e conciliação",
    ],
    blockers: [
      "Custódia própria sem licença",
      "Liberação sem condição precedente cumprida",
      "Cripto sem AML e parceiro VASP",
      "Repasse sem relatório e conciliação",
    ],
    automations: [
      "Bloquear liberação se gate jurídico estiver pendente",
      "Reconciliar pagamentos por contrato e ativo",
      "Alertar divergência entre valor esperado e recebido",
    ],
  },
  "audit-evidence": {
    key: "audit-evidence",
    path: "/admin/audit-evidence",
    title: "Audit & Evidence Service",
    menuTitle: "Audit & Evidence",
    subtitle:
      "Eventos append-only, cadeia de custódia, exportação de evidências e trilha de auditoria.",
    icon: Archive,
    operationalNote:
      "Eventos críticos não devem ser apagados. O serviço organiza quem fez, quando, com qual regra, qual evidência e qual resultado.",
    stats: [
      { label: "Eventos críticos", value: "14", change: "modelo append-only", icon: Archive },
      {
        label: "Cadeias",
        value: "6",
        change: "contrato, token, pagamento, KYC, vault e rule pack",
        icon: Database,
        accent: "skyblue",
      },
      { label: "Exports", value: "0", change: "sem evidência real ainda", icon: FileCheck2 },
      {
        label: "Exclusões permitidas",
        value: "0",
        change: "retention-first",
        icon: LockKeyhole,
        accent: "skyblue",
      },
    ],
    workQueue: [
      {
        title: "Modelo append-only para eventos de contrato",
        meta: "Criado, revisado, aprovado, assinado, substituído, legal hold",
        status: "Em desenho",
        statusVariant: "blue",
        risk: "médio",
      },
      {
        title: "Pacote de exportação de evidências",
        meta: "Linha do tempo, arquivos, hashes, decisões e usuários",
        status: "Planejado",
        statusVariant: "muted",
        risk: "médio",
      },
      {
        title: "Bloqueio de deleção de evento crítico",
        meta: "Eventos de assinatura, pagamento, AML, decisão e vault",
        status: "Obrigatório",
        statusVariant: "warn",
        risk: "alto",
      },
    ],
    controls: [
      {
        label: "Modelo append-only",
        detail: "Eventos críticos só podem receber anexos ou correções referenciadas.",
        progress: 49,
      },
      {
        label: "Cadeia de custódia",
        detail: "Origem, hash, acesso, transformação, assinatura e exportação.",
        progress: 32,
      },
      {
        label: "Export legal pack",
        detail: "Dossiê por ativo, contrato, investidor, pagamento ou disputa.",
        progress: 22,
      },
    ],
    records: [
      {
        ref: "AUD-CONTRACT",
        name: "Eventos de contrato",
        owner: "Legal",
        state: "Modelado",
        due: "jul 2026",
        risk: "médio",
      },
      {
        ref: "AUD-TOKEN",
        name: "Eventos de token",
        owner: "Investimentos",
        state: "Bloqueado",
        due: "ago 2026",
        risk: "alto",
      },
      {
        ref: "AUD-PAY",
        name: "Eventos financeiros",
        owner: "Finance",
        state: "Planejado",
        due: "ago 2026",
        risk: "alto",
      },
      {
        ref: "AUD-AML",
        name: "Eventos AML",
        owner: "Compliance",
        state: "Obrigatório",
        due: "jul 2026",
        risk: "alto",
      },
    ],
    evidence: [
      "Timestamp, actor, role e IP",
      "Rule pack e decisão aplicada",
      "Hash dos documentos envolvidos",
      "Exportação assinada do dossiê",
    ],
    blockers: [
      "Alteração direta de evento crítico",
      "Export sem hash ou linha do tempo",
      "Decisão sem regra e evidência",
      "Acesso sensível sem propósito registrado",
    ],
    automations: [
      "Gerar linha do tempo por ativo",
      "Montar dossiê de disputa ou auditoria",
      "Alertar evento crítico sem evidência anexada",
    ],
  },
};

export function LegalTechModuleDashboard({ moduleKey }: { moduleKey: LegalTechModuleKey }) {
  const module = legalTechModules[moduleKey];
  const Icon = module.icon;

  return (
    <>
      <PageHeader title={module.title} subtitle={module.subtitle}>
        <Link
          to="/admin/legal-compliance"
          className="flex items-center gap-2 rounded-full border border-glass-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          <Scale className="h-4 w-4" />
          Cockpit
        </Link>
        <button
          type="button"
          onClick={() =>
            toast.info("Registro salvo ficará disponível quando o schema LegalTech for aprovado.")
          }
          className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          <Icon className="h-4 w-4" />
          Novo registro
        </button>
      </PageHeader>

      <div className="mb-6 rounded-2xl border border-dashed border-skyblue/35 bg-skyblue/10 p-4 text-sm text-muted-foreground">
        <span className="font-semibold text-skyblue">Modo infraestrutura:</span>{" "}
        {module.operationalNote}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {module.stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <SectionTitle title="Fila de trabalho" action={<DemoDataBadge />} />
          <div className="space-y-3">
            {module.workQueue.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-glass-border bg-glass-fill p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-sm font-semibold">{item.title}</div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {item.meta}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge variant={item.statusVariant}>{item.status}</Badge>
                    <Badge variant={item.risk === "crítico" ? "warn" : "muted"}>{item.risk}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Controles obrigatórios"
            action={<ShieldCheck className="h-4 w-4 text-emerald" />}
          />
          <div className="space-y-4">
            {module.controls.map((control) => (
              <div key={control.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{control.label}</div>
                    <div className="text-xs text-muted-foreground">{control.detail}</div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {control.progress}%
                  </span>
                </div>
                <Progress value={control.progress} className="bg-muted" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Registros operacionais</h2>
            <p className="text-xs text-muted-foreground">
              Estrutura de registros prevista pelo documento. Persistência real depende do schema e
              RLS.
            </p>
          </div>
          <Badge variant="muted">Blueprint</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border bg-secondary/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3 font-medium">Ref</th>
                <th className="px-6 py-3 font-medium">Registro</th>
                <th className="px-6 py-3 font-medium">Responsável</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Prazo</th>
                <th className="px-6 py-3 font-medium">Risco</th>
              </tr>
            </thead>
            <tbody>
              {module.records.map((row) => (
                <tr
                  key={row.ref}
                  className="border-b border-border last:border-0 hover:bg-secondary/30"
                >
                  <td className="px-6 py-4 font-mono text-xs">{row.ref}</td>
                  <td className="px-6 py-4 font-medium">{row.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{row.owner}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        row.state === "Bloqueado" || row.state === "Indisponível" ? "warn" : "blue"
                      }
                    >
                      {row.state}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{row.due}</td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={row.risk === "crítico" || row.risk === "alto" ? "warn" : "muted"}
                    >
                      {row.risk}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <ChecklistCard
          title="Evidências exigidas"
          icon={FileCheck2}
          items={module.evidence}
          variant="emerald"
        />
        <ChecklistCard
          title="Bloqueios hard-stop"
          icon={AlertTriangle}
          items={module.blockers}
          variant="warn"
        />
        <ChecklistCard
          title="Próximas automações"
          icon={Database}
          items={module.automations}
          variant="blue"
        />
      </div>
    </>
  );
}

function ChecklistCard({
  title,
  icon: Icon,
  items,
  variant,
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
  variant: BadgeVariant;
}) {
  return (
    <Card>
      <SectionTitle title={title} action={<Icon className="h-4 w-4 text-emerald" />} />
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-2xl border border-glass-border bg-glass-fill p-3"
          >
            <Badge variant={variant}>{variant === "warn" ? "stop" : "req"}</Badge>
            <span className="text-sm text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
