// Junta os dados brutos em dados/*.json, que o site lê no build.
// Uso: node scripts/importar-dados.ts
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { unzipSync } from 'fflate'
import { z } from 'zod'
import { candidatoSchema, pesquisaSchema, camaraSchema, senadorContinuaSchema } from '../src/lib/esquemas.ts'
import { protocolosDoCsv, registrosAusentes } from './pesqele.ts'

// Registros de pesquisa do PesqEle, atualizados uma vez por dia (dados abertos do TSE, cc-by).
const PESQELE = 'https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_eleitoral_2026.zip'

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
  return { unicas, recusadas }
}

// Só confere que o registro existe: o CSV guarda o planejado, não o divulgado, e não sobrescreve nada.
const baixarProtocolosPesqEle = async () => {
  const resposta = await fetch(PESQELE)
  if (!resposta.ok) throw new Error(`PesqEle: HTTP ${resposta.status} em ${PESQELE}`)
  const csvs = unzipSync(new Uint8Array(await resposta.arrayBuffer()), { filter: (f) => f.name.endsWith('.csv') })
  const latin1 = new TextDecoder('latin1')
  return new Set(Object.values(csvs).flatMap((bytes) => [...protocolosDoCsv(latin1.decode(bytes))]))
}

const copiarValidado = (origem: string, destino: string, schema: z.ZodType) => {
  const arquivo = join(RAW, origem)
  if (!existsSync(arquivo)) return false
  gravarJson(destino, schema.parse(lerJson(arquivo)))
  return true
}

const { unicas: pesquisas, recusadas } = importarPesquisas()
const protocolos = await baixarProtocolosPesqEle()
const semRegistro = registrosAusentes(pesquisas, protocolos)
console.log(`PesqEle: ${protocolos.size} registros no TSE · ${pesquisas.length} pesquisas conferidas · ${semRegistro.length} sem registro`)
if (semRegistro.length > 0) {
  console.error('Pesquisas com registro ausente do PesqEle (nada foi gravado):')
  for (const p of semRegistro) console.error(`  - ${p.id}: ${p.registro}`)
  process.exit(1)
}

const total = importarCandidatos()
gravarJson('pesquisas.json', pesquisas)
const aceitas = pesquisas.length
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
