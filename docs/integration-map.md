# BR Academy - Mapa de Integracoes

## Visao Geral do Fluxo de Dados

```
 ENTRADA DE LEADS                    PROCESSAMENTO                    SAIDA/ACOES
 ================                    ==============                   ===========

 [Instagram DMs] ----+
                     |
 [Facebook Ads] -----+
                     |
 [WhatsApp] ---------+---> [01 Lead Capture] ---> [Google Sheets: Leads]
                     |          |                        |
 [Website Form] -----+          |                        |
                     |          v                        v
 [Indicacoes] -------+    [WhatsApp Welcome]      [02 Lead Pipeline]
                           [Email Welcome]              |
                                                        |
                                                        v
                                                  [Lead Scoring]
                                                        |
                                            +-----------+-----------+
                                            |                       |
                                       High Priority           Normal
                                            |                       |
                                            v                       v
                                     [WhatsApp Alert]        [Queue for
                                     [Admin Email]            follow-up]
                                            |                       |
                                            +-----------+-----------+
                                                        |
                                                        v
                                                [03 Sales Agent (AI)]
                                                        |
                                          +-------------+-------------+
                                          |             |             |
                                     [WhatsApp    [Update Lead   [Save
                                      Response]    Stage]         History]
                                                        |
                                                        v
                                              [Lead Stage = enrolled?]
                                                        |
                                                   YES  |
                                                        v
                                               [04 Enrollment]
                                                        |
                                      +-----------------+-----------------+
                                      |        |        |        |        |
                                 [Enrollment [Financial [Calendar [WhatsApp [Email
                                  Sheet]     Record]    Event]    Confirm]  Confirm]
                                                                     |
                                                                     v
                                                            [05 Course Ops]
                                                                     |
                                               +-----+-----+-----+-----+-----+
                                               |     |     |     |     |     |
                                             -7d   -2d   -1d   Day   +1d   +7d  +30d
                                               |     |     |     |     |     |     |
                                              WA   WA+   WA    WA    WA    WA    WA
                                                   Email
                                                                     |
                                                                     v
                                                        [10 Certificate Generator]
                                                      (Slides -> PDF -> Email cert)
                                                                     |
                                                                     v
                                                           [06 Financial Reports]
                                                                     |
                                                              +------+------+
                                                              |             |
                                                         [Daily         [Weekly
                                                          Report]        Report]
```

---

## Tabela de Integracoes Detalhada

### Workflow 01: Lead Capture

| De | Para | Metodo | Dados |
|----|------|--------|-------|
| Website/App | n8n Webhook | POST /br-academy-lead | Nome, email, phone, source |
| Instagram API | n8n Schedule | GET /conversations | DMs com keywords |
| n8n | Google Sheets | Append Row | Dados do lead formatados |
| n8n | WhatsApp API | POST /messages | Mensagem de boas-vindas |
| n8n | Gmail API | Send Email | Email de boas-vindas |

### Workflow 02: Lead Pipeline

| De | Para | Metodo | Dados |
|----|------|--------|-------|
| Google Sheets | n8n | Read Rows | Leads com stage=new_lead |
| n8n (Code) | n8n | Internal | Score calculado |
| n8n | Google Sheets | Update Row | Score, stage, priority |
| n8n | WhatsApp API | POST /messages | Follow-up para high priority |
| n8n | Gmail API | Send Email | Alerta para admin |
| n8n (Schedule) | Google Sheets | Read Rows | Check leads parados |
| n8n | Gmail API | Send Email | Relatorio de leads parados |

### Workflow 03: Sales Agent

| De | Para | Metodo | Dados |
|----|------|--------|-------|
| WhatsApp/App | n8n Webhook | POST /br-academy-chat | lead_id, message |
| n8n | Google Sheets | Read Row | Contexto do lead |
| n8n | Google Sheets | Read Rows | Historico de conversas |
| n8n | OpenAI API | Chat Completion | Prompt + contexto |
| n8n | Google Sheets | Append Row | Resposta na history |
| n8n | Google Sheets | Update Row | Stage sugerido |
| n8n | WhatsApp API | POST /messages | Resposta do AI |
| n8n (Schedule) | Google Sheets | Read Rows | Leads para follow-up |
| n8n | WhatsApp API | POST /messages | Follow-up automatico |

### Workflow 04: Enrollment

| De | Para | Metodo | Dados |
|----|------|--------|-------|
| Stripe | n8n Webhook | checkout.session.completed | Pagamento confirmado |
| App/Manual | n8n Webhook | POST /br-academy-enroll | Dados de matricula |
| n8n | Google Sheets (Enrollment) | Append Row | Dados de matricula |
| n8n | Google Sheets (Leads) | Update Row | stage=enrolled |
| n8n | Google Sheets (Financial) | Append Row | Registro financeiro |
| n8n | Gmail API | Send Email | Confirmacao de matricula |
| n8n | WhatsApp API | POST /messages | Confirmacao WhatsApp |
| n8n | Google Calendar | Create Event | Evento do curso |
| n8n | Gmail API | Send Email | Notificacao admin |

### Workflow 05: Course Operations

| De | Para | Metodo | Dados |
|----|------|--------|-------|
| n8n (Schedule) | Google Sheets | Read Rows | Todas as matriculas |
| n8n (Code) | n8n | Internal | Categoriza por timeline |
| n8n | WhatsApp API | POST /messages | Lembretes (7d/2d/1d/dia/+1/+7/+30) |
| n8n | Gmail API | Send Email | Instrucoes pre-curso |
| n8n | Google Sheets (Leads) | Update Row | Atualiza stage |

### Workflow 10: Certificate Generator

| De | Para | Metodo | Dados |
|----|------|--------|-------|
| n8n (Schedule 4h) | Google Sheets | Read Rows | Todas as matriculas |
| n8n (Code) | n8n | Internal | Filtra elegiveis (completed + certificate_sent=false) |
| n8n | Google Drive API | POST /files/{id}/copy | Copia template Google Slides |
| n8n | Google Slides API | POST /presentations/{id}/batchUpdate | Substitui {{full name}}, {{date}}, {{certificate id}} |
| n8n | Google Drive API | GET /files/{id}/export?mimeType=pdf | Exporta apresentacao como PDF |
| n8n | Gmail API | Send Email + Attachment | Envia certificado PDF por email |
| n8n | Google Sheets (Enrollment) | Update Row | Marca certificate_sent=true |
| n8n | Google Drive API | DELETE /files/{id} | Remove copia temporaria |

### Workflow 06: Financial Reports

| De | Para | Metodo | Dados |
|----|------|--------|-------|
| n8n (Schedule Daily) | Google Sheets | Read Rows | Financial + Leads |
| n8n (Code) | n8n | Internal | Calcula metricas |
| n8n | Gmail API | Send Email | Relatorio diario |
| n8n | Google Sheets | Append Row | Snapshot diario |
| n8n (Schedule Weekly) | Google Sheets | Read Rows | Financial + Leads |
| n8n | Gmail API | Send Email | Relatorio semanal |

---

## APIs Externas Utilizadas

| API | Base URL | Auth | Rate Limits |
|-----|----------|------|-------------|
| WhatsApp Cloud API | graph.facebook.com/v18.0 | Bearer Token | 80 msg/s (business) |
| Instagram Graph API | graph.facebook.com/v18.0 | Bearer Token | 200 calls/h |
| Google Sheets API | sheets.googleapis.com/v4 | OAuth 2.0 | 300 req/min |
| Gmail API | gmail.googleapis.com/v1 | OAuth 2.0 | 500 emails/day |
| Google Calendar API | calendar.googleapis.com/v3 | OAuth 2.0 | 1M req/day |
| OpenAI API | api.openai.com/v1 | API Key | Varies by plan |
| Stripe API | api.stripe.com/v1 | API Key | 100 req/s |
| Google Slides API | slides.googleapis.com/v1 | OAuth 2.0 | 300 req/min |
| Google Drive API | www.googleapis.com/drive/v3 | OAuth 2.0 | 12000 req/min |

---

## Webhooks Expostos pelo n8n

| Endpoint | Metodo | Descricao | Workflow |
|----------|--------|-----------|----------|
| `/webhook/br-academy-lead` | POST | Novo lead | 01 |
| `/webhook/br-academy-chat` | POST | Mensagem para AI agent | 03 |
| `/webhook/br-academy-enroll` | POST | Nova matricula | 04 |
