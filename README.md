# BR Academy - Sistema de Automacao Completo (n8n)

> Primeiro e maior empresa de treinamento de Bar Staffs na Irlanda/Dublin.
> Treinamento pratico e teorico para intercambistas conseguirem empregos em pubs, bares e restaurantes.

## Visao Geral da Arquitetura

```
                         +-----------------------+
                         |   FONTES DE LEADS     |
                         | Instagram / Facebook  |
                         | WhatsApp / Website    |
                         | Indicacoes / Eventos  |
                         +-----------+-----------+
                                     |
                                     v
                    +----------------+----------------+
                    |  WORKFLOW 1: LEAD CAPTURE       |
                    |  Webhook + Formulario + Redes   |
                    +----------------+----------------+
                                     |
                                     v
                    +----------------+----------------+
                    |  WORKFLOW 2: LEAD PIPELINE      |
                    |  Qualificacao + Score + Stages  |
                    +----------------+----------------+
                                     |
                                     v
                    +----------------+----------------+
                    |  WORKFLOW 3: SALES AGENT (AI)   |
                    |  Follow-up + Mensagens + Conv.  |
                    +----------------+----------------+
                                     |
                                     v
                    +----------------+----------------+
                    |  WORKFLOW 4: ENROLLMENT         |
                    |  Matricula + Pagamento + Docs   |
                    +----------------+----------------+
                                     |
                                     v
                    +----------------+----------------+
                    |  WORKFLOW 5: COURSE OPS         |
                    |  Pre/Dia/Pos Curso + Agenda     |
                    +----------------+----------------+
                                     |
                                     v
                    +----------------+----------------+
                    |  WORKFLOW 6: FINANCIAL          |
                    |  Controle + Relatorios          |
                    +----------------+----------------+
                                     |
                                     v
                    +----------------+----------------+
                    |  LOVABLE WEB APP (opcional)     |
                    |  Dashboard + CRM + Relatorios   |
                    +----------------+----------------+
```

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
    01-lead-capture.json           # Captura de leads multicanal
    02-lead-pipeline.json          # Pipeline e qualificacao
    03-sales-agent.json            # Agente AI de vendas
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
| Google Sheets | Planilhas de leads, matriculas, financeiro | Google Sheets |
| WhatsApp Business API | Mensagens automaticas | HTTP Request / WhatsApp Business Cloud |
| Instagram API | Captura de leads via DM | HTTP Request |
| Gmail / SMTP | Emails automaticos | Gmail / Send Email |
| Google Calendar | Agenda de cursos | Google Calendar |
| Stripe / PayPal | Pagamentos | Stripe / HTTP Request |
| OpenAI / Claude | Agente AI de vendas | OpenAI / HTTP Request |
| Webhook | Entrada de dados externos | Webhook |

## Como Usar

1. **Leia a arquitetura** - `docs/n8n-architecture-guide.md` (explica se e 1 fluxo ou 6, como se conectam, etc)
2. Crie as Google Sheets conforme `google-sheets-templates/sheets-structure.md`
3. Configure as credenciais no n8n (veja `docs/setup-guide.md`)
4. Importe cada workflow JSON no n8n (sao 6 workflows independentes, veja o guia)
5. Configure as credenciais em cada node com triangulo amarelo
6. Ative os workflows na ordem (01 -> 06)
7. Teste com os comandos curl do setup-guide.md
8. Opcional: Deploy do Lovable app conforme `lovable-app/app-spec.md`
