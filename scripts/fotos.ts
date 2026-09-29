// Regras puras do download de fotos; o download fica em scripts/baixar-fotos.ts.

// 'FBR280002552484_div.jpg' → '280002552484' (F + UF + SQ_CANDIDATO + _div, leiame.pdf do zip).
export const sqDaFoto = (caminho: string) => {
  const nome = caminho.split('/').at(-1) ?? ''
  return /^F[A-Z]{2}(\d+)_div\.jpe?g$/i.exec(nome)?.[1] ?? null
}

export const ehJpeg = (bytes: Uint8Array) => bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff

// A API do TSE responde 200 com a mesma imagem genérica quando não há foto:
// um hash que se repete em várias candidaturas não é foto de ninguém.
export const hashesRepetidos = (hashes: string[], limite: number) => {
  const contagem = new Map<string, number>()
  for (const hash of hashes) contagem.set(hash, (contagem.get(hash) ?? 0) + 1)
  return new Set([...contagem].filter(([, n]) => n >= limite).map(([hash]) => hash))
}
