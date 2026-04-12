import { describe, it, expect } from 'vitest'
import { hashGasto } from '../hashGasto'

describe('hashGasto', () => {
  it('retorna string hexadecimal de 64 caracteres', async () => {
    const h = await hashGasto('user-1', '2024-04-05', 'Mercado', 87.5)
    expect(h).toHaveLength(64)
    expect(h).toMatch(/^[0-9a-f]+$/)
  })

  it('mesmo input sempre gera mesmo hash', async () => {
    const h1 = await hashGasto('user-1', '2024-04-05', 'Mercado', 87.5)
    const h2 = await hashGasto('user-1', '2024-04-05', 'Mercado', 87.5)
    expect(h1).toBe(h2)
  })

  it('inputs diferentes geram hashes diferentes', async () => {
    const h1 = await hashGasto('user-1', '2024-04-05', 'Mercado', 87.5)
    const h2 = await hashGasto('user-1', '2024-04-05', 'Mercado', 87.51)
    expect(h1).not.toBe(h2)
  })

  it('userId diferente gera hash diferente', async () => {
    const h1 = await hashGasto('user-1', '2024-04-05', 'Mercado', 87.5)
    const h2 = await hashGasto('user-2', '2024-04-05', 'Mercado', 87.5)
    expect(h1).not.toBe(h2)
  })
})
