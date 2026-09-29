import { z } from 'zod'
import logosJson from '../../dados/logos-partidos.json'

// Logos dos partidos com licença livre, do Wikimedia Commons. Fonte e licença de cada uma em dados/logos-partidos.json.
const manifesto = z
  .object({ logos: z.record(z.string(), z.object({ arquivo: z.string(), status: z.string() })) })
  .parse(logosJson)

export const logoDoPartido = (sigla: string) => {
  const logo = manifesto.logos[sigla]
  return logo?.status === 'ok' ? logo.arquivo : null
}
