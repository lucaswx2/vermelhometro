// Baixa as candidaturas aptas de 2026 da API DivulgaCandContas do TSE para dados/raw/candidatos-tse/{UF}.json.
// Só entram candidaturas deferidas ou sub judice. O `sq` é o SQ_CANDIDATO, que liga a candidatura à foto.
// Uso: node scripts/baixar-tse.ts
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { UFS } from '../src/lib/estados.ts'

const API = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2026'
const ELEICAO = '20322002026'
const RAW = join(import.meta.dirname, '..', 'dados', 'raw', 'candidatos-tse')

const CARGOS = {
  1: 'presidente',
  3: 'governador',
  5: 'senador',
  6: 'deputado federal',
  7: 'deputado estadual',
  8: 'deputado distrital',
} as const

const SITUACOES: Record<string, string> = {
  Deferido: 'deferido',
  'Deferido com recurso': 'sub judice (deferido com recurso)',
  'Indeferido com recurso': 'sub judice (indeferido com recurso)',
  'Indeferido em prazo recursal ou com recurso': 'sub judice (indeferido com recurso)',
}

const listaSchema = z.object({
  candidatos: z.array(
    z.object({
      id: z.number(),
      numero: z.number().int(),
      nomeUrna: z.string(),
      descricaoSituacao: z.string().nullable(),
      nomeColigacao: z.string().nullable(),
      partido: z.object({ sigla: z.string() }),
    }),
  ),
})

const cargosDaUf = (uf: string) => (uf === 'BR' ? [1] : uf === 'DF' ? [3, 5, 6, 8] : [3, 5, 6, 7]) as (keyof typeof CARGOS)[]

const ignoradas = new Map<string, number>()

const baixarUf = async (uf: string) => {
  const porCargo = await Promise.all(
    cargosDaUf(uf).map(async (codigo) => {
      const resposta = await fetch(`${API}/${uf}/${ELEICAO}/${codigo}/candidatos`)
      if (!resposta.ok) throw new Error(`${uf} cargo ${codigo}: HTTP ${resposta.status}`)
      const { candidatos } = listaSchema.parse(await resposta.json())
      return candidatos.flatMap((c) => {
        const situacao = SITUACOES[c.descricaoSituacao ?? '']
        if (!situacao) {
          ignoradas.set(c.descricaoSituacao ?? 'sem situação', (ignoradas.get(c.descricaoSituacao ?? 'sem situação') ?? 0) + 1)
          return []
        }
        return [
          {
            cargo: CARGOS[codigo],
            numero: c.numero,
            nomeUrna: c.nomeUrna,
            partido: c.partido.sigla,
            situacao,
            coligacaoOuFederacao: c.nomeColigacao ?? '',
            sq: String(c.id),
          },
        ]
      })
    }),
  )
  const lista = porCargo.flat()
  writeFileSync(join(RAW, `${uf}.json`), `${JSON.stringify(lista, null, 1)}\n`, 'utf8')
  return lista.length
}

let total = 0
for (const uf of ['BR', ...UFS]) {
  const n = await baixarUf(uf)
  total += n
  console.log(uf, n)
}
console.log(`total: ${total}`)
for (const [situacao, n] of ignoradas) console.log(`ignoradas (${situacao}): ${n}`)
