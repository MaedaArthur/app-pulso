export interface ChangelogEntry {
  tipo: 'novo' | 'melhoria' | 'fix'
  texto: string
}

export interface Changelog {
  id: string
  titulo: string
  data: string // "YYYY-MM-DD"
  entradas: ChangelogEntry[]
}

// Histórico completo de changelogs, do mais recente para o mais antigo.
// Ao publicar uma nova versão, ADICIONE uma entrada no topo (índice 0).
// Nunca apague entradas antigas — elas seguem acessíveis via "Histórico de
// novidades" em Configurações.
export const CHANGELOGS: Changelog[] = [
  {
    id: '2026-04-mes-referencia-gasto-manual',
    titulo: 'Mês de referência e gastos manuais',
    data: '2026-04-14',
    entradas: [
      { tipo: 'novo',     texto: 'Navegue entre meses pelo seletor no topo da Home — volte e avance livremente' },
      { tipo: 'novo',     texto: 'Escolha o "mês da fatura" ao importar CSV de crédito: compras de março pagas em abril contam em abril' },
      { tipo: 'novo',     texto: 'Adicione gastos manualmente (sem CSV) na aba Gastos — abra o painel "➕ Adicionar gasto manual"' },
      { tipo: 'novo',     texto: 'Apague um gasto individual direto da lista expandida da categoria' },
      { tipo: 'novo',     texto: 'Cada transação agora tem "mês de referência" editável — consegue mover gastos entre meses sem recriar' },
      { tipo: 'melhoria', texto: 'Cálculos de ritmo, projeção e saúde da reserva só aparecem no mês atual — meses passados mostram só os totais' },
      { tipo: 'fix',      texto: 'Removidos "Pagamento de fatura", "Aplicação RDB" e "Resgate RDB" que estavam duplicando o total do mês' },
    ],
  },
  {
    id: '2025-04-categorias-reservas-report',
    titulo: 'Novidades desta versão',
    data: '2025-04-01',
    entradas: [
      { tipo: 'novo',     texto: 'Categorias personalizadas agora têm emoji, escolha na criação ou mude depois' },
      { tipo: 'novo',     texto: 'Apague categorias criadas por você direto em 🏷️ Categorias' },
      { tipo: 'novo',     texto: 'Nova aba de reserva para gerenciar seus fundos de emergência' },
      { tipo: 'novo',     texto: 'Relatório de problemas para melhorar a experiência do usuário na página configurações' },
      { tipo: 'melhoria', texto: 'Seleção de emoji aparece direto na criação, sem passos extras' },
      { tipo: 'fix',      texto: 'Emojis de todas as telas agora vêm de uma fonte única, sem inconsistências' },
    ],
  },
]

// Changelog atual = primeiro da lista. Usado pelo WhatsNewSheet que aparece
// automaticamente no primeiro login após um bump de versão.
export const CHANGELOG: Changelog = CHANGELOGS[0]
