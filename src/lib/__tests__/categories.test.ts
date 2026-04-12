import { describe, it, expect } from 'vitest'
import { categorizar } from '../categories'

describe('categorizar', () => {
  it('reconhece supermercado como alimentacao', () => {
    expect(categorizar('MERCADO PAO DE ACUCAR')).toBe('alimentacao')
  })

  it('reconhece iFood como alimentacao', () => {
    expect(categorizar('IFOOD*RESTAURANTE')).toBe('alimentacao')
  })

  it('reconhece Uber como transporte', () => {
    expect(categorizar('Uber *Viagem')).toBe('transporte')
  })

  it('reconhece posto de gasolina como transporte', () => {
    expect(categorizar('POSTO IPIRANGA')).toBe('transporte')
  })

  it('reconhece Netflix como assinaturas', () => {
    expect(categorizar('NETFLIX.COM')).toBe('assinaturas')
  })

  it('reconhece Spotify como assinaturas', () => {
    expect(categorizar('Spotify Brazil')).toBe('assinaturas')
  })

  it('reconhece farmacia como saude', () => {
    expect(categorizar('FARMACIA DROGASIL')).toBe('saude')
  })

  it('reconhece academia como lazer', () => {
    expect(categorizar('SMARTFIT ACADEMIA')).toBe('lazer')
  })

  it('retorna outros para estabelecimento desconhecido', () => {
    expect(categorizar('LOJA XPTO 123')).toBe('outros')
  })

  it('e case-insensitive e ignora acentos', () => {
    expect(categorizar('Farmácia São João')).toBe('saude')
    expect(categorizar('ÔNIBUS SPTrans')).toBe('transporte')
  })
})
