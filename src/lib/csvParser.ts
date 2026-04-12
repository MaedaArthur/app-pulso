export type TipoCSV = 'credito' | 'pix'

export interface GastoParseado {
  titulo: string
  valor: number   // sempre positivo
  data: string    // sempre YYYY-MM-DD
}

function parseCsvLinhas(content: string): string[][] {
  return content
    .trim()
    .split('\n')
    .filter(l => l.trim().length > 0)
    .map(line =>
      line.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())
    )
}

function detectarTipo(headers: string[]): TipoCSV {
  const h = headers.map(h => h.toLowerCase())
  if (h.includes('date') || h.includes('title')) return 'credito'
  return 'pix'
}

function ddmmyyyyParaIso(data: string): string {
  const [dia, mes, ano] = data.split('/')
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
}

function parseValorBR(valor: string): number {
  // "2.500,50" → 2500.50  |  "-87,50" → -87.50  |  "87.50" → 87.50
  const semPontoMilhar = valor.replace(/\.(?=\d{3})/g, '')
  return parseFloat(semPontoMilhar.replace(',', '.'))
}

// Operações internas que não representam gastos reais:
// aplicações/resgates de RDB e pagamento de fatura de crédito.
const OPERACOES_INTERNAS_PIX = [
  'pagamento de fatura',
  'aplicacao rdb',
  'aplicação rdb',
  'resgate rdb',
]

function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isOperacaoInternaPix(descricao: string): boolean {
  const d = normalizar(descricao)
  return OPERACOES_INTERNAS_PIX.some(op => d.includes(op))
}

// Extrai o nome do destinatário de descrições longas do Nubank:
// "Transferência enviada pelo Pix - NOME - CPF/CNPJ - BANCO..." → "NOME"
// Se não encaixar no padrão, retorna a descrição original.
function extrairTituloPix(descricao: string): string {
  const match = descricao.match(/pelo Pix - (.+?) - /)
  if (match) return match[1].trim()
  return descricao
}

export function parseCsvNubank(content: string): { tipo: TipoCSV; gastos: GastoParseado[] } {
  const linhas = parseCsvLinhas(content)
  if (linhas.length < 2) return { tipo: 'credito', gastos: [] }

  const [headers, ...rows] = linhas
  const tipo = detectarTipo(headers)

  if (tipo === 'credito') {
    const iDate   = headers.findIndex(h => h.toLowerCase() === 'date')
    const iTitle  = headers.findIndex(h => h.toLowerCase() === 'title')
    const iAmount = headers.findIndex(h => h.toLowerCase() === 'amount')

    const gastos = rows
      .filter(row => row.length > Math.max(iDate, iTitle, iAmount))
      .map(row => ({
        data:   row[iDate],
        titulo: row[iTitle],
        valor:  parseFloat(row[iAmount]),
      }))
      .filter(g => !isNaN(g.valor) && g.valor > 0)

    return { tipo, gastos }
  }

  // Pix / débito
  const iData  = headers.findIndex(h => h.toLowerCase().startsWith('data'))
  const iValor = headers.findIndex(h => h.toLowerCase().startsWith('valor'))
  const iDesc  = headers.findIndex(h =>
    h.toLowerCase().startsWith('descri') || h.toLowerCase().startsWith('hist')
  )
  const iTitulo = iDesc >= 0 ? iDesc : headers.length - 1

  const gastos = rows
    .filter(row => row.length > Math.max(iData, iValor))
    .filter(row => !isOperacaoInternaPix(row[iTitulo] ?? ''))
    .map(row => ({
      data:   ddmmyyyyParaIso(row[iData]),
      titulo: extrairTituloPix(row[iTitulo] ?? ''),
      valor:  parseValorBR(row[iValor]),
    }))
    .filter(g => !isNaN(g.valor) && g.valor < 0)
    .map(g => ({ ...g, valor: Math.abs(g.valor) }))

  return { tipo, gastos }
}
