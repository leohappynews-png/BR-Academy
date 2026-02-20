# Time de Agentes Claude — Guia Prático para BR Academy

> Como construir um time de agentes inteligentes que trabalham juntos para automatizar vendas, suporte, análise financeira e operações da sua academia.

## Visão Geral da Arquitetura

```
                    ┌─────────────────────────┐
                    │   MENSAGEM DO CLIENTE    │
                    │  (WhatsApp / Web / Email) │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   ANA — COORDENADORA    │
                    │   (Agente Orquestrador)  │
                    │                         │
                    │  Classifica a intenção   │
                    │  e delega para o agente  │
                    │  especialista correto    │
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
┌─────────▼────────┐ ┌─────────▼────────┐ ┌─────────▼────────┐
│  AGENTE VENDAS   │ │ AGENTE SUPORTE   │ │ AGENTE FINANCEIRO│
│                  │ │                  │ │                  │
│ • Qualificação   │ │ • Dúvidas curso  │ │ • Relatórios     │
│ • Follow-up      │ │ • Reagendamento  │ │ • Análise receita│
│ • Fechamento     │ │ • Problemas      │ │ • Previsões      │
│ • Upsell alumni  │ │ • Pós-curso      │ │ • Inadimplência  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   AGENTE QUALIDADE      │
                    │                         │
                    │  Revisa todas as         │
                    │  respostas antes de      │
                    │  enviar ao cliente       │
                    └─────────────────────────┘
```

## O Que Cada Agente Faz

### 1. Ana — Coordenadora (Orquestradora)
- **Papel**: Recebe todas as mensagens e classifica a intenção
- **Decide**: Qual agente especialista deve responder
- **Mantém**: Contexto da conversa entre agentes
- **Escala**: Para humano quando necessário

### 2. Agente de Vendas
- **Qualifica** leads com perguntas inteligentes
- **Personaliza** a abordagem baseado no perfil (intercambista, residente, etc.)
- **Negocia** preços e condições (presencial €150 / online €34)
- **Faz follow-up** automático com leads frios
- **Upsell** para alumni (cursos avançados, certificações)

### 3. Agente de Suporte
- **Responde** dúvidas sobre cursos, horários, localização
- **Reagenda** aulas quando necessário
- **Resolve** problemas de pagamento
- **Envia** materiais pré-curso
- **Coleta** feedback pós-curso

### 4. Agente Financeiro
- **Gera** relatórios diários/semanais automaticamente
- **Analisa** tendências de receita e despesas
- **Identifica** inadimplência e sugere ações
- **Prevê** receita futura baseado no pipeline
- **Monitora** métricas: ticket médio, taxa de conversão, churn

### 5. Agente de Qualidade
- **Revisa** todas as respostas dos outros agentes antes do envio
- **Garante** tom profissional e empático
- **Verifica** se informações de preço/horário estão corretas
- **Bloqueia** respostas inadequadas

---

## Implementação Prática

### Pré-requisitos

```bash
pip install anthropic claude-agent-sdk
```

Defina sua chave de API:

```bash
export ANTHROPIC_API_KEY="sua-chave-aqui"
```

---

### Exemplo 1: Time de Agentes com Claude API (Controle Total)

Este exemplo usa a Claude API diretamente com tool use para máximo controle:

```python
import anthropic
import json
from datetime import datetime

client = anthropic.Anthropic()

# ============================================================
# FERRAMENTAS DOS AGENTES
# ============================================================

tools_coordenadora = [
    {
        "name": "classificar_intencao",
        "description": "Classifica a intenção da mensagem do cliente",
        "input_schema": {
            "type": "object",
            "properties": {
                "mensagem": {"type": "string", "description": "Mensagem do cliente"},
                "categoria": {
                    "type": "string",
                    "enum": ["vendas", "suporte", "financeiro", "outro"],
                    "description": "Categoria identificada"
                },
                "urgencia": {
                    "type": "string",
                    "enum": ["baixa", "media", "alta"],
                    "description": "Nível de urgência"
                },
                "contexto": {"type": "string", "description": "Contexto relevante extraído"}
            },
            "required": ["mensagem", "categoria", "urgencia"],
            "additionalProperties": False
        }
    }
]

tools_vendas = [
    {
        "name": "consultar_lead",
        "description": "Consulta informações de um lead no banco de dados",
        "input_schema": {
            "type": "object",
            "properties": {
                "telefone": {"type": "string", "description": "Telefone do lead"},
                "email": {"type": "string", "description": "Email do lead"}
            },
            "required": [],
            "additionalProperties": False
        }
    },
    {
        "name": "registrar_interacao",
        "description": "Registra a interação com o lead",
        "input_schema": {
            "type": "object",
            "properties": {
                "lead_id": {"type": "string"},
                "tipo": {"type": "string", "enum": ["primeiro_contato", "follow_up", "negociacao", "fechamento"]},
                "notas": {"type": "string"},
                "proximo_passo": {"type": "string"}
            },
            "required": ["lead_id", "tipo", "notas"],
            "additionalProperties": False
        }
    },
    {
        "name": "enviar_proposta",
        "description": "Envia proposta personalizada ao lead",
        "input_schema": {
            "type": "object",
            "properties": {
                "lead_id": {"type": "string"},
                "curso": {"type": "string", "enum": ["presencial_weekend", "presencial_evening", "online"]},
                "preco": {"type": "number"},
                "desconto_percentual": {"type": "number"}
            },
            "required": ["lead_id", "curso", "preco"],
            "additionalProperties": False
        }
    }
]

tools_financeiro = [
    {
        "name": "gerar_relatorio",
        "description": "Gera relatório financeiro do período",
        "input_schema": {
            "type": "object",
            "properties": {
                "tipo": {"type": "string", "enum": ["diario", "semanal", "mensal"]},
                "metricas": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Métricas: receita, despesas, lucro, conversao, ticket_medio"
                }
            },
            "required": ["tipo", "metricas"],
            "additionalProperties": False
        }
    },
    {
        "name": "analisar_inadimplencia",
        "description": "Analisa alunos com pagamento pendente",
        "input_schema": {
            "type": "object",
            "properties": {
                "dias_atraso_minimo": {"type": "integer"}
            },
            "required": ["dias_atraso_minimo"],
            "additionalProperties": False
        }
    }
]


# ============================================================
# SYSTEM PROMPTS ESPECIALIZADOS
# ============================================================

PROMPT_COORDENADORA = """Você é Ana, a coordenadora da BR Academy Dublin.
Sua função é receber mensagens de clientes e classificar a intenção para
direcionar ao agente especialista correto.

Regras:
- Mensagens sobre preços, cursos disponíveis, inscrição → VENDAS
- Mensagens sobre dúvidas de alunos, problemas, reagendamento → SUPORTE
- Mensagens sobre pagamento, recibos, relatórios → FINANCEIRO
- Se não conseguir classificar → peça mais informações ao cliente
- Se detectar urgência alta → sinalize para atendimento humano

Contexto da empresa:
- Bar Staff Training Academy em Dublin, Irlanda
- Cursos: Weekend (€150), Evening (€150), Online (€34)
- Público: intercambistas brasileiros em Dublin
"""

PROMPT_VENDAS = """Você é o agente de vendas da BR Academy Dublin.
Seu objetivo é converter leads em alunos matriculados.

Estratégia:
1. QUALIFICAR: Descubra se é intercambista, há quanto tempo está em Dublin,
   se tem experiência em bar
2. APRESENTAR: Mostre o curso mais adequado ao perfil
3. URGÊNCIA: Mencione que turmas são limitadas (máx 15 alunos)
4. OBJEÇÕES: Trate objeções com empatia e dados
5. FECHAR: Sempre termine com um call-to-action claro

Cursos disponíveis:
- Weekend Presencial: €150 (sáb-dom, 2 dias intensivos)
- Evening Presencial: €150 (seg-qua-sex, 1 semana)
- Online: €34 (autoditada, com certificado)

Tom: Amigável, profissional, em português brasileiro.
NUNCA invente informações. Se não souber, diga que vai confirmar.
"""

PROMPT_SUPORTE = """Você é o agente de suporte da BR Academy Dublin.
Seu objetivo é resolver dúvidas e problemas dos alunos.

Prioridades:
1. Resolver o problema na primeira mensagem quando possível
2. Ser empático — muitos alunos são intercambistas longe de casa
3. Escalar para humano se: problema de pagamento > €50, reclamação grave,
   pedido de reembolso

Informações úteis:
- Endereço: Dublin city centre (enviar localização exata quando solicitado)
- Horários: Weekend 9h-17h, Evening 18h-21h
- Material pré-curso enviado 3 dias antes por WhatsApp
- Certificado enviado 7 dias após conclusão
"""

PROMPT_FINANCEIRO = """Você é o agente financeiro da BR Academy Dublin.
Seu objetivo é analisar dados financeiros e gerar insights acionáveis.

Capacidades:
1. Gerar relatórios diários/semanais/mensais
2. Analisar tendências de receita
3. Identificar inadimplência
4. Calcular métricas: taxa de conversão, ticket médio, LTV
5. Prever receita futura baseado no pipeline atual

Formato dos relatórios:
- Sempre inclua comparação com período anterior
- Destaque variações > 10% (positivas ou negativas)
- Termine com 3 recomendações acionáveis
"""

PROMPT_QUALIDADE = """Você é o agente de qualidade da BR Academy Dublin.
Sua função é revisar respostas dos outros agentes ANTES do envio ao cliente.

Checklist de revisão:
1. TOM: Está profissional e empático? Está em português brasileiro?
2. PRECISÃO: Preços, horários e informações estão corretos?
3. COMPLETUDE: A resposta resolve a dúvida do cliente?
4. SEGURANÇA: Não contém dados sensíveis ou promessas indevidas?
5. CTA: Tem um próximo passo claro para o cliente?

Se a resposta passar em todos os critérios, aprove.
Se não, reescreva a resposta corrigida.
"""


# ============================================================
# CLASSE DO TIME DE AGENTES
# ============================================================

class TimeDeAgentes:
    """Orquestra um time de agentes especializados da BR Academy."""

    def __init__(self):
        self.client = anthropic.Anthropic()
        self.historico = []

    def _chamar_agente(self, system_prompt, mensagem, tools=None):
        """Chama um agente individual e retorna a resposta."""
        params = {
            "model": "claude-opus-4-6",
            "max_tokens": 2048,
            "system": system_prompt,
            "messages": [{"role": "user", "content": mensagem}],
        }
        if tools:
            params["tools"] = tools

        response = self.client.messages.create(**params)
        return response

    def coordenadora(self, mensagem_cliente):
        """Ana classifica a intenção e direciona ao agente correto."""
        print(f"\n{'='*60}")
        print(f"📩 MENSAGEM RECEBIDA: {mensagem_cliente}")
        print(f"{'='*60}")

        response = self._chamar_agente(
            PROMPT_COORDENADORA,
            f"Classifique esta mensagem e direcione: '{mensagem_cliente}'",
            tools=tools_coordenadora
        )

        # Extrair a classificação
        for block in response.content:
            if block.type == "tool_use" and block.name == "classificar_intencao":
                categoria = block.input.get("categoria", "outro")
                urgencia = block.input.get("urgencia", "media")
                print(f"\n🏷️  CLASSIFICAÇÃO: {categoria.upper()} | Urgência: {urgencia}")
                return categoria, urgencia
            elif block.type == "text":
                print(f"\n💬 Ana: {block.text}")

        return "outro", "media"

    def agente_vendas(self, mensagem, contexto=""):
        """Agente especialista em vendas."""
        print(f"\n💰 AGENTE VENDAS ativado")
        prompt = f"Contexto: {contexto}\n\nMensagem do cliente: {mensagem}"

        response = self._chamar_agente(PROMPT_VENDAS, prompt, tools=tools_vendas)

        resposta_texto = ""
        for block in response.content:
            if block.type == "text":
                resposta_texto += block.text
            elif block.type == "tool_use":
                print(f"   🔧 Ferramenta usada: {block.name}({json.dumps(block.input, ensure_ascii=False)})")

        return resposta_texto

    def agente_suporte(self, mensagem, contexto=""):
        """Agente especialista em suporte."""
        print(f"\n🎧 AGENTE SUPORTE ativado")
        prompt = f"Contexto: {contexto}\n\nMensagem do aluno: {mensagem}"

        response = self._chamar_agente(PROMPT_SUPORTE, prompt)

        return next((b.text for b in response.content if b.type == "text"), "")

    def agente_financeiro(self, mensagem, contexto=""):
        """Agente especialista em finanças."""
        print(f"\n📊 AGENTE FINANCEIRO ativado")
        prompt = f"Contexto: {contexto}\n\nSolicitação: {mensagem}"

        response = self._chamar_agente(
            PROMPT_FINANCEIRO, prompt, tools=tools_financeiro
        )

        resposta_texto = ""
        for block in response.content:
            if block.type == "text":
                resposta_texto += block.text
            elif block.type == "tool_use":
                print(f"   🔧 Ferramenta usada: {block.name}({json.dumps(block.input, ensure_ascii=False)})")

        return resposta_texto

    def agente_qualidade(self, resposta_original, mensagem_cliente):
        """Revisa a resposta antes de enviar ao cliente."""
        print(f"\n✅ AGENTE QUALIDADE revisando...")

        prompt = f"""Revise esta resposta que será enviada ao cliente.

Mensagem original do cliente: "{mensagem_cliente}"

Resposta do agente para revisar:
---
{resposta_original}
---

Se estiver boa, responda com "APROVADO:" seguido da resposta.
Se precisar de ajustes, responda com "CORRIGIDO:" seguido da versão melhorada."""

        response = self._chamar_agente(PROMPT_QUALIDADE, prompt)
        resultado = next((b.text for b in response.content if b.type == "text"), "")

        if resultado.startswith("APROVADO:"):
            print("   ✅ Resposta APROVADA")
            return resultado.replace("APROVADO:", "").strip()
        elif resultado.startswith("CORRIGIDO:"):
            print("   ✏️  Resposta CORRIGIDA pelo agente de qualidade")
            return resultado.replace("CORRIGIDO:", "").strip()

        return resultado

    def processar_mensagem(self, mensagem_cliente):
        """Pipeline completo: Coordenadora → Especialista → Qualidade."""

        # Passo 1: Ana classifica
        categoria, urgencia = self.coordenadora(mensagem_cliente)

        # Passo 2: Direciona ao especialista
        agentes = {
            "vendas": self.agente_vendas,
            "suporte": self.agente_suporte,
            "financeiro": self.agente_financeiro,
        }

        agente = agentes.get(categoria)
        if not agente:
            return "Desculpe, não entendi sua mensagem. Pode reformular?"

        resposta_bruta = agente(mensagem_cliente)

        # Passo 3: Revisão de qualidade
        resposta_final = self.agente_qualidade(resposta_bruta, mensagem_cliente)

        # Log
        self.historico.append({
            "timestamp": datetime.now().isoformat(),
            "mensagem": mensagem_cliente,
            "categoria": categoria,
            "urgencia": urgencia,
            "resposta": resposta_final,
        })

        print(f"\n{'='*60}")
        print(f"📤 RESPOSTA FINAL PARA O CLIENTE:")
        print(f"{'='*60}")
        print(resposta_final)

        return resposta_final


# ============================================================
# EXEMPLO DE USO
# ============================================================

if __name__ == "__main__":
    time = TimeDeAgentes()

    # Simulação de mensagens reais de clientes
    mensagens = [
        "Oi, cheguei em Dublin semana passada e quero trabalhar em bar. "
        "Quanto custa o curso?",

        "Oi, fiz o curso mês passado mas ainda não recebi meu certificado. "
        "Podem verificar?",

        "Preciso de um relatório de quantos alunos se matricularam esse mês "
        "e qual a receita total.",
    ]

    for msg in mensagens:
        time.processar_mensagem(msg)
        print("\n" + "─" * 60 + "\n")
```

---

### Exemplo 2: Time de Agentes com Agent SDK (Mais Simples)

Para quem quer menos código e mais produtividade:

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition


async def time_agentes_sdk():
    """Time de agentes usando o Agent SDK — menos código, mesma potência."""

    async for message in query(
        prompt="""Você é a coordenadora da BR Academy Dublin.

        Analise o arquivo de leads em google-sheets-templates/csv/leads.csv
        e faça o seguinte:

        1. Use o agente 'analista-vendas' para analisar os leads e sugerir
           ações de follow-up para cada estágio do funil
        2. Use o agente 'analista-financeiro' para calcular métricas de
           receita baseado nos dados de transactions.csv
        3. Compile um relatório executivo com as descobertas

        Responda tudo em português brasileiro.""",

        options=ClaudeAgentOptions(
            cwd="/home/user/BR-Academy",
            allowed_tools=["Read", "Glob", "Grep", "Bash", "Write", "Task"],
            agents={
                "analista-vendas": AgentDefinition(
                    description="Especialista em análise de pipeline de vendas. "
                                "Analisa leads, identifica oportunidades e sugere ações.",
                    prompt="""Você é um analista de vendas sênior.
                    Analise dados de leads e forneça:
                    1. Distribuição por estágio do funil
                    2. Leads quentes (score > 70) que precisam de follow-up
                    3. Taxa de conversão por fonte (Instagram, WhatsApp, Website)
                    4. Recomendações de ação para cada grupo""",
                    tools=["Read", "Glob", "Grep"]
                ),
                "analista-financeiro": AgentDefinition(
                    description="Especialista em análise financeira. "
                                "Calcula métricas, identifica tendências e gera relatórios.",
                    prompt="""Você é um analista financeiro.
                    Analise dados de transações e forneça:
                    1. Receita total e por tipo de curso
                    2. Ticket médio por aluno
                    3. Tendência de crescimento
                    4. Previsão para o próximo mês
                    5. Top 3 recomendações para aumentar receita""",
                    tools=["Read", "Glob", "Grep"]
                ),
            }
        )
    ):
        if message.type == "result":
            print(message.result)


asyncio.run(time_agentes_sdk())
```

---

## Comparação: Seu Sistema Atual vs. Time de Agentes Claude

| Aspecto | Atual (n8n + OpenAI) | Time de Agentes Claude |
|---------|----------------------|------------------------|
| **Inteligência** | GPT-4o com prompts fixos | Claude Opus 4.6 com thinking adaptativo |
| **Coordenação** | Workflow linear no n8n | Agentes que se comunicam entre si |
| **Revisão** | Sem revisão de qualidade | Agente de qualidade revisa tudo |
| **Análise de dados** | Relatórios manuais | Agente lê seus CSVs e analisa automaticamente |
| **Escalabilidade** | Limitado aos workflows existentes | Novos agentes adicionados com poucas linhas |
| **Custo** | OpenAI + n8n hosting | API Claude (pague por uso) |
| **Código** | JSON workflows complexos | Python legível e extensível |

---

## Próximos Passos

1. **Instale as dependências**: `pip install anthropic`
2. **Configure a API key**: `export ANTHROPIC_API_KEY="..."`
3. **Adapte os prompts** dos agentes para o tom e regras da sua empresa
4. **Conecte às suas fontes de dados** (Google Sheets API, Stripe, etc.)
5. **Integre com WhatsApp** via Z-API (mesmo webhook que já usa)
6. **Teste com mensagens reais** e ajuste os prompts baseado nos resultados

---

## Dicas de Ouro

- **Comece simples**: Teste com 2 agentes (Coordenadora + Vendas) antes de adicionar mais
- **Prompts são tudo**: Invista tempo nos system prompts — eles definem a personalidade
- **Sempre revise**: O agente de qualidade economiza dor de cabeça com respostas erradas
- **Monitore custos**: Use `claude-haiku-4-5` para o agente de qualidade (mais barato) e `claude-opus-4-6` para vendas (mais inteligente)
- **Logging**: Salve todas as interações para melhorar os prompts com o tempo
