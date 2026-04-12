import type { Categoria } from '../types'

export const TODAS_CATEGORIAS: Categoria[] = [
  'alimentacao', 'transporte', 'moradia', 'saude',
  'lazer', 'assinaturas', 'educacao', 'outros',
]

type CategoriaComKeywords = Exclude<Categoria, 'outros'>

const KEYWORDS: Record<CategoriaComKeywords, string[]> = {
  alimentacao: [
    'mercado', 'supermercado', 'padaria', 'restaurante', 'lanchonete',
    'ifood', 'rappi', 'uber eats', 'ubereats', 'pao de acucar', 'carrefour',
    'extra ', 'atacadao', 'hortifruti', 'acougue', 'sushi', 'pizza',
    'burger', 'mc donalds', 'mcdonalds', 'burger king', 'subway', 'starbucks',
  ],
  transporte: [
    'uber ', 'uber*', '99app', '99 ', 'taxi', 'metro ', 'metrô', 'onibus',
    'ônibus', 'combustivel', 'gasolina', 'posto ', 'estacionamento',
    'pedagio', 'pedágio', 'brt', 'sptrans', 'bilhete unico',
  ],
  moradia: [
    'aluguel', 'condominio', 'condomínio', 'agua ', 'água', 'luz ',
    'energia', 'gas encanado', 'internet', 'tim ', 'claro ', 'vivo ',
    'oi ', 'net ', 'sky ', 'iptu',
  ],
  saude: [
    'farmacia', 'farmácia', 'drogaria', 'hospital', 'clinica', 'clínica',
    'medico', 'dentista', 'plano de saude', 'unimed', 'amil', 'sulamerica',
    'bradesco saude', 'laboratorio', 'laboratório',
  ],
  lazer: [
    'cinema', 'teatro', 'show', 'ingresso', 'balada', 'clube',
    'academia', 'gym', 'smartfit', 'bodytech', 'bluefit',
  ],
  assinaturas: [
    'netflix', 'spotify', 'amazon prime', 'disney', 'youtube premium',
    'apple one', 'apple tv', 'hbo', 'globoplay', 'paramount', 'crunchyroll',
    'xbox', 'playstation', 'nintendo', 'google one', 'icloud', 'dropbox',
  ],
  educacao: [
    'escola', 'faculdade', 'universidade', 'curso', 'livraria', 'udemy',
    'alura', 'coursera', 'descomplica', 'estacio', 'anhanguera',
  ],
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Extrai chave de merchant para lookup de correções de usuário.
// Remove sufixos após asterisco (IFOOD*RESTAURANTE → ifood)
// e códigos numéricos no final (POSTO BR 0234 → posto br).
export function normalizarMerchant(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\*.*$/, '')
    .replace(/\s+[\d][\d\s-]*$/, '')
    .trim()
}

export function categorizar(titulo: string, correcoes?: Map<string, Categoria>): Categoria {
  if (correcoes) {
    const merchantKey = normalizarMerchant(titulo)
    const correcao = correcoes.get(merchantKey)
    if (correcao) return correcao
  }

  const normalizado = normalizar(titulo)
  for (const [categoria, keywords] of Object.entries(KEYWORDS) as [CategoriaComKeywords, string[]][]) {
    if (keywords.some(kw => normalizado.includes(normalizar(kw)))) {
      return categoria
    }
  }
  return 'outros'
}
