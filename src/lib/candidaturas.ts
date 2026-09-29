import { z } from 'zod'
import candidaturasJson from '../../dados/candidaturas.json'
import { FAIXAS } from './faixas.ts'
import type { Uf } from './estados.ts'

// Todas as candidaturas aptas do TSE, de qualquer partido. Gerado por scripts/gerar-colinhas.ts.
export const CARGOS_DA_COLINHA = ['deputadoFederal', 'deputadoEstadual', 'senador', 'governador', 'presidente'] as const

export const candidaturaSchema = z.object({
  sq: z.string(),
  cargo: z.enum(CARGOS_DA_COLINHA),
  numero: z.number().int(),
  nomeUrna: z.string(),
  partido: z.string(),
  situacao: z.string(),
  faixa: z.enum(FAIXAS),
  foto: z.boolean(),
})

export type Candidatura = z.infer<typeof candidaturaSchema>

export const arquivoCandidaturasSchema = z.object({
  geradoEm: z.iso.datetime(),
  porUf: z.record(z.string(), z.array(candidaturaSchema)),
})

const arquivo = arquivoCandidaturasSchema.parse(candidaturasJson)

// Presidente vem de 'BR' e vale em todo estado.
export const candidaturasDaUf = (uf: Uf) => [...(arquivo.porUf[uf] ?? []), ...(arquivo.porUf.BR ?? [])]

export const fotoDaCandidatura = (c: Pick<Candidatura, 'sq' | 'foto'>) => (c.foto ? `/fotos/${c.sq}.jpg` : null)
