import { z } from 'zod'
import { FAIXAS } from './faixas.ts'

const cargoSchema = z.enum(['presidente', 'governador', 'senador'])

export const candidatoSchema = z.object({
  cargo: cargoSchema,
  uf: z.string(),
  nomeUrna: z.string(),
  partido: z.string(),
  coligacao: z.string(),
  faixaPartido: z.enum(FAIXAS),
  faixa: z.enum(FAIXAS),
  overrideMotivo: z.string(),
  apoioLula: z.string(),
  apoioBolsonaro: z.string(),
  fonteUrl: z.string(),
  notas: z.string(),
})

export type Candidato = z.infer<typeof candidatoSchema>

// Res. TSE 23.600/2019, art. 10: nenhuma pesquisa entra sem estes campos.
export const pesquisaSchema = z.object({
  id: z.string(),
  instituto: z.string().min(1),
  contratante: z.string().min(1),
  registro: z.string().min(1),
  campoInicio: z.iso.date(),
  campoFim: z.iso.date(),
  entrevistas: z.number().int().positive(),
  margemPp: z.number().positive(),
  confiancaPct: z.number().positive(),
  fonteUrl: z.url(),
  cargo: cargoSchema,
  uf: z.string(),
  turno: z.union([z.literal(1), z.literal(2)]),
  cenario: z.string().nullable(),
  resultados: z.array(
    z.object({
      nomeUrna: z.string(),
      partido: z.string().nullable(),
      pct: z.number(),
    }),
  ),
  notas: z.string().nullable(),
})

export type Pesquisa = z.infer<typeof pesquisaSchema>

export const camaraSchema = z.object({
  atual: z.object({ fonte: z.string(), porPartido: z.record(z.string(), z.number()) }),
  projecaoDiap: z
    .object({
      fonteUrl: z.string(),
      data: z.string().nullable(),
      porPartidoOuFederacao: z.array(
        z.object({ sigla: z.string(), min: z.number().nullable(), max: z.number().nullable(), medio: z.number() }),
      ),
    })
    .nullable(),
})

export const senadorContinuaSchema = z.object({
  uf: z.string(),
  nome: z.string(),
  partidoAtual: z.string(),
  alinhamento: z.enum(['pró-Lula', 'oposição', '?']),
})

export type SenadorContinua = z.infer<typeof senadorContinuaSchema>

export const atualizacaoSchema = z.object({ em: z.iso.datetime({ offset: true }) })
