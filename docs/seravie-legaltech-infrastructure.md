# Seravie Heritage LegalTech Infrastructure

Fonte adaptada: `Seravie Heritage LegalTech Infrastructure.pdf`, recebido em 2026-07-19.

Este documento transforma o PDF em direção de produto para o repositório. Ele não é parecer jurídico, não libera operação regulada e não substitui revisão de advogados, compliance officers, DPOs, auditores ou parceiros licenciados.

## Regra mestre

A Seravie Heritage não deve afirmar que garante conformidade jurídica por conta própria. O software deve operacionalizar regras aprovadas por responsáveis jurídicos e regulatórios, preservar evidências, bloquear operações sem enquadramento registrado e exigir revisão humana em fluxos de alto risco.

Nenhum texto produzido por IA pode ser tratado como parecer jurídico definitivo. Contratos, ofertas, termos de investimento, documentos de tokenização, compra, venda ou locação só podem avançar para assinatura quando estiverem juridicamente aprovados.

## Diagnóstico do estado atual

O projeto já possui:

- Stack TanStack, Vite, Cloudflare Worker e Supabase.
- Autenticação Supabase com papéis `admin`, `owner`, `tenant` e `investor`.
- Painéis de imóveis, contratos, pagamentos, investidores, portfolio, logs, CMS e permissões.
- CMS público para páginas institucionais e blog.
- Primeira matriz de permissões de abas e funções.
- Rotas de investidor e tokenização ainda tratadas como demonstração em várias telas.

Principais lacunas para a visão LegalTech/RegTech:

- Falta um modelo explícito de jurisdições e pacotes de regras versionados.
- Falta classificação jurídica obrigatória para tokens e produtos fracionados.
- Falta um motor de decisão de compliance com decisão, regra aplicada, versão, evidências e responsável.
- Falta ciclo completo de contratos com estados jurídicos, aprovação e assinatura.
- Falta cofre documental com hash, versionamento, retenção e legal hold.
- Falta matriz de KYC, KYB, AML, sanções, PEP e suitability.
- Falta segregação formal entre dados pessoais, dados operacionais e evidências.
- Falta trilha append-only para eventos críticos.
- Falta integração com provedores externos licenciados para pagamentos, escrow, custódia, KYC, KYB, AML e assinatura.

## Proibições operacionais

O sistema não deve:

- Prometer conformidade garantida.
- Declarar que token é escritura ou propriedade registral.
- Confundir posse de token com propriedade direta do imóvel.
- Lançar oferta tokenizada antes de classificação jurídica aprovada.
- Custodiar recursos ou criptoativos sem análise jurídica, regulatória, financeira e de segurança.
- Criar exchange, mercado secundário ou carteira custodial própria sem validação de licença.
- Armazenar chaves privadas em banco comum.
- Armazenar documentos pessoais em blockchain pública.
- Manter buckets públicos para documentos sensíveis.
- Permitir alteração de contrato assinado.
- Apagar evidências, logs críticos ou documentos sob retenção legal.
- Usar IA como aprovadora jurídica, regulatória ou de suitability.

## Bounded contexts propostos

- **Heritage Legal Cockpit**: visão administrativa de contratos, pareceres, jurisdições, alertas, legal holds e evidências.
- **Jurisdiction Rule Packs**: regras por país, versão, vigência, responsável, regulador, licenças, documentos e restrições.
- **Legal Token Classification**: ficha jurídica obrigatória para cada ativo tokenizado.
- **Heritage Compliance Engine**: motor de decisão antes de operação, oferta, transferência, pagamento ou assinatura.
- **Contract Lifecycle Management**: templates, cláusulas, versões, revisão jurídica, assinatura, vigência e arquivamento.
- **Heritage Legal Vault**: cofre documental com original, normalizado, assinado, hash, provas, anexos, retenção e legal hold.
- **Identity & AML Layer**: KYC, KYB, sanções, PEP, adverse media, wallet screening e monitoramento transacional.
- **Payments & Escrow**: fluxo de pagamento, escrow, liberação, devolução, contestação e conciliação.
- **Tokenization Engine**: emissão, cap table, whitelist, restrições, governança, distribuição e transferência, somente após aprovação.
- **Audit & Evidence Service**: eventos append-only, exportação de evidências e cadeia de custódia.

## Estados mínimos

### Documento ou contrato

- Rascunho
- Gerado automaticamente
- Aguardando revisão
- Em revisão jurídica
- Aprovado juridicamente
- Liberado para assinatura
- Parcialmente assinado
- Integralmente assinado
- Vigente
- Suspenso
- Rescindido
- Expirado
- Substituído
- Arquivado
- Sob retenção legal
- Contestado judicialmente

### Pagamento ou escrow

- Iniciado
- Aguardando pagamento
- Parcialmente pago
- Confirmado
- Em escrow
- Aguardando condição
- Liberado
- Devolvido
- Contestado
- Bloqueado
- Congelado
- Cancelado
- Falhou
- Conciliado

### Decisão de compliance

- Aprovado automaticamente
- Aprovado com condições
- Revisão jurídica obrigatória
- Revisão de compliance obrigatória
- Documentação adicional necessária
- KYC reforçado
- KYB reforçado
- Análise de origem de recursos
- Análise de carteira blockchain
- Aprovação de responsável sênior
- Parceiro licenciado necessário
- Operação indisponível na jurisdição
- Operação bloqueada
- Comunicação obrigatória
- Monitoramento contínuo
- Proibição de divulgação pública

## Compliance gates

1. **Elegibilidade do imóvel**: matrícula, titularidade, ônus, ações, débitos, licenças, ocupantes, avaliação, seguro e documentos do vendedor.
2. **Elegibilidade do proprietário**: identidade, representação, estado civil, poderes, beneficiário final, sanções, PEP e origem do patrimônio.
3. **Elegibilidade jurídica da oferta**: natureza da oferta, público, canal, expectativa de lucro, valores mobiliários, licença, suitability e restrições.
4. **Elegibilidade do investidor**: identidade, capacidade, residência fiscal, qualificação, perfil de risco, limites, origem de recursos, PEP, sanções e aceite documental.
5. **Fechamento**: condições precedentes, pagamentos, escrow, assinaturas, escritura, tributos, registro, emissão de token e trilha de auditoria.
6. **Pós-fechamento**: registro definitivo, rendimentos, retenções, relatórios, seguros, administração, AML contínuo, governança e incidentes.

## Modelo de dados inicial

Não criar migrations sem revisão do esquema atual. Quando a fase de banco começar, priorizar entidades versionadas e auditáveis:

- `jurisdictions`
- `jurisdiction_rule_packs`
- `regulations`
- `regulatory_requirements`
- `legal_opinions`
- `token_projects`
- `token_classifications`
- `compliance_decisions`
- `compliance_evidence`
- `contract_templates`
- `contract_clauses`
- `contract_versions`
- `signature_requests`
- `signature_evidence`
- `vault_documents`
- `retention_policies`
- `legal_holds`
- `kyc_cases`
- `kyb_cases`
- `aml_alerts`
- `sanctions_checks`
- `audit_events`
- `regulatory_reports`

## Fases de implementação

### Fase 1 - Diagnóstico

Entregáveis:

- Mapa de riscos regulatórios, financeiros, imobiliários, privacy e segurança.
- Atividades reguladas e atividades que exigem terceiros licenciados.
- Lista de decisões jurídicas pendentes.
- Primeiro cockpit administrativo sem liberação operacional.

### Fase 2 - Arquitetura

Entregáveis:

- Bounded contexts.
- Fluxos por operação.
- Threat model.
- Desenho de integrações externas.
- Estrutura de pastas e contratos de domínio.

### Fase 3 - Modelo jurídico operacional

Entregáveis:

- Matriz regulatória por jurisdição.
- Compliance gates.
- Workflow de aprovação.
- Estados de documentos, produtos e decisões.

### Fase 4 - Banco de dados

Entregáveis:

- Migrations revisadas.
- Enums, constraints, índices e RLS.
- Triggers de auditoria.
- Seeds sem dados sensíveis.

### Fase 5 - Heritage Legal Vault

Entregáveis:

- Upload seguro.
- Hash, versionamento, legal hold, retenção e auditoria.
- Separação entre original, normalizado, assinado e evidências.

### Fase 6 - Contract Lifecycle Management

Entregáveis:

- Templates e cláusulas.
- Revisão jurídica.
- Aprovação.
- Assinatura.
- Vigência, substituição e arquivamento.

### Fase 7 - Compliance Engine

Entregáveis:

- Regras versionadas.
- Decisões com fundamentos.
- Bloqueios.
- Evidências.
- Revisão humana.

### Fase 8 - Tokenization Engine

Entregáveis:

- Legal Token Classification Record.
- Cap table.
- Whitelist.
- Lock-up.
- Restrições de transferência.
- Distribuição e governança.

### Fase 9 - Testes e segurança

Entregáveis:

- Testes de RLS, isolamento de tenant, auditoria, assinatura, retenção, KYC, AML, pagamentos e reconciliação.
- Simulações de falha, ordem judicial, carteira sancionada, regra expirada, pagamento duplicado e documento alterado.

### Fase 10 - Documentação

Entregáveis:

- Runbooks.
- Onboarding jurídico.
- Onboarding de compliance.
- Onboarding de desenvolvedores.
- Procedimentos de emergência.

## Critérios de aceitação

Nenhuma implementação deve ser considerada pronta enquanto:

- Produto sem classificação jurídica puder ser publicado.
- Contrato sem aprovação puder ser assinado.
- Documento assinado puder ser alterado.
- Documento sensível puder ser visualizado sem auditoria.
- Operação puder existir sem jurisdição.
- Regra puder ser aplicada sem versão.
- Decisão de compliance puder existir sem fundamento.
- Exceção humana puder ser aplicada sem justificativa.
- Emissão puder existir sem documento jurídico vinculado.
- Transferência puder ignorar restrições.
- Backup não puder ser restaurado.
- Dados pessoais forem gravados em blockchain.
- Ambientes não estiverem isolados.
- Dados de teste não forem sintéticos.
- Brasil depender da ativação automática de outras jurisdições.
