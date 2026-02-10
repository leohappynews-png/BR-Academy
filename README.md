# BR Academy - Sistema de Automacao Completo (n8n + Z-API + AI Agents)

> Primeiro e maior empresa de treinamento de Bar Staffs na Irlanda/Dublin.
> Treinamento pratico e teorico para intercambistas conseguirem empregos em pubs, bares e restaurantes.

## Visao Geral da Arquitetura (v2)

```
     LEAD MANDA MENSAGEM NO WHATSAPP
                  |
                  v
     +--[ 07 Z-API HUB ]--+     <-- Recebe TODAS as mensagens
     |  Parse message      |
     |  Identifica lead    |
     |  Auto-registra novo |
     +----------+----------+
                |
                v
     +--[ 08 AI ROUTER ]----------+
     |  Classifica intencao (AI)  |
     |  Roteia para sub-agente    |
     +---+----+----+----+----+---+
         |    |    |    |    |
         v    v    v    v    v
       Sales Sched Pay  Sup  Alumni   <-- 5 sub-agentes especialistas
       Agent Agent Agent Agent Agent       + Human Escalation
         |    |    |    |    |
         +----+----+----+----+
                  |
                  v
     [Responde via Z-API + Atualiza Sheets]

     ============ WORKFLOWS DE APOIO ============

     [ 01 Lead Capture  ] - Leads de website/Instagram/Facebook
     [ 02 Lead Pipeline ] - Scoring e qualificacao automatica
     [ 04 Enrollment    ] - Matricula + Pagamento + Calendar
     [ 05 Course Ops    ] - Mensagens automaticas do curso
     [ 06 Financial     ] - Relatorios diarios e semanais
```

### Sub-Agentes AI Especialistas

| Agente | Persona | Funcao |
|--------|---------|--------|
| **Ana (Sales)** | Ex-barista brasileira, calorosa | Vender, qualificar, tratar objecoes |
| **Scheduling** | Organizador | Datas, horarios, vagas disponiveis |
| **Payment** | Facilitador | Formas de pagamento, parcelamento, PIX |
| **Support** | Prestativo | Duvidas pre-curso, endereco, o que levar |
| **Alumni** | Motivador | Pos-curso, emprego, indicacoes, upsell |
| **Human Escalation** | -- | Escala para atendente humano |

## Etapas do Funil de Vendas (Lead Stages)

| Stage | Nome | Descricao |
|-------|------|-----------|
| 1 | `new_lead` | Lead acabou de entrar (qualquer canal) |
| 2 | `contacted` | Primeiro contato realizado |
| 3 | `qualified` | Lead qualificado (tem interesse, budget, timing) |
| 4 | `proposal_sent` | Proposta/info do curso enviada |
| 5 | `negotiation` | Em negociacao (duvidas, desconto, datas) |
| 6 | `enrolled` | Matriculado e pagamento confirmado |
| 7 | `pre_course` | Aguardando inicio do curso |
| 8 | `in_course` | Cursando |
| 9 | `completed` | Curso concluido |
| 10 | `alumni` | Ex-aluno (upsell, indicacoes) |
| X | `lost` | Lead perdido (motivo registrado) |

## Estrutura do Projeto

```
BR-Academy/
  n8n-workflows/
    07-zapi-whatsapp-hub.json      # NOVO: Hub central Z-API (recebe/envia WhatsApp)
    08-ai-agent-router.json        # NOVO: Router AI + 5 sub-agentes especialistas
    01-lead-capture.json           # Captura de leads (website/Instagram/Facebook)
    02-lead-pipeline.json          # Pipeline e qualificacao automatica
    03-sales-agent.json            # (LEGADO - substituido pelo 08)
    04-enrollment.json             # Matricula e documentos
    05-course-operations.json      # Operacoes do curso
    06-financial-tracking.json     # Controle financeiro
  google-sheets-templates/
    sheets-structure.md            # Estrutura das planilhas
  lovable-app/
    app-spec.md                    # Especificacao do web app
  docs/
    n8n-architecture-guide.md      # LEIA PRIMEIRO: como os workflows funcionam
    setup-guide.md                 # Guia de configuracao passo a passo
    message-templates.md           # Templates de mensagens
    integration-map.md             # Mapa de integracoes
```

## Integracoes Necessarias (n8n Credentials)

| Servico | Uso | Node n8n |
|---------|-----|----------|
| **Z-API** | **WhatsApp central (envio/recebimento)** | **HTTP Request** |
| **OpenAI GPT-4o** | **Router AI + 5 sub-agentes especialistas** | **OpenAI** |
| Google Sheets | Planilhas de leads, matriculas, financeiro | Google Sheets |
| Instagram API | Captura de leads via DM | HTTP Request |
| Gmail / SMTP | Emails automaticos | Gmail / Send Email |
| Google Calendar | Agenda de cursos | Google Calendar |
| Stripe | Pagamentos | Stripe Trigger |
| Webhook | Entrada de dados externos | Webhook |

## Como Usar

1. **Configure Z-API** - `docs/zapi-setup-guide.md` (WhatsApp + AI agents)
2. **Leia a arquitetura** - `docs/n8n-architecture-guide.md` (como os workflows se conectam)
3. Crie as Google Sheets conforme `google-sheets-templates/sheets-structure.md`
4. Configure credenciais no n8n (veja `docs/setup-guide.md`)
5. Ative na ordem: **07 (Z-API Hub) -> 08 (AI Router) -> 01 -> 02 -> 04 -> 05 -> 06**
6. Mande "Oi" no WhatsApp e teste a conversa com a Ana (AI)
7. Opcional: Deploy do Lovable app conforme `lovable-app/app-spec.md`
