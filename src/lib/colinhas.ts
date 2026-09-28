import { z } from 'zod'
import colinhasJson from '../../dados/colinhas.json'
import type { Uf } from './estados'

const opcaoSchema = z.object({
  numero: z.number().int(),
  nomeUrna: z.string(),
  partido: z.string(),
  situacao: z.string(),
  tipo: z.enum(['proprio', 'apoio']),
})

const proporcionalSchema = z.object({
  legenda: z.number().int().nullable(),
  candidatos: z.array(z.object({ numero: z.number().int(), nomeUrna: z.string(), situacao: z.string() })),
})

const colinhaDoPartidoSchema = z.object({
  presidente: z.array(opcaoSchema),
  governador: z.array(opcaoSchema),
  senador: z.array(opcaoSchema),
  deputadoFederal: proporcionalSchema,
  deputadoEstadual: proporcionalSchema,
})

const arquivoSchema = z.object({
  geradoEm: z.iso.datetime(),
  colinhas: z.record(z.string(), z.record(z.string(), colinhaDoPartidoSchema)),
})

export type Opcao = z.infer<typeof opcaoSchema>
export type ColinhaDoPartido = z.infer<typeof colinhaDoPartidoSchema>

const arquivo = arquivoSchema.parse(colinhasJson)

export const colinhasGeradasEm = new Date(arquivo.geradoEm)

export const colinhaDaUf = (uf: Uf) => arquivo.colinhas[uf] ?? {}
