export interface ChangelogEntry {
  tipo: 'novo' | 'melhoria' | 'fix'
  texto: string
}

export interface Changelog {
  id: string
  titulo: string
  entradas: ChangelogEntry[]
}

// Bump `id` whenever you want the sheet to reappear for all users.
export const CHANGELOG: Changelog = {
  id: '2025-04-categorias',
  titulo: 'Novidades desta versão',
  entradas: [
    { tipo: 'novo',     texto: 'Categorias personalizadas agora têm emoji, escolha na criação ou mude depois' },
    { tipo: 'novo',     texto: 'Apague categorias criadas por você direto em 🏷️ Categorias' },
    { tipo: 'melhoria', texto: 'Seleção de emoji aparece direto na criação, sem passos extras' },
    { tipo: 'fix',      texto: 'Emojis de todas as telas agora vêm de uma fonte única, sem inconsistências' },
  ],
}
