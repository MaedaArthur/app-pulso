import { useCategoriasCustom } from './useCategorias'

export const ICONES_PADRAO: Record<string, string> = {
  alimentacao: '🍔',
  transporte:  '🚗',
  moradia:     '🏠',
  saude:       '💊',
  lazer:       '🎮',
  assinaturas: '📱',
  educacao:    '📚',
  outros:      '📦',
}

export function useEmojis() {
  const { data: categoriasCustom } = useCategoriasCustom()

  const icones: Record<string, string> = { ...ICONES_PADRAO }
  for (const cat of categoriasCustom) {
    icones[cat.nome] = cat.emoji
  }

  function getEmoji(categoria: string): string {
    return icones[categoria] ?? '🏷️'
  }

  return { getEmoji }
}
