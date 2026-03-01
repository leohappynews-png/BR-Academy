# BR Academy - Arquitetura dos Workflows n8n

## A Pergunta Principal: 1 Fluxo ou 6?

**Sao 6 workflows INDEPENDENTES, cada um roda sozinho.**

Eles NAO se chamam entre si como sub-fluxos. A conexao entre eles acontece
atraves do **Google Sheets** que funciona como "banco de dados" compartilhado.

```
 Workflow 01 ----ESCREVE---> [Google Sheets] <---LE---- Workflow 02
 Workflow 03 ----LE/ESCREVE-> [Google Sheets] <---LE---- Workflow 05
 Workflow 04 ----ESCREVE---> [Google Sheets] <---LE---- Workflow 06
```

Cada workflow e ativado por um TRIGGER proprio (webhook ou schedule/cron).
Nenhum workflow chama outro diretamente.

---

## Por que NAO usar sub-fluxos?

| Abordagem | Vantagens | Desvantagens |
|-----------|-----------|--------------|
| **6 workflows independentes (escolhida)** | Simples de entender, testar e debugar separadamente. Se um falhar, os outros continuam. Facil de ativar/desativar partes do sistema. | Nao ha comunicacao em tempo real entre eles. |
| 1 mega-fluxo com tudo | Tudo num lugar so | Impossivel de debugar, manter ou entender. Uma falha derruba tudo. |
| Sub-workflows (Execute Workflow node) | Modular com comunicacao direta | Mais complexo de configurar, dependencias entre workflows, dificil para quem esta comecando |

**Para a BR Academy, 6 independentes e a melhor opcao** porque:
- Voce esta comecando com n8n
- Cada workflow tem responsabilidade clara
- Google Sheets como "banco de dados" e simples e visual
- Voce pode ver e editar dados diretamente na planilha a qualquer momento

---

## Como os 6 Workflows Se Conectam (via Google Sheets)

```
TEMPO REAL (Webhooks)              AGENDADOS (Schedule/Cron)
========================           ========================

Alguem preenche form               A cada 1 hora
        |                                 |
        v                                 v
 [01 Lead Capture]                [02 Lead Pipeline]
        |                                 |
        | ESCREVE na                      | LE leads com
        | Sheet "leads"                   | stage="new_lead"
        | aba "leads"                     | CALCULA score
        |                                 | ATUALIZA score/stage
        v                                 v
 +--[Google Sheets: Leads]--+     +--[Google Sheets: Leads]--+
 | lead_id: BR-2026..       |     | score: 75               |
 | stage: new_lead          |     | stage: qualified         |
 | score: 0                 |     | priority: high           |
 +--------------------------+     +--------------------------+

Alguem manda mensagem              A cada 6 horas
        |                                 |
        v                                 v
  [03 Sales Agent]                [03 Sales Agent - Follow-up]
        |                                 |
        | LE lead + historico             | LE leads com
        | CHAMA OpenAI                    | next_follow_up vencido
        | ESCREVE resposta                | ENVIA mensagem
        | ATUALIZA stage                  | automatica
        v                                 v
 +--[Google Sheets: Leads]--+     +--[WhatsApp API]--+
 | stage: proposal_sent     |
 | historico atualizado      |
 +--------------------------+

Pagamento confirmado               A cada 8 horas
        |                                 |
        v                                 v
   [04 Enrollment]                [05 Course Operations]
        |                                 |
        | ESCREVE em 3 sheets:            | LE todas matriculas
        | - Enrollment (matricula)        | CALCULA dias ate curso
        | - Leads (stage=enrolled)        | ENVIA msg por timeline
        | - Financial (receita)           |
        | CRIA evento Calendar            |
        v                                 v
 +--[3 Google Sheets]--+          +--[WhatsApp/Email]--+
 +--[Google Calendar]---+
                                   Diario 8h / Semanal Seg 9h
                                          |
                                          v
                                  [06 Financial Reports]
                                          |
                                          | LE Financial + Leads
                                          | CALCULA metricas
                                          | ENVIA relatorio
                                          v
                                   +--[Email Admin]--+
```

---

## Cada Workflow em Detalhe

### Workflow 01: Lead Capture
- **Arquivo:** `01-lead-capture.json`
- **Tipo de trigger:** Webhook (tempo real) + Schedule (Instagram a cada 30min)
- **Quando roda:** Toda vez que alguem envia dados pelo formulario/site, OU a cada 30min para checar Instagram
- **O que faz:** Recebe dados -> Formata -> Salva no Sheets -> Envia boas-vindas (WA + Email)
- **Escreve em:** Google Sheets Leads (aba "leads")
- **Le de:** Nada (recebe dados via webhook)

### Workflow 02: Lead Pipeline
- **Arquivo:** `02-lead-pipeline.json`
- **Tipo de trigger:** Schedule (a cada 1 hora) + Schedule (diario)
- **Quando roda:** Automaticamente a cada hora + diariamente
- **O que faz:** Le leads novos -> Calcula score -> Atualiza stage -> Alerta admin se hot lead -> Detecta leads parados
- **Escreve em:** Google Sheets Leads (atualiza score, stage, priority)
- **Le de:** Google Sheets Leads

### Workflow 03: Sales Agent (AI)
- **Arquivo:** `03-sales-agent.json`
- **Tipo de trigger:** Webhook (tempo real) + Schedule (a cada 6h)
- **Quando roda:** Toda vez que lead manda mensagem + check de follow-ups
- **O que faz:** Le contexto do lead -> Monta prompt -> Chama OpenAI -> Envia resposta -> Atualiza stage
- **Escreve em:** Google Sheets Leads (aba "leads" + aba "conversation_history")
- **Le de:** Google Sheets Leads (ambas abas)

### Workflow 04: Enrollment
- **Arquivo:** `04-enrollment.json`
- **Tipo de trigger:** Webhook (manual) + Stripe Trigger (pagamento)
- **Quando roda:** Quando alguem paga ou quando voce registra matricula manualmente
- **O que faz:** Processa pagamento -> Registra matricula -> Registra financeiro -> Envia confirmacoes -> Cria evento no Calendar
- **Escreve em:** 3 Google Sheets (Enrollment, Leads, Financial) + Google Calendar
- **Le de:** Nada (recebe dados via webhook/Stripe)

### Workflow 05: Course Operations
- **Arquivo:** `05-course-operations.json`
- **Tipo de trigger:** Schedule (a cada 8 horas)
- **Quando roda:** 3x por dia automaticamente
- **O que faz:** Le matriculas -> Calcula dias ate o curso -> Envia mensagem certa para cada momento
- **Escreve em:** Google Sheets Leads (atualiza stage para pre_course/in_course/completed/alumni)
- **Le de:** Google Sheets Enrollment

### Workflow 06: Financial Reports
- **Arquivo:** `06-financial-tracking.json`
- **Tipo de trigger:** Schedule (diario 8h + semanal segunda 9h)
- **Quando roda:** Todo dia e toda segunda
- **O que faz:** Le dados financeiros + leads -> Calcula metricas -> Envia relatorio por email
- **Escreve em:** Google Sheets Financial (aba "reports" - snapshot)
- **Le de:** Google Sheets Financial + Google Sheets Leads

### Workflow 10: Certificate Generator
- **Arquivo:** `10-certificate-generator.json`
- **Tipo de trigger:** Schedule (a cada 4 horas)
- **Quando roda:** 6x por dia automaticamente
- **O que faz:** Le matriculas -> Filtra alunos que concluiram sem certificado -> Copia template Google Slides -> Substitui placeholders ({{full name}}, {{date}}, {{certificate id}}) -> Exporta PDF -> Envia por email -> Marca certificate_sent=true -> Apaga copia temporaria
- **Escreve em:** Google Sheets Enrollment (atualiza certificate_sent)
- **Le de:** Google Sheets Enrollment
- **APIs extras:** Google Slides API (batchUpdate), Google Drive API (copy, export, delete)

---

## Passo a Passo: Como Importar no n8n

### Opcao A: n8n Desktop / Self-hosted

1. Abra o n8n no navegador (geralmente `http://localhost:5678`)
2. No menu lateral, clique em **"Workflows"**
3. Clique no botao **"+"** (novo workflow) no canto superior direito
4. Isso abre um workflow vazio. NAO precisa fazer nada aqui ainda.
5. Clique nos **3 pontinhos (...)** no canto superior direito do canvas
6. Clique em **"Import from File..."**
7. Selecione o arquivo `01-lead-capture.json`
8. Os nodes vao aparecer no canvas automaticamente
9. Clique em **"Save"** (Ctrl+S)
10. **REPITA** os passos 3-9 para cada um dos 6 arquivos JSON

### Opcao B: n8n Cloud

1. Acesse `https://app.n8n.cloud`
2. No dashboard, clique em **"Add workflow"**
3. No editor que abrir, clique nos **3 pontinhos** (menu)
4. Selecione **"Import from File"**
5. Escolha o arquivo JSON
6. Salve
7. Repita para os 6 arquivos

### Opcao C: Copiar e Colar (mais rapido)

1. Abra o arquivo JSON no seu computador (ex: com VS Code ou Notepad)
2. Selecione **TODO** o conteudo (Ctrl+A) e copie (Ctrl+C)
3. No n8n, crie um novo workflow
4. No canvas vazio, pressione **Ctrl+V** (colar)
5. Os nodes aparecem automaticamente
6. Salve (Ctrl+S)

---

## Apos Importar: Configurar Credenciais em Cada Workflow

Depois de importar cada JSON, voce vera nodes com um **triangulo amarelo de aviso**.
Isso significa que as credenciais precisam ser configuradas.

Para CADA workflow:

1. **Clique duas vezes** em cada node que tem o triangulo amarelo
2. No painel que abre, procure o campo **"Credential"** ou **"Credencial"**
3. Clique nele e selecione a credencial que voce criou (Google Sheets, Gmail, etc.)
4. Clique em **"Save"** no node
5. Repita para todos os nodes com aviso

### Mapa de credenciais por workflow:

```
Workflow 01 - Lead Capture:
  - Google Sheets OAuth2  (node: "Google Sheets - Add Lead")
  - Gmail OAuth2          (node: "Gmail - Welcome Email")
  - HTTP Header Auth      (node: "WhatsApp - Welcome Message") [WhatsApp token]

Workflow 02 - Lead Pipeline:
  - Google Sheets OAuth2  (3 nodes que leem/escrevem sheets)
  - Gmail OAuth2          (nodes de alerta e relatorio)
  - HTTP Header Auth      (node: "WhatsApp - Priority Follow-up")

Workflow 03 - Sales Agent:
  - Google Sheets OAuth2  (4 nodes)
  - OpenAI API            (node: "AI Sales Agent")
  - HTTP Header Auth      (2 nodes WhatsApp)

Workflow 04 - Enrollment:
  - Google Sheets OAuth2  (3 nodes - enrollment, leads, financial)
  - Gmail OAuth2          (2 nodes - confirmacao + admin)
  - Google Calendar OAuth2 (node: "Google Calendar - Add Course")
  - Stripe API            (node: "Stripe Trigger")
  - HTTP Header Auth      (node: WhatsApp)

Workflow 05 - Course Operations:
  - Google Sheets OAuth2  (2 nodes)
  - Gmail OAuth2          (2 nodes)
  - HTTP Header Auth      (7 nodes WhatsApp - um para cada momento)

Workflow 10 - Certificate Generator:
  - Google Sheets OAuth2  (2 nodes - leitura e atualizacao de matriculas)
  - Gmail OAuth2          (1 node - envio do certificado com PDF)
  - Google Slides OAuth2  (4 nodes HTTP - copiar template, substituir texto, exportar PDF, deletar copia)

Workflow 06 - Financial Reports:
  - Google Sheets OAuth2  (5 nodes)
  - Gmail OAuth2          (2 nodes)
```

---

## Ordem de Ativacao

**IMPORTANTE:** Ative os workflows nesta ordem:

```
1. Primeiro:  01 Lead Capture       (para comecar a receber leads)
2. Segundo:   02 Lead Pipeline      (para qualificar os leads que entram)
3. Terceiro:  03 Sales Agent        (para conversar com leads qualificados)
4. Quarto:    04 Enrollment         (para processar matriculas)
5. Quinto:    05 Course Operations  (para automatizar comunicacao do curso)
6. Sexto:     06 Financial Reports  (para gerar relatorios)
7. Setimo:    10 Certificate Generator (para gerar e enviar certificados)
```

Para ativar: no editor do workflow, clique no toggle **"Active"** no canto
superior direito. Ele fica verde quando ativo.

---

## Alternativa Futura: Usar Sub-Workflows

Se no futuro voce quiser que um workflow chame outro diretamente (sem depender
do Sheets como intermediario), o n8n tem o node **"Execute Workflow"**.

Exemplo de como seria:

```
[01 Lead Capture]
       |
       | --> Execute Workflow --> [02 Lead Pipeline]
       |                                |
       |                                | --> Execute Workflow --> [03 Sales Agent]
```

**Mas NAO recomendo isso agora** porque:
- Adiciona complexidade desnecessaria
- Se o sub-workflow falhar, o workflow pai tambem falha
- Mais dificil de debugar
- A abordagem atual (independentes + Sheets) ja funciona bem

Quando considerar sub-workflows:
- Volume muito alto de leads (100+/dia) onde o delay do Schedule nao e aceitavel
- Quando voce migrar do Google Sheets para um banco de dados real (Supabase/PostgreSQL)
- Quando voce tiver mais experiencia com n8n

---

## Resumo Visual

```
+===========================================================+
|                    SEU n8n DASHBOARD                       |
|                                                           |
|  Workflows:                          Status:              |
|  +------------------------------------+--------+          |
|  | 01 BR Academy - Lead Capture       | ACTIVE |          |
|  | 02 BR Academy - Lead Pipeline      | ACTIVE |          |
|  | 03 BR Academy - Sales Agent (AI)   | ACTIVE |          |
|  | 04 BR Academy - Enrollment         | ACTIVE |          |
|  | 05 BR Academy - Course Operations  | ACTIVE |          |
|  | 06 BR Academy - Financial Reports  | ACTIVE |          |
|  | 10 BR Academy - Certificate Generator| ACTIVE |          |
|  +------------------------------------+--------+          |
|                                                           |
|  Cada um aparece como uma linha separada.                 |
|  Cada um tem seu proprio canvas com nodes.                |
|  Cada um roda independentemente.                          |
|  Eles compartilham dados via Google Sheets.               |
+===========================================================+
```
