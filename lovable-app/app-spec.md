# BR Academy - Lovable Web App Specification

## Visao Geral

Web app complementar ao sistema n8n para gerenciamento visual do CRM, dashboard de metricas e interface para o time da BR Academy.

**Stack sugerida para Lovable:** React + Supabase (backend) + Tailwind CSS

---

## Telas e Funcionalidades

### 1. Dashboard Principal (`/`)

Visao geral em tempo real do negocio.

**Cards superiores:**
- Total de Leads (este mes)
- Matriculas (este mes)
- Receita (este mes) em EUR
- Taxa de Conversao (%)

**Grafico: Funil de Vendas**
- Barra horizontal mostrando quantidade em cada etapa
- new_lead -> contacted -> qualified -> proposal_sent -> negotiation -> enrolled

**Grafico: Receita por Semana**
- Line chart com receita semanal dos ultimos 3 meses

**Grafico: Leads por Canal**
- Pie chart (Instagram, Facebook, WhatsApp, Website, Referral)

**Lista: Proximas Turmas**
- Data, tipo, vagas disponiveis, alunos matriculados

---

### 2. CRM / Leads (`/leads`)

Kanban board com as etapas do funil.

**Colunas do Kanban:**
- New Lead | Contacted | Qualified | Proposal Sent | Negotiation | Enrolled

**Card do Lead:**
- Nome, foto (se disponivel)
- Score (badge colorido)
- Fonte (icone)
- Ultimo contato (tempo relativo)
- Telefone (click to WhatsApp)

**Acoes no Card:**
- Mover entre etapas (drag & drop)
- Abrir detalhes
- Enviar mensagem rapida (WhatsApp)
- Registrar nota
- Marcar como perdido

**Detalhes do Lead (modal/drawer):**
- Todas as informacoes do lead
- Historico de conversas (timeline)
- Historico de mudancas de etapa
- Notas
- Acoes: enviar mensagem, agendar follow-up, matricular

---

### 3. Matriculas (`/enrollments`)

Tabela com todos os alunos matriculados.

**Colunas:**
- Nome, Email, Data do Curso, Tipo, Valor, Status Pagamento, Certificado

**Filtros:**
- Por data, por status, por tipo de curso

**Acoes:**
- Ver detalhes
- Enviar certificado
- Registrar presenca
- Cancelar matricula

---

### 4. Agenda (`/calendar`)

Calendario visual dos cursos.

**Visao mensal** com:
- Cursos agendados (cor por tipo: weekend/evening)
- Numero de vagas em cada curso
- Clique para ver detalhes e lista de alunos

**Criar novo curso:**
- Data, tipo, instrutor, local, max alunos

---

### 5. Financeiro (`/finance`)

**Resumo:**
- Receita total, Despesas, Lucro (periodo selecionavel)

**Tabela de Transacoes:**
- Data, Tipo, Categoria, Descricao, Valor
- Filtros por periodo, tipo, categoria

**Graficos:**
- Receita vs Despesa (mensal)
- Receita por categoria
- Projecao (baseada em media dos ultimos 3 meses)

**Adicionar transacao manual:**
- Tipo, categoria, valor, descricao, data

---

### 6. Mensagens (`/messages`)

Interface para visualizar e enviar mensagens.

**Lista de conversas** (estilo WhatsApp):
- Leads com mensagens recentes
- Badge de nao lidas
- Preview da ultima mensagem

**Chat:**
- Historico completo
- Campo para enviar mensagem
- Templates rapidos (dropdown)
- Indicador de canal (WhatsApp/Email)

---

### 7. Configuracoes (`/settings`)

- Dados da empresa
- Templates de mensagens
- Configuracao de precos
- Integracoes (status das APIs)
- Usuarios e permissoes

---

## Integracao com n8n

O Lovable app se comunica com o n8n via webhooks:

### Endpoints que o app consome (n8n -> app):

```
GET  /webhook/br-academy-leads          -> Lista de leads
GET  /webhook/br-academy-lead/:id       -> Detalhes do lead
POST /webhook/br-academy-lead           -> Criar lead
PUT  /webhook/br-academy-lead/:id       -> Atualizar lead
POST /webhook/br-academy-enroll         -> Criar matricula
GET  /webhook/br-academy-enrollments    -> Lista de matriculas
GET  /webhook/br-academy-financial      -> Dados financeiros
POST /webhook/br-academy-message        -> Enviar mensagem
GET  /webhook/br-academy-conversations  -> Historico de conversas
```

### Alternativa: Supabase direto

Em vez de passar tudo por n8n, o app pode ler/escrever diretamente no Supabase e o n8n sincroniza com Google Sheets via trigger.

**Tabelas Supabase (espelhando as Google Sheets):**
- `leads`
- `conversation_history`
- `enrollments`
- `courses`
- `transactions`

**Vantagens:**
- Mais rapido (sem intermediario)
- Real-time updates via Supabase subscriptions
- Melhor UX no app

**Sincronizacao n8n <-> Supabase:**
- Workflow dedicado que sincroniza Supabase com Google Sheets a cada 5 min
- Ou usar Supabase como fonte unica e n8n le de la

---

## Prompt para Lovable

Copie e cole este prompt no Lovable para gerar o app base:

```
Crie um CRM web app para a BR Academy, uma empresa de treinamento de Bar Staff
em Dublin, Irlanda. O app precisa de:

1. Dashboard com KPIs (leads, matriculas, receita, conversao), graficos de funil
   de vendas, receita semanal, leads por canal, e proximas turmas

2. Pagina de Leads com Kanban board (colunas: New Lead, Contacted, Qualified,
   Proposal Sent, Negotiation, Enrolled) com drag & drop, cards mostrando nome,
   score, fonte e ultimo contato

3. Pagina de Matriculas com tabela filtravel (nome, email, data curso, tipo,
   valor, status pagamento, certificado)

4. Pagina de Agenda com calendario mensal mostrando cursos agendados

5. Pagina Financeira com receita/despesa/lucro, tabela de transacoes e graficos

6. Pagina de Mensagens estilo chat com lista de conversas e historico

Use Supabase como backend, React com Tailwind CSS.
Esquema de cores: azul escuro (#1a1a2e) como primaria, dourado (#e2b659) como
accent, fundo claro.
Design moderno e profissional. Mobile responsive.
```

---

## Variaveis de Ambiente do App

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_N8N_WEBHOOK_BASE_URL=https://your-n8n.com/webhook
VITE_WHATSAPP_DEEPLINK=https://wa.me/
```
