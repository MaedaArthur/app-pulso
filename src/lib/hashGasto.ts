export async function hashGasto(
  userId: string,
  data: string,
  titulo: string,
  valor: number
): Promise<string> {
  const texto = `${userId}|${data}|${titulo}|${valor.toFixed(2)}`
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(texto)
  )
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
