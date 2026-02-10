# BR Academy - Guia de Setup Z-API + Agentes AI

## O que mudou (v2)

A versao 2 centraliza TUDO no WhatsApp via Z-API e adiciona agentes AI especialistas.

### Antes (v1):
```
Lead chega -> Webhook -> Salva -> Manda msg (1 agente generico)
```

### Agora (v2):
```
Lead manda msg no WhatsApp
        |
        v
  [Z-API recebe] --> [Hub processa] --> [Router AI classifica intencao]
        |                                        |
        v                              +---------+---------+
  [Auto-registra                       |    |    |    |    |
   se novo lead]              Sales  Sched Pay  Supp Alumni Human
                              Agent  Agent Agent Agent Agent Escal.
                                |
                                v
                        [Responde via Z-API]
                        [Atualiza Sheets]
                        [Agenda follow-up]
```

---

## Passo 1: Criar Conta Z-API

1. Acesse https://z-api.io e crie uma conta
2. Crie uma **nova instancia** (plano recomendado: Professional)
3. Conecte seu numero de WhatsApp Business escaneando o QR Code
4. Anote:
   - **Instance ID**: ex: `3C8A1B2E3F...`
   - **Token**: ex: `A1B2C3D4E5...`
   - **Client-Token** (Security Token): ex: `F6G7H8I9...`

## Passo 2: Configurar Webhook na Z-API

No painel da Z-API:
1. Va em **Webhooks** na sua instancia
2. Configure o **Webhook de Recepcao**:
   - URL: `https://n8n.srv1031906.hstgr.cloud/webhook/br-academy-zapi-webhook`
   - Eventos: Marque **ReceivedCallback** (mensagens recebidas)
3. Salve

Agora toda mensagem recebida no WhatsApp sera enviada para o n8n.

## Passo 3: Variaveis de Ambiente no n8n

Adicione estas variaveis em Settings -> Variables:

| Variavel | Valor | Descricao |
|----------|-------|-----------|
| `ZAPI_INSTANCE_ID` | (seu instance id) | ID da instancia Z-API |
| `ZAPI_TOKEN` | (seu token) | Token da instancia |
| `ZAPI_CLIENT_TOKEN` | (seu security token) | Client-Token para auth |
| `N8N_WEBHOOK_BASE_URL` | `https://n8n.srv1031906.hstgr.cloud` | URL base do n8n (sem / no final) |
| `BR_ACADEMY_ADMIN_PHONE` | `353891234567` | WhatsApp do admin (sem +) |

## Passo 4: Ordem de Ativacao (v2)

```
1. Workflow 07 - Z-API WhatsApp Hub    (PRIMEIRO - e a porta de entrada)
2. Workflow 08 - AI Agent Router       (SEGUNDO - processa as mensagens)
3. Workflow 01 - Lead Capture          (recebe leads de outros canais)
4. Workflow 02 - Lead Pipeline         (qualifica e pontua)
5. Workflow 04 - Enrollment            (processa matriculas)
6. Workflow 05 - Course Operations     (mensagens automaticas do curso)
7. Workflow 06 - Financial Reports     (relatorios)
```

Nota: O workflow 03 (Sales Agent antigo) pode ser DESATIVADO - o novo
workflow 08 assume todas as funcoes de vendas com sub-agentes.

---

## Arquitetura dos Agentes AI

### Fluxo de uma mensagem:

```
1. WhatsApp msg chega -> Z-API webhook -> Workflow 07 (Hub)
2. Hub identifica se lead e novo ou existente
3. Se novo: auto-registra no Sheets com dados basicos
4. Salva mensagem no historico
5. Envia para Workflow 08 (AI Router) via HTTP
6. Router usa GPT-4o-mini para classificar intencao (rapido e barato)
7. Router direciona para o sub-agente correto
8. Sub-agente (GPT-4o) gera resposta especializada
9. Resposta e enviada de volta via Z-API
10. Sheets sao atualizados (stage, score, historico, follow-up)
```

### Sub-Agentes Especialistas:

| Agente | Persona | Quando Ativa | Modelo |
|--------|---------|--------------|--------|
| **Sales Agent (Ana)** | Closer calorosa, ex-barista | Leads novos, perguntas sobre curso, precos | GPT-4o |
| **Scheduling Agent** | Organizador | Perguntas sobre datas, horarios | GPT-4o |
| **Payment Agent** | Facilitador financeiro | Como pagar, parcelamento, comprovante | GPT-4o |
| **Support Agent** | Ajudante pre-curso | Alunos matriculados, o que levar, endereco | GPT-4o-mini |
| **Alumni Agent** | Motivador pos-curso | Ex-alunos, dicas emprego, upsell | GPT-4o-mini |
| **Human Escalation** | -- | Reclamacoes, baixa confianca do AI | -- |
| **Redirect Agent** | -- | Assuntos nao relacionados | -- |

### Custo estimado (OpenAI):
- Router (classifier): ~$0.001/msg (GPT-4o-mini, 200 tokens)
- Sub-agente: ~$0.005/msg (GPT-4o, 600 tokens)
- **Total: ~$0.006/msg = ~$6 para 1000 mensagens**

---

## Teste Rapido

Apos ativar os workflows 07 e 08:

1. Mande uma mensagem para o numero do WhatsApp conectado na Z-API
2. Escreva: "Oi, quero saber sobre o curso de bar"
3. A resposta deve vir automaticamente em poucos segundos
4. Verifique no Google Sheets se o lead foi registrado
5. Verifique no n8n Executions se os workflows rodaram

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| Nao recebe mensagens | Verifique webhook na Z-API, teste com Z-API test tool |
| "URL rejected" | Verifique N8N_WEBHOOK_BASE_URL (sem / no final) |
| Resposta demora muito | Verifique logs do OpenAI, pode ser rate limit |
| Lead duplicado | Normal se phone veio em formato diferente. Normalize |
| Admin nao recebe escalacao | Verifique BR_ACADEMY_ADMIN_PHONE |
