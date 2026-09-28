// Junta os dados brutos em dados/*.json, que o site lê no build.
// Uso: node scripts/importar-dados.ts
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { candidatoSchema, pesquisaSchema, camaraSchema, senadorContinuaSchema } from '../src/lib/esquemas.ts'

const DADOS = join(import.meta.dirname, '..', 'dados')
const RAW = join(DADOS, 'raw')

const lerJson = (arquivo: string): unknown => JSON.parse(readFileSync(arquivo, 'utf8').replace(/^﻿/, ''))
const gravarJson = (nome: string, valor: unknown) =>
  writeFileSync(join(DADOS, nome), `${JSON.stringify(valor, null, 2)}\n`, 'utf8')

const importarCandidatos = () => {
  const linhas = readFileSync(join(DADOS, 'classificacao-candidatos.csv'), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/)
  const [, ...corpo] = linhas
  const candidatos = corpo.map((linha) => {
    const [cargo, uf, nomeUrna, partido, coligacao, faixaPartido, faixa, overrideMotivo, apoioLula, apoioBolsonaro, fonteUrl, notas] =
      linha.split(';')
    return candidatoSchema.parse({ cargo, uf, nomeUrna, partido, coligacao, faixaPartido, faixa, overrideMotivo, apoioLula, apoioBolsonaro, fonteUrl, notas })
  })
  gravarJson('candidatos.json', candidatos)
  return candidatos.length
}

const importarPesquisas = () => {
  const arquivos = readdirSync(RAW).filter((f) => f.startsWith('pesquisas-') && f.endsWith('.json'))
  const brutas = arquivos.flatMap((f) => z.array(z.unknown()).parse(lerJson(join(RAW, f))))
  const aceitas: z.infer<typeof pesquisaSchema>[] = []
  const recusadas: string[] = []
  for (const bruta of brutas) {
    const resultado = pesquisaSchema.safeParse(bruta)
    if (resultado.success) {
      aceitas.push(resultado.data)
      continue
    }
    const id = z.object({ id: z.string() }).safeParse(bruta)
    const campos = resultado.error.issues.map((i) => i.path.join('.')).join(', ')
    recusadas.push(`${id.success ? id.data.id : '?'}: ${campos}`)
  }
  const unicas = [...new Map(aceitas.map((p) => [p.id, p])).values()]
  gravarJson('pesquisas.json', unicas)
  return { aceitas: unicas.length, recusadas }
}

const copiarValidado = (origem: string, destino: string, schema: z.ZodType) => {
  const arquivo = join(RAW, origem)
  if (!existsSync(arquivo)) return false
  gravarJson(destino, schema.parse(lerJson(arquivo)))
  return true
}

const total = importarCandidatos()
const { aceitas, recusadas } = importarPesquisas()
const camaraOk = copiarValidado('camara.json', 'camara.json', camaraSchema)
const senadoOk = copiarValidado('senadores-continuam.json', 'senadores-continuam.json', z.array(senadorContinuaSchema))
const semMetadados = (valor: unknown) =>
  typeof valor === 'object' && valor !== null ? Object.fromEntries(Object.entries(valor).filter(([k]) => !k.startsWith('_'))) : valor
const eleitoradoOk = copiarValidado('eleitorado-uf.json', 'eleitorado.json', z.preprocess(semMetadados, z.record(z.string(), z.number())))
gravarJson('atualizacao.json', { em: new Date().toISOString() })

console.log(`candidatos: ${total}`)
console.log(`pesquisas aceitas: ${aceitas}`)
console.log(`pesquisas recusadas (faltam campos legais): ${recusadas.length}`)
for (const r of recusadas) console.log(`  - ${r}`)
console.log(`camara: ${camaraOk ? 'ok' : 'sem arquivo'} · senado: ${senadoOk ? 'ok' : 'sem arquivo'} · eleitorado: ${eleitoradoOk ? 'ok' : 'sem arquivo'}`)
