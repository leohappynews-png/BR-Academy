# BR Academy - Estrutura das Google Sheets

Voce precisa criar **3 Google Sheets** para o sistema funcionar. Abaixo esta a estrutura de cada uma.

---

## 1. Leads Sheet (`GOOGLE_SHEET_LEADS_ID`)

### Aba: `leads` (gid: 0) - Principal

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| lead_id | String | ID unico (ex: BR-20260210-A3F2K1) |
| name | String | Nome completo |
| email | String | Email |
| phone | String | Telefone com codigo do pais (+353...) |
| source | String | Canal de origem (instagram/facebook/whatsapp/website/referral) |
| nationality | String | Nacionalidade |
| visa_type | String | Tipo de visto (stamp 1G, stamp 2, etc) |
| english_level | String | Nivel de ingles (basic/intermediate/advanced) |
| preferred_date | String | Data preferida para o curso |
| stage | String | Etapa do funil (new_lead/contacted/qualified/proposal_sent/negotiation/enrolled/pre_course/in_course/completed/alumni/lost) |
| score | Number | Score de qualificacao (0-100) |
| priority | String | Prioridade (low/medium/high) |
| qualification_notes | String | Notas da qualificacao automatica |
| created_at | DateTime | Data de criacao |
| updated_at | DateTime | Ultima atualizacao |
| next_follow_up | DateTime | Proximo follow-up agendado |
| notes | String | Notas e observacoes |
| utm_source | String | UTM source (tracking de campanha) |
| utm_campaign | String | UTM campaign |
| lost_reason | String | Motivo da perda (se aplicavel) |
| referred_by | String | Lead ID de quem indicou |

### Aba: `conversation_history` - Historico de Conversas

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| lead_id | String | ID do lead |
| role | String | Quem enviou (user/assistant) |
| message | String | Conteudo da mensagem |
| channel | String | Canal (whatsapp/email/instagram) |
| timestamp | DateTime | Data/hora |

### Aba: `stage_history` - Historico de Mudancas de Etapa

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| lead_id | String | ID do lead |
| from_stage | String | Etapa anterior |
| to_stage | String | Nova etapa |
| changed_by | String | Quem mudou (system/manual/ai_agent) |
| timestamp | DateTime | Data/hora |
| notes | String | Observacao |

---

## 2. Enrollment Sheet (`GOOGLE_SHEET_ENROLLMENT_ID`)

### Aba: `enrollments` (gid: 0) - Matriculas

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| enrollment_id | String | ID da matricula (ex: ENR-20260210-A3F2K) |
| lead_id | String | ID do lead (referencia) |
| name | String | Nome do aluno |
| email | String | Email |
| phone | String | Telefone |
| course_date | Date | Data do curso |
| course_type | String | Tipo (weekend/evening) |
| amount_paid | Number | Valor pago |
| currency | String | Moeda (EUR) |
| payment_method | String | Metodo (stripe/revolut/pix/cash) |
| payment_id | String | ID do pagamento externo |
| payment_status | String | Status (paid/pending/refunded) |
| enrolled_at | DateTime | Data da matricula |
| status | String | Status (active/cancelled/completed/no_show) |
| certificate_sent | Boolean | Certificado enviado? |
| documents_sent | Boolean | Documentos enviados? |
| feedback_score | Number | Nota do feedback (1-10) |
| feedback_text | String | Texto do feedback |
| attendance | String | Presenca (present/absent/partial) |

### Aba: `courses` - Agenda de Cursos

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| course_id | String | ID do curso |
| date | Date | Data |
| type | String | Tipo (weekend/evening) |
| max_students | Number | Maximo de alunos (15) |
| enrolled_count | Number | Alunos matriculados |
| spots_available | Number | Vagas disponiveis |
| instructor | String | Nome do instrutor |
| location | String | Local |
| status | String | Status (scheduled/full/in_progress/completed/cancelled) |
| notes | String | Observacoes |

---

## 3. Financial Sheet (`GOOGLE_SHEET_FINANCIAL_ID`)

### Aba: `transactions` (gid: 0) - Transacoes

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| date | Date | Data da transacao |
| type | String | Tipo (income/expense) |
| category | String | Categoria (course_enrollment/material/rent/marketing/salary/other) |
| description | String | Descricao |
| amount | Number | Valor |
| currency | String | Moeda |
| payment_method | String | Metodo de pagamento |
| payment_id | String | ID externo |
| enrollment_id | String | ID da matricula (se aplicavel) |
| lead_id | String | ID do lead (se aplicavel) |
| status | String | Status (confirmed/pending/cancelled) |

### Aba: `reports` - Snapshots Diarios

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| report_date | Date | Data do relatorio |
| report_month | String | Mes (YYYY-MM) |
| today_income | Number | Receita do dia |
| monthly_income | Number | Receita mensal acumulada |
| monthly_expenses | Number | Despesas mensais |
| monthly_profit | Number | Lucro mensal |
| monthly_enrollments | Number | Matriculas no mes |
| total_leads | Number | Total de leads |
| new_leads_today | Number | Novos leads no dia |
| enrolled_total | Number | Total matriculados |
| lost_total | Number | Total perdidos |
| conversion_rate | String | Taxa de conversao |

### Aba: `expenses_recurring` - Despesas Fixas

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| description | String | Descricao |
| amount | Number | Valor |
| currency | String | Moeda |
| frequency | String | Frequencia (monthly/weekly/annual) |
| category | String | Categoria |
| auto_record | Boolean | Registrar automaticamente? |
| next_date | Date | Proxima data |

---

## Como Criar

1. Crie 3 novas Google Sheets com os nomes:
   - `BR Academy - Leads`
   - `BR Academy - Matriculas`
   - `BR Academy - Financeiro`

2. Em cada sheet, crie as abas conforme listado acima

3. Na primeira linha de cada aba, coloque os nomes das colunas exatamente como listado

4. Copie os IDs de cada sheet (da URL: `docs.google.com/spreadsheets/d/{ESTE_ID}/...`)

5. Configure as variaveis de ambiente no n8n:
   - `GOOGLE_SHEET_LEADS_ID` = ID da sheet de leads
   - `GOOGLE_SHEET_ENROLLMENT_ID` = ID da sheet de matriculas
   - `GOOGLE_SHEET_FINANCIAL_ID` = ID da sheet financeiro
