# Renda Frag — Contexto para o Claude Code

## O que é esse projeto

App mobile-first de controle financeiro para quem vive de renda fragmentada — estagiários, bolsistas, freelancers, trabalhadores de plataforma, quem tem múltiplas fontes de renda. Construído inicialmente como protótipo HTML/JS. O objetivo é transformá-lo num app real com conta de usuário, backend e histórico persistente.

---

## Problema central

**Quem tem renda única e previsível já é atendido pelos apps existentes. Quem não tem, não é.**

O usuário recebe dinheiro de fontes diferentes, em datas diferentes, em valores que mudam todo mês. O resultado é:

1. **Falta de previsibilidade** — o mês começa incompleto e vai se completando aos pedaços. Difícil planejar sem saber com quanto conta agora vs. com quanto vai contar.
2. **Invisibilidade do gasto** — o dinheiro fica num lugar só, sai aos poucos pelo crédito e pelo Pix, e é difícil distinguir o que já foi embora do que ainda é seu. O Pix piora porque força o usuário a tirar da reserva — ele não escolheu, foi obrigado pela limitação do sistema.
3. **Custo emocional alto** — controle financeiro é chato e pesado. O usuário não quer virar analista do próprio dinheiro. Quer gastar o mínimo de energia e mesmo assim ter clareza.

O app resolve isso com linguagem simples, fricção zero e foco no que o usuário realmente precisa saber: **"tô bem esse mês?"**

---

## Público-alvo

Pessoas com renda fragmentada — não necessariamente PJ formal:

- Estagiários com ajuda familiar + bolsa + estágio
- Bolsistas de pesquisa, IC, mestrado, doutorado
- Freelancers por projeto (devs, designers, redatores)
- Prestadores com clientes fixos mas renda variável
- Trabalhadores de plataforma (iFood, Uber, 99)
- Quem tem dois vínculos ou salário + comissão variável

**Tamanho estimado:** 10 a 15 milhões de pessoas no Brasil.

**Princípio de produto:** acessível, para a massa, sem jargão financeiro. Não é produto de luxo. Linguagem simples, mobile first absoluto, fricção zero, gratuito na fase de validação.

---

## Decisões de produto

- Não há API do Nubank — usuário exporta CSV manualmente. Começa só com Nubank, expande depois via Open Finance.
- "Saldo disponível" é genérico — não assume caixinha Nubank. Pergunta no onboarding onde a pessoa guarda o dinheiro (qualquer banco, poupança, mais de um lugar). Campo chamado "dinheiro guardado", não "caixinha".
- Fórmula do saldo: `dinheiro guardado − total gasto no mês − meta de poupança`
- Categorização automática por palavras-chave, corrigível manualmente por transação.
- Conta de usuário desde o início — dados no servidor para histórico futuro e analytics.
- Mobile first — a pessoa abre no celular no ônibus, às 23h na cama, não no computador.
- Tom sempre construtivo — nunca termina com "você está mal", sempre com "e aqui está o que você pode fazer".

---

## Roadmap por fases

### Fase 0 — MVP (implementar agora)

O mínimo que resolve o problema central. Nada além disso.

| Feature | Descrição |
|---|---|
| Onboarding simples | 3 perguntas: como recebe, onde guarda o dinheiro, qual é o foco agora |
| Registro de entradas | Valor, fonte, data. Livre, sem tipo obrigatório |
| Importação CSV Nubank | Gastos do crédito, categorização automática + correção manual |
| Saldo disponível real | Dinheiro guardado − gasto − meta. Genérico, qualquer banco |
| Estado do mês | Verde / amarelo / vermelho. Responde "tô bem?" sem precisar pensar |
| Conta de usuário | Login básico (email + senha). Dados no servidor desde o início |

### Fase 1 — Após validação com amigos

Só adicionar depois de ter feedback real de uso. Sem feedback, não adiciona nada.

| Feature | Tipo |
|---|---|
| Check-in mensal | Como foi o mês? O que espera do próximo? Alimenta o estado do mês |
| A receber / pendente | Separa o que entrou do que foi prometido mas não veio |
| Média móvel 3 meses | Renda de referência mais honesta para quem varia muito |
| Reserva de operação | Meta em meses de despesa, progresso, conselho de aporte |
| Pix separado do crédito | Registro manual de gastos em Pix que não aparecem na fatura |
| Histórico de meses | Ver meses anteriores. Útil depois de 2-3 meses de uso |

### Fase 2 — Diferenciação

O que separa do mercado. Só faz sentido construir depois de entender o usuário real.

| Feature | Por que é diferencial |
|---|---|
| Botão emergência | Modo crise: cortes imediatos sugeridos + projeção de recuperação. Nenhum app tem. |
| Impostos automáticos | MEI primeiro (DAS fixo e previsível). Reserva antes de calcular saldo. Poupa energia mental. |
| Antecipação de mês ruim | Detecta antes do fim do mês que a renda ficou abaixo da média. Avisa com sugestão, não só alarme. |
| Plano de acumulação | 3 cenários + projeção + renda passiva. Só depois que reserva estiver ok. |
| Outros bancos | Inter, C6, Itaú via Open Finance. Expande além do Nubank. |
| Tom emocional adaptativo | Linguagem muda conforme perfil e momento. Nunca só vermelho. |

### Fase 3 — Escala (não pensa nisso agora)

| Feature | Nota |
|---|---|
| Sugestão de investimentos | Requer parceria ou regulação. Complexo. |
| Insights agregados | Dados anônimos do público — o que outros com perfil similar fazem |
| Monetização | Só decide modelo depois de saber o que retém o usuário |

---

## Plano de conhecimento do público

### Agora (antes de lançar)
Conversas informais com 5 a 10 pessoas com renda fragmentada. Não entrevista estruturada — papo. "Como você organiza seu dinheiro?" Sem vender nada, só ouvir.

### Fase 0 (com amigos usando)
O dado mais valioso não é o que falam — é o que fazem. Com quantos dias abandonam? O que abrem mais? O que nunca tocam? Capturar com analytics simples desde o início.

### Fase 1 (após ter usuários reais por 1-2 meses)
Pesquisa curta dentro do próprio app, no momento certo. Uma pergunta por vez, quando a pessoa acabou de fazer algo relevante. Nunca formulário externo.

### Fase 2 (alcançar público além dos amigos)
Comunidades de freelancer no WhatsApp, grupos de entregador, Discord de dev, grupos de estagiários. Distribuição orgânica. Só faz sentido quando souber exatamente o que quer validar com o público maior.

---

## Categorias automáticas de gastos

| Categoria | Palavras-chave |
|---|---|
| Mercado | supermercado, carrefour, extra, atacadao, hortifruti, feira, kanguru, assai |
| Restaurante | restaurante, padaria, pizza, mcdonalds, subway, sushi, churrasco, bar |
| iFood/Delivery | ifood, rappi, uber eats, delivery, marmita |
| Transporte | uber, 99, cabify, taxi, posto, gasolina, shell, ipiranga, estacionamento |
| Farmácia | farmacia, drogaria, ultrafarma, raia, pacheco, nissei |
| Saúde | clinica, médico, hospital, exame, odonto, dental, psicólogo |
| Assinatura | netflix, spotify, prime, disney, apple, icloud, adobe, microsoft |
| Lazer | cinema, teatro, show, ingresso, parque, ticketmaster, sympla |
| Compras | amazon, mercado livre, shopee, magazine, americanas, shein, renner, zara |
| Outros | fallback para o que não encaixar |

---

## Lógica financeira

### Saldo disponível real
```
saldo_real = dinheiro_guardado - total_gasto_no_mes - meta_poupanca_mensal
```

### Estado do mês
```
verde   → saldo_real > 20% da média de renda
amarelo → saldo_real entre 0% e 20%
vermelho → saldo_real < 0
```

### Média móvel de renda (Fase 1)
```
media_3m = soma(renda_ultimos_3_meses) / 3
```

### Reserva de operação (Fase 1)
```
meta_reserva = media_gasto_mensal × meses_de_cobertura  // 3 a 6 meses
```

### Projeção com juros compostos (Fase 2)
```
acc[0] = ja_acumulado
acc[i] = acc[i-1] × (1 + taxa_mensal) + aporte_mensal
taxa_mensal = rendimento_anual / 100 / 12
patrimonio_para_renda_passiva = renda_passiva_mensal / taxa_mensal
```

### Cenários de aporte (Fase 2)
- Conservador: 70% do aporte definido
- Moderado: 100%
- Agressivo: 140%

---

## Parsing do CSV do Nubank

Formato da fatura de crédito:
```
date,title,amount
2024-04-01,"iFood*Restaurante XYZ",45.00
2024-04-02,"UBER *TRIP",18.90
```

- `date` — data da transação
- `title` — nome do estabelecimento (base para categorização)
- `amount` — positivo = gasto, negativo = estorno/crédito

O extrato (débito/Pix) pode ter formato diferente. Tratar os dois no parser com detecção automática de formato.

---

## Stack

### Protótipo atual
- HTML/CSS/JS puro, arquivo único
- Chart.js 4.4.1 via CDN
- Persistência via `window.storage` (substituir por backend + auth no app real)

### Stack recomendada para o app real
- **Frontend:** React + Vite
- **Estilo:** Tailwind CSS
- **Gráficos:** Recharts
- **Backend:** Supabase (auth + banco de dados + API)
- **Deploy:** Vercel (frontend) + Supabase (backend)
- **Linguagem:** TypeScript desde o início

### Por que Supabase
- Auth pronto (email/senha, Google)
- Banco PostgreSQL gerenciado
- API gerada automaticamente
- Plano gratuito generoso para validação
- Fácil de migrar depois se necessário

---

## Estrutura de arquivos sugerida

```
src/
  components/
    onboarding/
    entradas/
    gastos/
    estado/
    reserva/        (Fase 1)
    acumulacao/     (Fase 2)
  lib/
    finance.ts      — funções financeiras puras e testáveis
    csvParser.ts    — parser do CSV do Nubank (dois formatos)
    categories.ts   — palavras-chave e lógica de categorização
  hooks/
    useEntradas.ts
    useGastos.ts
    useSaldo.ts
  pages/
    index.tsx       — estado do mês (tela principal)
    entradas.tsx
    gastos.tsx
```

---

## Analytics

### Objetivo
Entender comportamento real dos primeiros usuários (amigos) nos primeiros 2-3 meses. Dados comportamentais valem mais do que o que as pessoas lembram em pesquisa.

### Implementação

Criar tabela `events` no Supabase:

```sql
create table events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  event text not null,
  properties jsonb,
  created_at timestamptz default now()
);
```

Módulo de tracking em `/src/lib/analytics.ts`:

```typescript
export function track(event: string, properties?: Record<string, unknown>) {
  supabase.from('events').insert({
    user_id: currentUser.id,
    event,
    properties,
    created_at: new Date().toISOString()
  })
}
```

### Eventos a logar na Fase 0

| Evento | Propriedades | O que revela |
|---|---|---|
| `app_aberto` | — | Frequência de uso real |
| `tela_aberta` | `{ tela: string }` | O que as pessoas mais acessam |
| `onboarding_concluido` | `{ perfil: string }` | Taxa de ativação |
| `csv_importado` | `{ transacoes: number }` | Quantos completam o setup |
| `entrada_registrada` | — | Engajamento ativo |
| `saldo_visualizado` | `{ estado: 'verde' \| 'amarelo' \| 'vermelho' }` | Se a tela principal retém |

### Perguntas que os dados vão responder

- Quantos dias após instalar a pessoa usou pela segunda vez?
- Qual tela tem mais acesso? Qual tem menos?
- Onde as pessoas param de usar — depois de qual ação?
- Quantos importaram o CSV pelo menos uma vez?
- Quem usa toda semana vs. quem abriu uma vez e sumiu?

### Pesquisa qualitativa (2-3 meses após lançar)

Conversa informal com cada amigo que usou. Perguntas-chave:

- O que o app te ajudou a perceber que você não sabia antes?
- Teve algum momento que você abriu o app porque estava ansioso com dinheiro?
- O que você sentiu falta que não tinha?
- Você recomendaria pra alguém? Quem especificamente?
- O que te fez parar de usar — ou o que te fez continuar?

### Limitações conhecidas

Amigos têm viés — usam mais porque é seu, dão feedback mais suave, têm perfil parecido. Os dados e a pesquisa com amigos validam se o produto funciona. Validar se resolve para pessoas desconhecidas é o objetivo da Fase 2.

---

## Instruções para o Claude Code

1. **Implemente apenas a Fase 0.** Não adicione nada da Fase 1 ou 2.
2. Crie conta de usuário desde o início com Supabase Auth (email + senha).
3. A tela principal é o **estado do mês** — verde/amarelo/vermelho com saldo disponível em destaque.
4. Mantenha toda lógica financeira em `/src/lib/finance.ts` com funções puras e tipadas.
5. Parser de CSV em `/src/lib/csvParser.ts` com suporte aos dois formatos do Nubank.
6. TypeScript estrito desde o início.
7. Mobile first — toda tela deve funcionar bem em 375px de largura.
8. Sem jargão financeiro na interface — "dinheiro guardado" não "saldo da conta", "o que entrou" não "receitas", "o que saiu" não "despesas".
9. Toda mensagem negativa (saldo baixo, reserva insuficiente) deve vir acompanhada de uma sugestão de ação.
10. Analytics básico desde o início — logar abertura de tela e ações principais para entender padrão de uso real.
