import { candidatos, pesquisas, camara, eleitorado, senadoresContinuam } from './dados'
import type { Candidato, Pesquisa } from './esquemas'
import { UFS, type Uf } from './estados'
import { faixaDoPartido, ladoDaFaixa, normalizar, type Faixa, type Lado } from './faixas'
import { ameacaNosGovernos, eleitoradoSobAmeaca, type DisputaDoSenado, type GovernoNaAmeaca } from './ameaca'

type Contagem = Record<Lado, number>

const contagemVazia = (): Contagem => ({ esquerda: 0, centro: 0, direita: 0 })

type Resultado = Pesquisa['resultados'][number]

const candidatoDoResultado = (pesquisa: Pesquisa, resultado: Resultado): Candidato | undefined => {
  const doCargo = candidatos.filter((c) => c.cargo === pesquisa.cargo && c.uf === pesquisa.uf)
  const nome = normalizar(resultado.nomeUrna)
  const exato = doCargo.find((c) => normalizar(c.nomeUrna) === nome)
  if (exato) return exato
  const tokens = nome.split(' ').filter((t) => t.length > 2)
  return doCargo.find(
    (c) => normalizar(c.partido) === normalizar(resultado.partido ?? '') && tokens.some((t) => normalizar(c.nomeUrna).includes(t)),
  )
}

// Duas camadas, sempre rotuladas: o partido do candidato e o alinhamento real (coligação).
export type Classificacao = { faixaPartido: Faixa; faixa: Faixa; motivo: string | null; candidato: Candidato | undefined }

export const classificar = (pesquisa: Pesquisa, resultado: Resultado): Classificacao | null => {
  if (!resultado.partido) return null
  const candidato = candidatoDoResultado(pesquisa, resultado)
  const faixaPartido = faixaDoPartido(resultado.partido)
  const faixa = candidato?.faixa ?? faixaPartido
  return { faixaPartido, faixa, motivo: candidato?.overrideMotivo || null, candidato }
}

const maisRecentePrimeiro = (a: Pesquisa, b: Pesquisa) => b.campoFim.localeCompare(a.campoFim)

export const ultimaPesquisa = (cargo: Pesquisa['cargo'], uf: string, turno: 1 | 2 = 1) =>
  pesquisas.filter((p) => p.cargo === cargo && p.uf === uf && p.turno === turno).sort(maisRecentePrimeiro)[0]

const comPartido = (pesquisa: Pick<Pesquisa, 'resultados'>) =>
  pesquisa.resultados.filter((r) => r.partido).sort((a, b) => b.pct - a.pct)

// ---------- Presidente ----------

const JANELA_DIAS = 21

const chaveDoConfronto = (p: Pesquisa) =>
  comPartido(p)
    .map((r) => normalizar(r.partido ?? ''))
    .sort()
    .join('|')

export const placarPresidente = () => {
  const primeiroTurno = pesquisas.filter((p) => p.cargo === 'presidente' && p.turno === 1).sort(maisRecentePrimeiro)
  const finalistas = comPartido(primeiroTurno[0] ?? { resultados: [] })
    .slice(0, 2)
    .map((r) => normalizar(r.partido ?? ''))
    .sort()
    .join('|')
  const segundoTurno = pesquisas
    .filter((p) => p.cargo === 'presidente' && p.turno === 2 && chaveDoConfronto(p) === finalistas)
    .sort(maisRecentePrimeiro)
  const recentes = umaPorInstituto(dentroDaJanela(segundoTurno))
  const confrontos = recentes.map((p) => {
    const [a, b] = comPartido(p)
    const esquerda = ladoDaFaixa(faixaDoPartido(a.partido ?? '')) === 'esquerda' ? a : b
    const direita = esquerda === a ? b : a
    return { pesquisa: p, esquerda, direita }
  })
  const validosEsquerda = media(confrontos.map((c) => (100 * c.esquerda.pct) / (c.esquerda.pct + c.direita.pct)))
  const margemMedia = media(recentes.map((p) => p.margemPp))
  const diferenca = 2 * validosEsquerda - 100
  return {
    confrontos,
    nomes: confrontos[0] ? { esquerda: confrontos[0].esquerda.nomeUrna, direita: confrontos[0].direita.nomeUrna } : null,
    validosEsquerda,
    situacao: Math.abs(diferenca) <= 2 * margemMedia ? 'empate' : diferenca > 0 ? 'frente' : 'atras',
  } as const
}

// ---------- Governos ----------

export type Situacao = 'favorita' | 'na disputa' | 'atras' | 'sem candidato' | 'sem pesquisa'

const situacaoDoCampo = (pesquisa: Pesquisa, doCampo: (c: Classificacao) => boolean): { situacao: Situacao; nome: string | null } => {
  const ordenados = comPartido(pesquisa)
  const indice = ordenados.findIndex((r) => {
    const c = classificar(pesquisa, r)
    return c !== null && doCampo(c)
  })
  if (indice === -1) return { situacao: 'sem candidato', nome: null }
  const candidato = ordenados[indice]
  const empateLimite = 2 * pesquisa.margemPp
  if (indice === 0) {
    const vantagem = candidato.pct - (ordenados[1]?.pct ?? 0)
    return { situacao: vantagem > empateLimite ? 'favorita' : 'na disputa', nome: candidato.nomeUrna }
  }
  const segundo = ordenados[1]?.pct ?? 0
  return { situacao: segundo - candidato.pct <= empateLimite ? 'na disputa' : 'atras', nome: candidato.nomeUrna }
}

const extremaPodeLevarNoPrimeiroTurno = (pesquisa: Pesquisa) => {
  const ordenados = comPartido(pesquisa)
  const total = ordenados.reduce((s, r) => s + r.pct, 0)
  const lider = ordenados[0]
  const classe = lider ? classificar(pesquisa, lider) : null
  return lider !== undefined && classe?.faixa === 'extrema-direita' && (100 * lider.pct) / total > 50 - pesquisa.margemPp
    ? lider.nomeUrna
    : null
}

export const governoDaUf = (uf: Uf) => {
  const pesquisa = ultimaPesquisa('governador', uf)
  if (!pesquisa) return { uf, pesquisa: null, esquerda: { situacao: 'sem pesquisa' as Situacao, nome: null }, aliados: { situacao: 'sem pesquisa' as Situacao, nome: null }, lider: null, alertaExtrema: null }
  const lider = comPartido(pesquisa)[0]
  return {
    uf,
    pesquisa,
    esquerda: situacaoDoCampo(pesquisa, (c) => ladoDaFaixa(c.faixaPartido) === 'esquerda'),
    aliados: situacaoDoCampo(pesquisa, (c) => ladoDaFaixa(c.faixa) === 'esquerda'),
    lider: lider ? { ...lider, classe: classificar(pesquisa, lider) } : null,
    alertaExtrema: extremaPodeLevarNoPrimeiroTurno(pesquisa),
  }
}

export const placarGovernos = () => {
  const porUf = UFS.map(governoDaUf)
  const conta = (campo: 'esquerda' | 'aliados', situacao: Situacao) => porUf.filter((e) => e[campo].situacao === situacao).length
  return {
    porUf,
    esquerda: { favorita: conta('esquerda', 'favorita'), disputa: conta('esquerda', 'na disputa') },
    aliados: { favorita: conta('aliados', 'favorita'), disputa: conta('aliados', 'na disputa') },
    semPesquisa: porUf.filter((e) => e.pesquisa === null).map((e) => e.uf),
  }
}

// ---------- Senado ----------

export const senadoDaUf = (uf: Uf) => {
  const pesquisa = ultimaPesquisa('senador', uf)
  if (!pesquisa) return { uf, pesquisa: null, eleitos: [] }
  const eleitos = comPartido(pesquisa)
    .slice(0, 2)
    .map((r) => ({ ...r, classe: classificar(pesquisa, r) }))
  return { uf, pesquisa, eleitos }
}

export const placarSenado = () => {
  const porPartido = contagemVazia()
  const comAliados = contagemVazia()
  for (const s of senadoresContinuam) {
    porPartido[ladoDaFaixa(faixaDoPartido(s.partidoAtual))] += 1
    comAliados[s.alinhamento === 'pró-Lula' ? 'esquerda' : s.alinhamento === 'oposição' ? 'direita' : 'centro'] += 1
  }
  const disputa = UFS.map(senadoDaUf)
  for (const { eleitos } of disputa) {
    for (const e of eleitos) {
      if (!e.classe) continue
      porPartido[ladoDaFaixa(e.classe.faixaPartido)] += 1
      comAliados[ladoDaFaixa(e.classe.faixa)] += 1
    }
  }
  const semPesquisa = disputa.filter((d) => d.pesquisa === null).map((d) => d.uf)
  return { porPartido, comAliados, semPesquisa, cadeirasEmJogo: 54 }
}

// ---------- Câmara ----------

const IMPEACHMENT_BLOQUEIO = 172

export const placarCamara = () => {
  const ladoDaSigla = (sigla: string): Lado => {
    const faixas = sigla.split('/').map(faixaDoPartido)
    return ladoDaFaixa(faixas.find((f) => f !== 'centrao') ?? 'centrao')
  }
  const atual = Object.entries(camara.atual.porPartido).reduce((c, [sigla, n]) => {
    c[ladoDaSigla(sigla)] += n
    return c
  }, contagemVazia())
  const projecao = camara.projecaoDiap
  const projetada = projecao?.porPartidoOuFederacao.reduce(
    (c, p) => {
      const lado = ladoDaSigla(p.sigla)
      c.medio[lado] += p.medio
      c.min[lado] += p.min ?? p.medio
      c.max[lado] += p.max ?? p.medio
      return c
    },
    { medio: contagemVazia(), min: contagemVazia(), max: contagemVazia() },
  )
  return { atual, projetada: projetada ?? null, impeachment: IMPEACHMENT_BLOQUEIO }
}

// ---------- Ameaça ----------

const daExtrema = (c: Classificacao) => c.faixa === 'extrema-direita'

export const governosNaAmeaca = () =>
  UFS.map((uf) => {
    const governo = governoDaUf(uf)
    return {
      uf,
      nomeLider: governo.lider?.nomeUrna ?? null,
      faixaLider: governo.lider?.classe?.faixa ?? null,
      extremaFavorita: governo.pesquisa !== null && situacaoDoCampo(governo.pesquisa, daExtrema).situacao === 'favorita',
      extremaNoPrimeiroTurno: governo.alertaExtrema !== null,
    } satisfies GovernoNaAmeaca & { nomeLider: string | null }
  })

// Onde a extrema direita lidera para governador e quantos eleitores vivem lá.
export const ameacaNosEstados = () => {
  const governos = governosNaAmeaca()
  const resumo = ameacaNosGovernos(governos)
  return { governos, ...resumo, eleitorado: eleitoradoSobAmeaca(eleitorado, resumo.lidera) }
}

export const disputasDoSenado = () =>
  UFS.map(senadoDaUf).map(({ uf, pesquisa, eleitos }): DisputaDoSenado =>
    pesquisa === null ? { uf, status: 'sem-pesquisa' } : { uf, status: 'com-pesquisa', faixas: eleitos.map((e) => e.classe?.faixa ?? null) },
  )

export const primeiroTurnoPresidente = () => {
  const pesquisa = pesquisas.filter((p) => p.cargo === 'presidente' && p.turno === 1).sort(maisRecentePrimeiro)[0]
  return pesquisa ? { pesquisa, lideres: comPartido(pesquisa).slice(0, 2) } : null
}

function media(valores: number[]) {
  return valores.length === 0 ? 50 : valores.reduce((a, b) => a + b, 0) / valores.length
}

function dentroDaJanela(pesquisas: Pesquisa[]) {
  const maisNova = pesquisas[0]?.campoFim
  if (!maisNova) return []
  const limite = new Date(maisNova)
  limite.setDate(limite.getDate() - JANELA_DIAS)
  return pesquisas.filter((p) => new Date(p.campoFim) >= limite)
}

function umaPorInstituto(pesquisas: Pesquisa[]) {
  const vistos = new Set<string>()
  return pesquisas.filter((p) => {
    if (vistos.has(p.instituto)) return false
    vistos.add(p.instituto)
    return true
  })
}
