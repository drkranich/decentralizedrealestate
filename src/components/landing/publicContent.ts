export type PublicPageDefaults = {
  key: string;
  path: string;
  menuTitle: string;
  defaults: {
    title: string;
    subtitle: string;
    body: string;
  };
};

export type PublicPageStatus = "published" | "archived" | "deleted";

export const publicPageStatusLabels: Record<PublicPageStatus, string> = {
  published: "Publicada",
  archived: "Arquivada",
  deleted: "Excluída",
};

export type BlogPost = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  body: string;
  published: boolean;
};

export const publicPageDefaults: PublicPageDefaults[] = [
  {
    key: "about",
    path: "/about",
    menuTitle: "Sobre",
    defaults: {
      title: "Sobre",
      subtitle: "Infraestrutura global para ativos imobiliários reais.",
      body: `A Seravie Heritage conecta proprietários, investidores e empreendedores em um ecossistema imobiliário global para comprar, vender, investir, administrar e tokenizar ativos reais.

## O que nos diferencia
- Compra e venda de imóveis tradicionais
- Propriedade fracionada por ativos tokenizados
- Mercado secundário para participações imobiliárias
- Gestão patrimonial, documentação e inteligência de mercado`,
    },
  },
  {
    key: "api",
    path: "/api",
    menuTitle: "API",
    defaults: {
      title: "API",
      subtitle: "Integração para parceiros, operadores e módulos imobiliários.",
      body: `A plataforma é construída sobre dados reais de imóveis, contratos, usuários, pagamentos e participações. A API permite estruturar integrações para parceiros conforme o estágio operacional de cada projeto.

## Acesso para parceiros
Ainda não abrimos um programa self-service de chaves públicas. Para integração comercial, fale com [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "docs",
    path: "/docs",
    menuTitle: "Documentação",
    defaults: {
      title: "Documentação",
      subtitle: "Guias vivos sobre a infraestrutura Seravie Heritage.",
      body: `Esta documentação descreve os módulos públicos e operacionais da plataforma.

## Módulos
- Heritage Marketplace: compra e venda de imóveis
- Heritage Token: tokenização de ativos reais
- Heritage Invest: investimento em frações imobiliárias
- Heritage Exchange: mercado secundário de participações
- Heritage Registry: documentação e histórico digital dos ativos`,
    },
  },
  {
    key: "legaltech_infrastructure",
    path: "/legaltech-infrastructure",
    menuTitle: "LegalTech Infrastructure",
    defaults: {
      title: "LegalTech Infrastructure",
      subtitle:
        "A camada jurídica, regulatória, documental e de auditoria desenhada para ativos imobiliários globais.",
      body: `A Seravie Heritage não deve operar como uma imobiliária comum com uma camada superficial de blockchain. A visão correta é uma infraestrutura global que une Real Estate, LegalTech, RegTech, Contract Lifecycle Management, Digital Asset Management, Identity Verification, Compliance, Document Custody e Tokenized Asset Administration.

Esta infraestrutura não promete conformidade jurídica automática. Ela existe para operacionalizar regras aprovadas por responsáveis jurídicos e regulatórios, preservar evidências, bloquear operações sem enquadramento registrado e exigir revisão humana sempre que uma decisão depender de análise externa.

## Princípios
- Nenhum token deve ser tratado automaticamente como propriedade registral de um imóvel
- Nenhuma oferta tokenizada deve ser publicada sem classificação jurídica aprovada
- Nenhum contrato deve ser assinado sem aprovação jurídica
- Nenhum documento assinado deve ser sobrescrito
- Nenhuma decisão de compliance deve existir sem regra, versão, evidência e fundamento
- Nenhuma operação deve avançar sem jurisdição definida

## Módulos estruturantes
- Heritage Legal & Compliance Cockpit
- Jurisdiction Rule Packs
- Legal Token Classification Record
- Heritage Compliance Engine
- Compliance Gates
- Contract Lifecycle Management
- Heritage Legal Vault
- KYC, KYB, AML e Sanctions Layer
- Payments, Escrow e Reconciliation
- Tokenization Engine
- Audit & Evidence Service

## Portões de aprovação
- Elegibilidade do imóvel
- Elegibilidade do proprietário
- Elegibilidade jurídica da oferta
- Elegibilidade do investidor
- Fechamento
- Pós-fechamento

## Jurisdições
A primeira implementação operacional deve priorizar o Brasil. Outras jurisdições podem existir como pacotes configuráveis, mas devem permanecer bloqueadas para operação comercial até receberem análise jurídica local, matriz regulatória, contratos locais, avaliação tributária, parceiros licenciados e regras de KYC, KYB, AML, assinatura, proteção de dados e registro imobiliário.

## Inteligência artificial
A IA pode auxiliar na extração de campos, classificação de documentos, comparação de versões, organização de evidências e sugestão de riscos. A IA não pode aprovar contrato, emitir parecer definitivo, liberar operação regulada, classificar definitivamente token, dispensar licença, ocultar incerteza ou inventar legislação.

## Direção de implementação
A implantação deve seguir fases: diagnóstico, arquitetura, modelo jurídico operacional, banco de dados, Legal Vault, Contract Lifecycle Management, Compliance Engine, Tokenization Engine, testes de segurança e documentação operacional.`,
    },
  },
  {
    key: "sdks",
    path: "/sdks",
    menuTitle: "SDKs",
    defaults: {
      title: "SDKs",
      subtitle: "Estado atual dos pacotes de integração.",
      body: `Ainda não há um pacote público instalável para integração self-service. As integrações acontecem caso a caso, com suporte técnico e comercial.

Se o seu produto precisa trocar dados com imóveis, leads, contratos, participações ou documentação, fale com [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "webhooks",
    path: "/webhooks",
    menuTitle: "Webhooks",
    defaults: {
      title: "Webhooks",
      subtitle: "Automação de eventos entre a Seravie e sistemas parceiros.",
      body: `Os webhooks conectam eventos da plataforma a sistemas externos.

## Eventos previstos
- Novo lead recebido
- Contrato criado ou atualizado
- Pagamento registrado
- Documento enviado
- Participação negociada no mercado secundário`,
    },
  },
  {
    key: "status",
    path: "/status",
    menuTitle: "Status",
    defaults: {
      title: "Status",
      subtitle: "Disponibilidade da infraestrutura.",
      body: `A Seravie Heritage roda sobre infraestrutura Cloudflare e Supabase.

## Fontes externas
- Aplicação e edge: [Cloudflare Status](https://www.cloudflarestatus.com)
- Banco, autenticação e storage: [Supabase Status](https://status.supabase.com)

Para incidentes específicos da conta, escreva para [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "changelog",
    path: "/changelog",
    menuTitle: "Changelog",
    defaults: {
      title: "Changelog",
      subtitle: "Atualizações reais da plataforma.",
      body: `## 19 jul 2026
- Página pública reposicionada como Seravie Heritage
- Hero com imagem de fundo editável pelo CMS
- Painel vivo de descoberta com abas de cidade, país, tipo de imóvel e investimento

## 18 jul 2026
- Ajustes de autenticação para recarregamento direto em rotas protegidas
- Painéis operacionais conectados ao Supabase`,
    },
  },
  {
    key: "careers",
    path: "/careers",
    menuTitle: "Carreiras",
    defaults: {
      title: "Carreiras",
      subtitle: "Não temos vagas abertas no momento.",
      body: `No momento não há processo seletivo ativo. Para deixar contato para oportunidades futuras em produto, engenharia, operações imobiliárias ou parcerias, escreva para [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "press",
    path: "/press",
    menuTitle: "Imprensa",
    defaults: {
      title: "Imprensa",
      subtitle: "Kit de marca e contato para jornalistas.",
      body: `A Seravie Heritage é uma plataforma global para ativos imobiliários e propriedade digital.

## Contato
Para entrevistas, materiais institucionais ou imagens em alta resolução, escreva para [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "investor_relations",
    path: "/investor-relations",
    menuTitle: "Relações com investidores",
    defaults: {
      title: "Relações com investidores",
      subtitle: "Para parceiros estratégicos e investidores institucionais.",
      body: `Esta página é sobre investir na Seravie Heritage como empresa e infraestrutura, não sobre comprar frações de imóveis dentro da plataforma.

Investidores institucionais, fundos e parceiros estratégicos podem escrever para [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "white_label",
    path: "/white-label",
    menuTitle: "White-label",
    defaults: {
      title: "White-label",
      subtitle: "Infraestrutura imobiliária com marca própria.",
      body: `A plataforma já suporta configuração global de marca, logo, favicon e imagem pública de capa.

## Próximas camadas comerciais
- Domínio próprio
- Identidade visual dedicada
- Ambientes para parceiros
- Operação internacional por mercado`,
    },
  },
  {
    key: "pricing",
    path: "/pricing",
    menuTitle: "Planos",
    defaults: {
      title: "Planos",
      subtitle: "Modelos comerciais para proprietários, investidores e parceiros.",
      body: `Os valores variam conforme mercado, volume de ativos, módulos contratados e nível de operação.

## Estruturas possíveis
- Marketplace de imóveis
- Tokenização de ativos
- Gestão patrimonial
- Mercado secundário
- Operação white-label

Para proposta comercial, fale com [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "terms",
    path: "/terms",
    menuTitle: "Termos",
    defaults: {
      title: "Termos de uso",
      subtitle: "Última atualização: julho de 2026.",
      body: `Este é um modelo institucional inicial e não substitui aconselhamento jurídico.

## Objeto
A Seravie Heritage conecta usuários para compra, venda, gestão, investimento e tokenização de ativos imobiliários reais.

## Cadastro
O uso da plataforma exige informações verdadeiras e responsabilidade sobre dados, documentos e imagens enviados.

## Contato
Dúvidas sobre estes termos: [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "privacy",
    path: "/privacy",
    menuTitle: "Privacidade",
    defaults: {
      title: "Política de privacidade",
      subtitle: "Última atualização: julho de 2026.",
      body: `Este é um modelo inicial de política de privacidade e deve ser revisado juridicamente conforme os países de operação.

## Dados tratados
- Dados de cadastro
- Dados de imóveis e contratos
- Documentos enviados à plataforma
- Preferências de interface e idioma

## Direitos
Solicitações de acesso, correção ou exclusão podem ser enviadas para [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
  {
    key: "cookies",
    path: "/cookies",
    menuTitle: "Cookies",
    defaults: {
      title: "Política de cookies",
      subtitle: "Cookies essenciais e preferências de interface.",
      body: `Usamos armazenamento local e cookies essenciais para login, sessão e preferências de interface.

## Preferências
O tema claro ou escuro pode ser salvo no navegador. Limpar os dados locais pode exigir novo login.`,
    },
  },
  {
    key: "compliance",
    path: "/compliance",
    menuTitle: "Compliance",
    defaults: {
      title: "Compliance",
      subtitle: "Dados, acesso e histórico operacional.",
      body: `A plataforma usa controle de acesso por papéis, histórico de alterações e políticas de acesso aos dados.

## Segurança operacional
- Acesso por perfil de usuário
- Registro de atividade administrativa
- Buckets de mídia com políticas próprias
- Documentação digital dos ativos`,
    },
  },
  {
    key: "licenses",
    path: "/licenses",
    menuTitle: "Licenças",
    defaults: {
      title: "Licenças",
      subtitle: "Principais tecnologias utilizadas na plataforma.",
      body: `A Seravie Heritage usa tecnologias modernas de código aberto e serviços de infraestrutura em nuvem.

## Base técnica
- React
- TanStack Router
- Vite
- Tailwind CSS
- Supabase
- Cloudflare Workers`,
    },
  },
  {
    key: "security",
    path: "/security",
    menuTitle: "Segurança",
    defaults: {
      title: "Segurança",
      subtitle: "Medidas reais em produção.",
      body: `## Camadas de segurança
- HTTPS/TLS via Cloudflare
- Autenticação gerenciada
- Regras de acesso por perfil
- Storage com políticas próprias
- Log de atividade administrativa

Para divulgação responsável, escreva para [contato@decentralizedrealestate.com](mailto:contato@decentralizedrealestate.com).`,
    },
  },
];

export const defaultBlogPosts: BlogPost[] = [
  {
    id: "seravie-heritage-platform",
    title: "Seravie Heritage: patrimônio imobiliário para a era digital",
    date: "19 jul 2026",
    excerpt:
      "A página pública passa a apresentar a Seravie como plataforma global para ativos reais e propriedade digital.",
    body: `A Seravie Heritage nasce para conectar proprietários, investidores e empreendedores em um ecossistema imobiliário global.

## O que muda
- Compra e venda de imóveis tradicionais
- Tokenização de ativos reais
- Investimento em frações imobiliárias
- Mercado secundário para participações`,
    published: true,
  },
];

export function getPublicPageDefaults(key: string) {
  return publicPageDefaults.find((page) => page.key === key) ?? publicPageDefaults[0];
}

export function getPublicPageStatus(data: { status?: string }): PublicPageStatus {
  if (data.status === "archived" || data.status === "deleted") return data.status;
  return "published";
}

export function parseBlogPosts(raw: string | undefined): BlogPost[] {
  if (!raw) return defaultBlogPosts;
  try {
    const parsed = JSON.parse(raw) as Partial<BlogPost>[];
    const normalized = parsed
      .filter((post) => post.title && post.body)
      .map((post, index) => ({
        id: post.id || `post-${index + 1}`,
        title: post.title || "Sem título",
        date: post.date || "",
        excerpt: post.excerpt || "",
        body: post.body || "",
        published: post.published !== false,
      }));
    return normalized.length ? normalized : defaultBlogPosts;
  } catch {
    return defaultBlogPosts;
  }
}

export function serializeBlogPosts(posts: BlogPost[]) {
  return JSON.stringify(posts, null, 2);
}
