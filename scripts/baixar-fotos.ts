// Baixa a foto de cada candidatura apta para public/fotos/{sq}.jpg.
// 1. zips por UF do Portal de Dados Abertos do TSE (conjunto Candidatos 2026, cc-by);
// 2. o que faltar, uma a uma pela API do DivulgaCandContas, descartando a imagem genérica.
// Uso: node scripts/baixar-fotos.ts (depois de node scripts/baixar-tse.ts)
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as esperar } from 'node:timers/promises'
import { unzipSync } from 'fflate'
import { z } from 'zod'
import { UFS } from '../src/lib/estados.ts'
import { ehJpeg, hashesRepetidos, sqDaFoto } from './fotos.ts'

const ZIP = (uf: string) => `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_${uf}_div.zip`
const API = (sq: string, uf: string) => `https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/${sq}/${uf}`
const RAW = join(import.meta.dirname, '..', 'dados', 'raw', 'candidatos-tse')
const FOTOS = join(import.meta.dirname, '..', 'public', 'fotos')
const CONCORRENCIA = 6
const TENTATIVAS = 4

type Apta = { sq: string; uf: string; nomeUrna: string; partido: string; cargo: string }

const aptaSchema = z.object({ sq: z.string(), nomeUrna: z.string(), partido: z.string(), cargo: z.string() })
const aptas: Apta[] = ['BR', ...UFS].flatMap((uf) =>
  z
    .array(aptaSchema)
    .parse(JSON.parse(readFileSync(join(RAW, `${uf}.json`), 'utf8')))
    .map((c) => ({ ...c, uf })),
)

mkdirSync(FOTOS, { recursive: true })
const caminho = (sq: string) => join(FOTOS, `${sq}.jpg`)
const faltando = () => aptas.filter((c) => !existsSync(caminho(c.sq)))

const buscar = async (url: string) => {
  for (let tentativa = 1; ; tentativa++) {
    try {
      const resposta = await fetch(url)
      if (resposta.ok) return new Uint8Array(await resposta.arrayBuffer())
      if (resposta.status < 500 && resposta.status !== 429) throw new Error(`HTTP ${resposta.status}`)
      if (tentativa >= TENTATIVAS) throw new Error(`HTTP ${resposta.status}`)
    } catch (erro) {
      if (tentativa >= TENTATIVAS) throw new Error(`${url}: ${erro instanceof Error ? erro.message : String(erro)}`)
    }
    await esperar(500 * 2 ** tentativa)
  }
}

// ---------- 1. zips por UF ----------

for (const uf of ['BR', ...UFS]) {
  const precisa = new Set(faltando().filter((c) => c.uf === uf).map((c) => c.sq))
  if (precisa.size === 0) continue
  const arquivos = unzipSync(await buscar(ZIP(uf)), {
    filter: (f) => {
      const sq = sqDaFoto(f.name)
      return sq !== null && precisa.has(sq)
    },
  })
  let gravadas = 0
  for (const [nome, bytes] of Object.entries(arquivos)) {
    const sq = sqDaFoto(nome)
    if (sq === null || !ehJpeg(bytes)) continue
    writeFileSync(caminho(sq), bytes)
    gravadas++
  }
  console.log(`zip ${uf}: ${gravadas} de ${precisa.size}`)
}

// ---------- 2. API, uma a uma ----------

const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

const restantes = faltando()
if (restantes.length > 0) {
  // SQ inexistente devolve a imagem genérica; guarda o hash dela.
  const genericas = new Set([hash(await buscar(API('1', 'BR'))), hash(await buscar(API('1', 'SP')))])
  const baixadas: { sq: string; bytes: Uint8Array; hash: string }[] = []
  const erros: string[] = []
  const fila = [...restantes]
  await Promise.all(
    Array.from({ length: CONCORRENCIA }, async () => {
      for (let c = fila.shift(); c; c = fila.shift()) {
        try {
          const bytes = await buscar(API(c.sq, c.uf))
          baixadas.push({ sq: c.sq, bytes, hash: hash(bytes) })
        } catch (erro) {
          erros.push(erro instanceof Error ? erro.message : String(erro))
        }
      }
    }),
  )
  const repetidas = hashesRepetidos(baixadas.map((b) => b.hash), 3)
  let gravadas = 0
  for (const b of baixadas) {
    if (genericas.has(b.hash) || repetidas.has(b.hash) || !ehJpeg(b.bytes)) continue
    writeFileSync(caminho(b.sq), b.bytes)
    gravadas++
  }
  console.log(`API: ${gravadas} de ${restantes.length} (${baixadas.length - gravadas} genéricas ou inválidas, ${erros.length} erros)`)
  for (const e of erros) console.log(`  erro: ${e}`)
}

// ---------- resumo ----------

const semFoto = faltando()
console.log(`aptas: ${aptas.length} · com foto: ${aptas.length - semFoto.length} · sem foto: ${semFoto.length}`)
for (const c of semFoto) console.log(`  - ${c.uf} ${c.cargo} ${c.nomeUrna} (${c.partido}) sq ${c.sq}`)
const arquivos = readdirSync(FOTOS)
const bytes = arquivos.reduce((soma, f) => soma + statSync(join(FOTOS, f)).size, 0)
console.log(`public/fotos: ${arquivos.length} arquivos · ${(bytes / 1024 / 1024).toFixed(1)} MB`)
