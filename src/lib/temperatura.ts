import { candidatos, pesquisas, camara, senadoresContinuam, eleitorado, UFS, type Uf } from './dados'
import type { Pesquisa } from './esquemas'
import { faixaDoPartido, ladoDaFaixa, normalizar, type Faixa, type Lado } from './faixas'

type Placar = Record<Lado, number>

const placarVazio = (): Placar => ({ esquerda: 0, centro: 0, direita: 0 })

// 50° = empate. Centrão fica fora da conta: é o campo em disputa.
export const graus = ({ esquerda, direita }: Placar) =>
  esquerda + direita === 0 ? 50 : (100 * esquerda) / (esquerda + direita)

const indicePorCandidato = new Map(
  candidatos.map((c) => [`${c.cargo}|${c.uf}|${normalizar(c.nomeUrna)}`, c]),
)

export const candidatoDoResultado = (pesquisa: Pesquisa, nomeUrna: string) => {
  const nome = normalizar(nomeUrna)
  const exato = indicePorCandidato.get(`${pesquisa.cargo}|${pesquisa.uf}|${nome}`)
  if (exato) return exato
  return candidatos.find(
    (c) =>
      c.cargo === pesquisa.cargo &&
      c.uf === pesquisa.uf &&
      (normalizar(c.nomeUrna).includes(nome) || nome.includes(normalizar(c.nomeUrna))),
  )
}

export const faixaDoResultado = (pesquisa: Pesquisa, resultado: Pesquisa['resultados'][number]): Faixa | null => {
  if (!resultado.partido) return null
  return candidatoDoResultado(pesquisa, resultado.nomeUrna)?.faixa ?? faixaDoPartido(resultado.partido)
}

const placarDaPesquisa = (pesquisa: Pesquisa) =>
  pesquisa.resultados.reduce((placar, resultado) => {
    const faixa = faixaDoResultado(pesquisa, resultado)
    if (faixa) placar[ladoDaFaixa(faixa)] += resultado.pct
    return placar
  }, placarVazio())

const maisRecentePrimeiro = (a: Pesquisa, b: Pesquisa) => b.campoFim.localeCompare(a.campoFim)

export const ultimaPesquisa = (cargo: Pesquisa['cargo'], uf: string, turno: 1 | 2 = 1) =>
  pesquisas
    .filter((p) => p.cargo === cargo && p.uf === uf && p.turno === turno)
    .sort(maisRecentePrimeiro)[0]

const JANELA_DIAS = 21
const ERRO_MARGEM_PP = 6

const phi = (x: number) => {
  // aproximação de Abramowitz-Stegun para a normal acumulada
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x > 0 ? 1 - p : p
}

const presidente = () => {
  const segundoTurno = pesquisas.filter((p) => p.cargo === 'presidente' && p.turno === 2 && /lula/i.test(p.cenario ?? ''))
  const principal = maisFrequente(segundoTurno.map((p) => normalizar(p.cenario ?? '')))
  const doCenario = segundoTurno.filter((p) => normalizar(p.cenario ?? '') === principal).sort(maisRecentePrimeiro)
  const base = doCenario.length > 0 ? doCenario : pesquisas.filter((p) => p.cargo === 'presidente' && p.turno === 1).sort(maisRecentePrimeiro)
  const recentes = umaPorInstituto(dentroDaJanela(base))
  const placares = recentes.map(placarDaPesquisa)
  const temperatura = media(placares.map(graus))
  const margem = media(placares.map((p) => p.esquerda - p.direita))
  return {
    temperatura,
    chance: doCenario.length > 0 ? phi(margem / ERRO_MARGEM_PP) : null,
    margem,
    pesquisas: recentes,
    turno: doCenario.length > 0 ? 2 : 1,
  }
}

const governadores = () => {
  const porUf = UFS.map((uf) => {
    const pesquisa = ultimaPesquisa('governador', uf)
    if (!pesquisa) return { uf, pesquisa: null, temperatura: null, lider: null }
    const ordenados = [...pesquisa.resultados].filter((r) => r.partido).sort((a, b) => b.pct - a.pct)
    const lider = ordenados[0]
    return {
      uf,
      pesquisa,
      temperatura: graus(placarDaPesquisa(pesquisa)),
      lider: lider ? { ...lider, faixa: faixaDoResultado(pesquisa, lider) ?? 'centrao' } : null,
      segundo: ordenados[1] ? { ...ordenados[1], faixa: faixaDoResultado(pesquisa, ordenados[1]) ?? 'centrao' } : null,
    }
  })
  const comDados = porUf.filter((e) => e.temperatura !== null)
  const pesoTotal = comDados.reduce((soma, e) => soma + (eleitorado[e.uf] ?? 1), 0)
  const temperatura = comDados.reduce((soma, e) => soma + (e.temperatura ?? 50) * (eleitorado[e.uf] ?? 1), 0) / pesoTotal
  const lideres = porUf.reduce((placar, e) => {
    if (e.lider) placar[ladoDaFaixa(e.lider.faixa)] += 1
    return placar
  }, placarVazio())
  return { temperatura, porUf, lideres }
}

const ladoDoAlinhamento: Record<(typeof senadoresContinuam)[number]['alinhamento'], Lado> = {
  'pró-Lula': 'esquerda',
  oposição: 'direita',
  '?': 'centro',
}

const senado = () => {
  const cadeiras = placarVazio()
  for (const senador of senadoresContinuam) cadeiras[ladoDoAlinhamento[senador.alinhamento]] += 1
  const continuam = { ...cadeiras }
  const disputa = UFS.map((uf) => {
    const pesquisa = ultimaPesquisa('senador', uf)
    if (!pesquisa) return { uf, pesquisa: null, eleitos: [] }
    const eleitos = [...pesquisa.resultados]
      .filter((r) => r.partido)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 2)
      .map((r) => ({ ...r, faixa: faixaDoResultado(pesquisa, r) ?? 'centrao' }))
    for (const eleito of eleitos) cadeiras[ladoDaFaixa(eleito.faixa)] += 1
    return { uf, pesquisa, eleitos }
  })
  return { temperatura: graus(cadeiras), cadeiras, continuam, disputa }
}

const siglaParaFaixa = (sigla: string): Faixa => {
  const partidos = sigla.split('/')
  const faixas = partidos.map(faixaDoPartido)
  return faixas.find((f) => f !== 'centrao') ?? 'centrao'
}

const camaraDeputados = () => {
  const projecao = camara.projecaoDiap
  const fonte = projecao ? projecao.porPartidoOuFederacao.map((p) => [p.sigla, p.medio] as const) : Object.entries(camara.atual.porPartido)
  const cadeiras = fonte.reduce((placar, [sigla, n]) => {
    placar[ladoDaFaixa(siglaParaFaixa(sigla))] += n
    return placar
  }, placarVazio())
  const atual = Object.entries(camara.atual.porPartido).reduce((placar, [sigla, n]) => {
    placar[ladoDaFaixa(faixaDoPartido(sigla))] += n
    return placar
  }, placarVazio())
  return { temperatura: graus(cadeiras), cadeiras, atual, usaProjecao: projecao !== null }
}

const faixasDoClima = [
  { ate: 40, nome: 'Frio', grito: 'A luta decide!' },
  { ate: 47, nome: 'Morno', grito: 'Dá pra virar!' },
  { ate: 53, nome: 'Empate', grito: 'Tudo em aberto!' },
  { ate: 60, nome: 'Esquentando', grito: 'Não dá pra relaxar!' },
  { ate: 101, nome: 'Quente', grito: 'Pra cima deles!' },
]

export const clima = (temperatura: number) => faixasDoClima.find((f) => temperatura < f.ate) ?? faixasDoClima[faixasDoClima.length - 1]

export const calcularTermometro = () => {
  const esferas = {
    presidente: presidente(),
    senado: senado(),
    governadores: governadores(),
    camara: camaraDeputados(),
  }
  const temperatura = media(Object.values(esferas).map((e) => e.temperatura))
  return { temperatura, esferas }
}

export const termometroDaUf = (uf: Uf) => {
  const { esferas } = calcularTermometro()
  const governo = esferas.governadores.porUf.find((e) => e.uf === uf)
  const senadoUf = esferas.senado.disputa.find((e) => e.uf === uf)
  const pesquisaSenado = senadoUf?.pesquisa ?? null
  const temperaturaSenado = pesquisaSenado ? graus(placarDaPesquisa(pesquisaSenado)) : null
  const temps = [governo?.temperatura, temperaturaSenado].filter(
    (t): t is number => t !== null && t !== undefined,
  )
  return {
    uf,
    temperatura: temps.length > 0 ? media(temps) : null,
    governo,
    senado: senadoUf,
    temperaturaSenado,
    candidatosGoverno: candidatos.filter((c) => c.uf === uf && c.cargo === 'governador'),
    candidatosSenado: candidatos.filter((c) => c.uf === uf && c.cargo === 'senador'),
  }
}

function media(valores: number[]) {
  return valores.length === 0 ? 50 : valores.reduce((a, b) => a + b, 0) / valores.length
}

function maisFrequente(valores: string[]) {
  const contagem = new Map<string, number>()
  for (const v of valores) contagem.set(v, (contagem.get(v) ?? 0) + 1)
  return [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

function dentroDaJanela(lista: Pesquisa[]) {
  const maisNova = lista[0]?.campoFim
  if (!maisNova) return []
  const limite = new Date(maisNova)
  limite.setDate(limite.getDate() - JANELA_DIAS)
  return lista.filter((p) => new Date(p.campoFim) >= limite)
}

function umaPorInstituto(lista: Pesquisa[]) {
  const vistos = new Set<string>()
  return lista.filter((p) => {
    if (vistos.has(p.instituto)) return false
    vistos.add(p.instituto)
    return true
  })
}
