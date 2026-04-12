import type { Categoria } from '../types'

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

export function categorizar(titulo: string): Categoria {
  const normalizado = normalizar(titulo)
  for (const [categoria, keywords] of Object.entries(KEYWORDS) as [CategoriaComKeywords, string[]][]) {
    if (keywords.some(kw => normalizado.includes(normalizar(kw)))) {
      return categoria
    }
  }
  return 'outros'
}
