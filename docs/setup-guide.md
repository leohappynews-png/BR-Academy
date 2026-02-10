# BR Academy - Guia de Configuracao

## Pre-requisitos

- n8n instalado (self-hosted ou n8n.cloud)
- Conta Google (para Sheets, Calendar, Gmail)
- WhatsApp Business API (Meta Business Suite)
- Conta Stripe (para pagamentos)
- Conta OpenAI (para o agente AI de vendas)
- (Opcional) Conta Lovable + Supabase

---

## Passo 1: Criar as Google Sheets

Siga as instrucoes em `google-sheets-templates/sheets-structure.md` para criar as 3 planilhas.

Anote os IDs:
- `GOOGLE_SHEET_LEADS_ID` = _________________
- `GOOGLE_SHEET_ENROLLMENT_ID` = _________________
- `GOOGLE_SHEET_FINANCIAL_ID` = _________________

---

## Passo 2: Configurar Credenciais no n8n

### Google Sheets / Gmail / Calendar
1. Acesse Google Cloud Console -> APIs & Services -> Credentials
2. Crie um OAuth 2.0 Client ID
3. Habilite as APIs: Google Sheets API, Gmail API, Google Calendar API
4. No n8n, va em Settings -> Credentials -> New -> Google Sheets OAuth2
5. Conecte usando o Client ID e Client Secret
6. Repita para Gmail e Google Calendar

### WhatsApp Business API
1. Acesse Meta Business Suite -> WhatsApp -> Getting Started
2. Crie um app no Meta Developers
3. Obtenha o Phone Number ID e Access Token
4. No n8n, crie uma credencial HTTP Header Auth com:
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_ACCESS_TOKEN`

### WhatsApp Templates
Crie os seguintes templates no Meta Business:
- `br_academy_welcome` - Mensagem de boas-vindas (parametro: nome)
- `br_academy_course_reminder` - Lembrete de curso
- `br_academy_certificate` - Envio de certificado

### Stripe
1. Acesse Stripe Dashboard -> Developers -> API Keys
2. No n8n, va em Credentials -> New -> Stripe API
3. Cole a Secret Key
4. Configure o webhook do Stripe para apontar para: `https://seu-n8n.com/webhook/br-academy-enroll`

### OpenAI
1. Acesse platform.openai.com -> API Keys
2. Crie uma nova key
3. No n8n, va em Credentials -> New -> OpenAI API
4. Cole a API Key

---

## Passo 3: Variaveis de Ambiente no n8n

Va em Settings -> Variables e configure:

| Variavel | Valor | Descricao |
|----------|-------|-----------|
| `GOOGLE_SHEET_LEADS_ID` | (ID da sheet) | Sheet de leads |
| `GOOGLE_SHEET_ENROLLMENT_ID` | (ID da sheet) | Sheet de matriculas |
| `GOOGLE_SHEET_FINANCIAL_ID` | (ID da sheet) | Sheet financeiro |
| `GOOGLE_CALENDAR_ID` | (email do calendar) | Calendario do Google |
| `WHATSAPP_PHONE_ID` | (Phone Number ID) | WhatsApp Business |
| `INSTAGRAM_BUSINESS_ID` | (Business Account ID) | Instagram Business |
| `BR_ACADEMY_ADMIN_EMAIL` | email@bracademy.ie | Email do admin |

---

## Passo 4: Importar Workflows

No n8n:
1. Va em Workflows -> Import from File
2. Importe na ordem:
   - `01-lead-capture.json`
   - `02-lead-pipeline.json`
   - `03-sales-agent.json`
   - `04-enrollment.json`
   - `05-course-operations.json`
   - `06-financial-tracking.json`
3. Em cada workflow, atualize as credenciais (clique nos nodes com icone de chave)

---

## Passo 5: Personalizar

### Endereco do Curso
Nos workflows 04 e 05, substitua `[ENDERECO DO CURSO]` e `[ENDERECO]` pelo endereco real.

### Precos
No workflow 03 (Sales Agent), o prompt do AI ja contem os precos. Atualize se necessario:
- Preco cheio: EUR 250
- Early bird: EUR 199

### Mensagens
Revise e personalize as mensagens em `docs/message-templates.md`.

### Templates WhatsApp
Adapte os templates de mensagens do WhatsApp Business para usar templates aprovados pelo Meta quando necessario (mensagens fora da janela de 24h precisam usar templates).

---

## Passo 6: Testar

### Teste de Lead Capture
```bash
curl -X POST https://seu-n8n.com/webhook/br-academy-lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Silva",
    "email": "teste@email.com",
    "phone": "+353891234567",
    "source": "website",
    "nationality": "Brazilian",
    "visa_type": "stamp 1G",
    "english_level": "intermediate",
    "preferred_date": "2026-03-15",
    "message": "Quero saber mais sobre o curso!"
  }'
```

### Teste do Sales Agent
```bash
curl -X POST https://seu-n8n.com/webhook/br-academy-chat \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "BR-20260210-XXXXXX",
    "message": "Quanto custa o curso?"
  }'
```

### Teste de Enrollment
```bash
curl -X POST https://seu-n8n.com/webhook/br-academy-enroll \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "BR-20260210-XXXXXX",
    "name": "Teste Silva",
    "email": "teste@email.com",
    "phone": "+353891234567",
    "amount": 199,
    "payment_method": "revolut",
    "payment_status": "paid",
    "course_date": "2026-03-15",
    "course_type": "weekend"
  }'
```

---

## Passo 7: Ativar

1. Ative os workflows na ordem (01 -> 06)
2. Verifique os schedules (horarios dos triggers)
3. Monitore as primeiras execucoes em Executions
4. Ajuste conforme necessario

---

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| Webhook nao recebe dados | Verifique se o workflow esta ativo e a URL esta correta |
| Google Sheets "Permission denied" | Reconecte as credenciais OAuth |
| WhatsApp "Template not found" | Crie os templates no Meta Business e aguarde aprovacao |
| AI Agent responde em ingles | Verifique o system prompt no workflow 03 |
| Emails nao enviam | Verifique limites do Gmail (500/dia) e credenciais |
| Stripe webhook nao funciona | Verifique se o endpoint esta correto no Stripe Dashboard |
