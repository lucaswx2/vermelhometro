// Monta dados/colinhas.json a partir das candidaturas oficiais do TSE (dados/raw/candidatos-tse).
// Critério definido pelo autor do site (Lucas Freitas), aplicado de forma mecânica:
// 1. em cada cargo, o candidato do próprio partido;
// 2. sem candidato próprio, o candidato que o partido apoia formalmente (coligação na planilha);
// 3. deputados: voto de legenda, só se o partido tiver candidatos ao cargo na UF.
// Uso: node scripts/gerar-colinhas.ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import type { Candidatura } from '../src/lib/candidaturas.ts'
import { candidatoSchema } from '../src/lib/esquemas.ts'
import { UFS } from '../src/lib/estados.ts'
import { faixaDoPartido } from '../src/lib/faixas.ts'
import { PARTIDOS_DE_CLASSE } from '../src/lib/partidosDeClasse.ts'

const DADOS = join(import.meta.dirname, '..', 'dados')


const candidaturaTse = z.object({
  cargo: z.enum(['presidente', 'governador', 'senador', 'deputado federal', 'deputado estadual', 'deputado distrital']),
  numero: z.number().int(),
  nomeUrna: z.string(),
  partido: z.string(),
  situacao: z.string(),
  coligacaoOuFederacao: z.string(),
  sq: z.string(),
})

type CandidaturaTse = z.infer<typeof candidaturaTse>

const lerTse = (arquivo: string) =>
  z.array(candidaturaTse).parse(JSON.parse(readFileSync(join(DADOS, 'raw', 'candidatos-tse', arquivo), 'utf8')))

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const planilha = (() => {
  const [, ...linhas] = readFileSync(join(DADOS, 'classificacao-candidatos.csv'), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/)
  return linhas.map((linha) => {
    const [cargo, uf, nomeUrna, partido, coligacao, faixaPartido, faixa, overrideMotivo, apoioLula, apoioBolsonaro, fonteUrl, notas] =
      linha.split(';')
    return candidatoSchema.parse({ cargo, uf, nomeUrna, partido, coligacao, faixaPartido, faixa, overrideMotivo, apoioLula, apoioBolsonaro, fonteUrl, notas })
  })
})()

const coligacaoInclui = (coligacao: string, sigla: string) =>
  normalizar(coligacao).split(' ').includes(normalizar(sigla))

// Liga a linha da planilha (nome curto) à candidatura oficial do TSE (número de urna).
const acharNoTse = (lista: CandidaturaTse[], nomePlanilha: string, partido: string) => {
  const mesmoPartido = lista.filter((c) => normalizar(c.partido) === normalizar(partido))
  if (mesmoPartido.length === 1) return mesmoPartido[0]
  const tokens = normalizar(nomePlanilha).split(' ').filter((t) => t.length > 2)
  return mesmoPartido.find((c) => tokens.every((t) => normalizar(c.nomeUrna).includes(t)))
}

type Opcao = { numero: number; nomeUrna: string; partido: string; situacao: string; tipo: 'proprio' | 'apoio' }

const opcao = (c: CandidaturaTse, tipo: Opcao['tipo']): Opcao => ({
  numero: c.numero,
  nomeUrna: c.nomeUrna,
  partido: c.partido,
  situacao: c.situacao,
  tipo,
})

const majoritarios = (lista: CandidaturaTse[], cargo: 'presidente' | 'governador' | 'senador', uf: string, sigla: string) => {
  const doCargo = lista.filter((c) => c.cargo === cargo)
  const proprios = doCargo.filter((c) => c.partido === sigla).map((c) => opcao(c, 'proprio'))
  if (proprios.length > 0) return proprios
  const apoiados = planilha
    .filter((p) => p.cargo === cargo && p.uf === uf && coligacaoInclui(p.coligacao, sigla))
    .map((p) => acharNoTse(doCargo, p.nomeUrna, p.partido))
    .filter((c): c is CandidaturaTse => c !== undefined)
  return apoiados.map((c) => opcao(c, 'apoio'))
}

const proporcional = (lista: CandidaturaTse[], cargos: CandidaturaTse['cargo'][], sigla: string, numero: number) => {
  const candidatos = lista
    .filter((c) => cargos.includes(c.cargo) && c.partido === sigla)
    .map((c) => ({ numero: c.numero, nomeUrna: c.nomeUrna, situacao: c.situacao }))
  return { legenda: candidatos.length > 0 ? numero : null, candidatos }
}

const presidenciais = lerTse('BR.json')
const colinhas = Object.fromEntries(
  UFS.map((uf) => {
    const lista = lerTse(`${uf}.json`)
    const porPartido = Object.fromEntries(
      PARTIDOS_DE_CLASSE.map(({ sigla, numero }) => [
        sigla,
        {
          presidente: majoritarios(presidenciais, 'presidente', 'BR', sigla),
          governador: majoritarios(lista, 'governador', uf, sigla),
          senador: majoritarios(lista, 'senador', uf, sigla),
          deputadoFederal: proporcional(lista, ['deputado federal'], sigla, numero),
          deputadoEstadual: proporcional(lista, ['deputado estadual', 'deputado distrital'], sigla, numero),
        },
      ]),
    )
    return [uf, porPartido]
  }),
)

writeFileSync(join(DADOS, 'colinhas.json'), `${JSON.stringify({ geradoEm: new Date().toISOString(), colinhas }, null, 1)}\n`, 'utf8')

for (const uf of UFS) {
  const resumo = PARTIDOS_DE_CLASSE.map(({ sigla }) => {
    const c = colinhas[uf][sigla]
    return `${sigla}: pres ${c.presidente.length} gov ${c.governador.length} sen ${c.senador.length} df ${c.deputadoFederal.candidatos.length} de ${c.deputadoEstadual.candidatos.length}`
  })
  console.log(uf, resumo.join(' | '))
}

// ---------- Candidaturas de qualquer partido, para a busca da colinha ----------

const FOTOS = join(import.meta.dirname, '..', 'public', 'fotos')

const CARGO_DA_COLINHA = {
  presidente: 'presidente',
  governador: 'governador',
  senador: 'senador',
  'deputado federal': 'deputadoFederal',
  'deputado estadual': 'deputadoEstadual',
  'deputado distrital': 'deputadoEstadual',
} as const satisfies Record<CandidaturaTse['cargo'], Candidatura['cargo']>

// Majoritários classificados na planilha levam a faixa do palanque; o resto, a do partido.
const faixaDaCandidatura = (c: CandidaturaTse, uf: string, lista: CandidaturaTse[]) => {
  if (c.cargo !== 'presidente' && c.cargo !== 'governador' && c.cargo !== 'senador') return faixaDoPartido(c.partido)
  const doCargo = lista.filter((l) => l.cargo === c.cargo)
  const naPlanilha = planilha.find((p) => p.cargo === c.cargo && p.uf === uf && acharNoTse(doCargo, p.nomeUrna, p.partido)?.sq === c.sq)
  return naPlanilha?.faixa ?? faixaDoPartido(c.partido)
}

const candidaturas = (uf: string, lista: CandidaturaTse[]): Candidatura[] =>
  lista.map((c) => ({
    sq: c.sq,
    cargo: CARGO_DA_COLINHA[c.cargo],
    numero: c.numero,
    nomeUrna: c.nomeUrna,
    partido: c.partido,
    situacao: c.situacao,
    faixa: faixaDaCandidatura(c, uf, lista),
    foto: existsSync(join(FOTOS, `${c.sq}.jpg`)),
  }))

const porUf: Record<string, Candidatura[]> = Object.fromEntries([['BR', candidaturas('BR', presidenciais)], ...UFS.map((uf) => [uf, candidaturas(uf, lerTse(`${uf}.json`))])])
writeFileSync(join(DADOS, 'candidaturas.json'), `${JSON.stringify({ geradoEm: new Date().toISOString(), porUf })}\n`, 'utf8')
const todas = Object.values(porUf).flat()
console.log(`candidaturas: ${todas.length} · com foto: ${todas.filter((c) => c.foto).length}`)
