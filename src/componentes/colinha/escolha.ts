import type { ColinhaDoPartido, Opcao } from '../../lib/colinhas.ts'
import { PARTIDOS_DE_CLASSE, type SiglaDeClasse } from '../../lib/partidosDeClasse.ts'

export type Cargo = 'deputadoFederal' | 'deputadoEstadual' | 'senador1' | 'senador2' | 'governador' | 'presidente'

export type Linha = {
  cargo: Cargo
  rotulo: string
  digitos: string
  numero: number | null
  nome: string | null
  aviso: string | null
  escolhas: { valor: string; rotulo: string }[]
}

export type Escolha = { partido: SiglaDeClasse | null } & Partial<Record<Cargo, string>>

const CHAVES: Record<Cargo, string> = {
  deputadoFederal: 'f',
  deputadoEstadual: 'e',
  senador1: 's1',
  senador2: 's2',
  governador: 'g',
  presidente: 'pr',
}

const ehSigla = (valor: string | null): valor is SiglaDeClasse => PARTIDOS_DE_CLASSE.some((p) => p.sigla === valor)

// A escolha vive no fragmento (#) da URL: nunca vai para um servidor.
export const lerEscolha = (hash: string): Escolha => {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const partido = params.get('p')
  const escolha: Escolha = { partido: ehSigla(partido) ? partido : null }
  for (const [cargo, chave] of Object.entries(CHAVES) as [Cargo, string][]) {
    const valor = params.get(chave)
    if (valor) escolha[cargo] = valor
  }
  return escolha
}

export const escreverEscolha = (escolha: Escolha) => {
  const params = new URLSearchParams()
  if (escolha.partido) params.set('p', escolha.partido)
  for (const [cargo, chave] of Object.entries(CHAVES) as [Cargo, string][]) {
    const valor = escolha[cargo]
    if (valor) params.set(chave, valor)
  }
  return `#${params.toString()}`
}

const avisoDaSituacao = (situacao: string) =>
  situacao.startsWith('sub judice') ? 'Sub judice: o voto pode ser anulado se o registro for negado.' : null

const rotuloOpcao = (o: Opcao) => `${o.numero} · ${o.nomeUrna} (${o.partido})`

const outrasDeClasse = (todas: Partial<Record<SiglaDeClasse, ColinhaDoPartido>>, partido: SiglaDeClasse, cargo: 'presidente' | 'governador' | 'senador') =>
  PARTIDOS_DE_CLASSE.filter((p) => p.sigla !== partido).flatMap((p) => (todas[p.sigla]?.[cargo] ?? []).filter((o) => o.tipo === 'proprio'))

const semRepetir = (opcoes: Opcao[]) => [...new Map(opcoes.map((o) => [o.numero, o])).values()]

const linhaMajoritaria = (
  cargo: Cargo,
  rotulo: string,
  digitos: string,
  doPartido: Opcao[],
  outras: Opcao[],
  escolhido: string | undefined,
  padrao: Opcao | undefined,
  partido: SiglaDeClasse,
): Linha => {
  const todas = semRepetir([...doPartido, ...outras])
  const selecionada = escolhido === 'branco' ? undefined : todas.find((o) => String(o.numero) === escolhido) ?? padrao
  const avisoApoio = selecionada?.tipo === 'apoio' ? `Apoio do ${partido} (coligação): o partido não tem candidatura própria.` : null
  const semNada = selecionada
    ? null
    : doPartido.length === 0
      ? `O ${partido} não tem candidatura aqui. Escolha outra opção de classe ou deixe em branco.`
      : 'Outra opção de classe ou em branco.'
  return {
    cargo,
    rotulo,
    digitos,
    numero: selecionada?.numero ?? null,
    nome: selecionada ? `${selecionada.nomeUrna} · ${selecionada.partido}` : null,
    aviso: [avisoApoio, selecionada ? avisoDaSituacao(selecionada.situacao) : null, semNada].filter(Boolean).join(' ') || null,
    escolhas: [...todas.map((o) => ({ valor: String(o.numero), rotulo: rotuloOpcao(o) })), { valor: 'branco', rotulo: 'Deixar em branco' }],
  }
}

const linhaProporcional = (
  cargo: Cargo,
  rotulo: string,
  digitos: string,
  todas: Partial<Record<SiglaDeClasse, ColinhaDoPartido>>,
  partido: SiglaDeClasse,
  chave: 'deputadoFederal' | 'deputadoEstadual',
  escolhido: string | undefined,
): Linha => {
  const doPartido = todas[partido]?.[chave]
  const legendas = PARTIDOS_DE_CLASSE.filter((p) => todas[p.sigla]?.[chave].legenda != null).map((p) => ({
    valor: String(p.numero),
    rotulo: `${p.numero} · voto na legenda ${p.sigla}`,
  }))
  const candidatos = (doPartido?.candidatos ?? []).map((c) => ({ valor: String(c.numero), rotulo: `${c.numero} · ${c.nomeUrna}`, situacao: c.situacao }))
  const padrao = doPartido?.legenda != null ? String(doPartido.legenda) : undefined
  const valor = escolhido === 'branco' ? undefined : escolhido ?? padrao
  const legenda = legendas.find((l) => l.valor === valor)
  const candidato = candidatos.find((c) => c.valor === valor)
  const semCandidatos = doPartido?.legenda == null ? `O ${partido} não tem candidatos a este cargo aqui: o voto na legenda ${partido} seria nulo.` : null
  return {
    cargo,
    rotulo,
    digitos,
    numero: legenda || candidato ? Number(valor) : null,
    nome: legenda ? `Legenda ${PARTIDOS_DE_CLASSE.find((p) => String(p.numero) === valor)?.sigla ?? ''}` : candidato ? candidato.rotulo.split(' · ')[1] : null,
    aviso: [candidato ? avisoDaSituacao(candidato.situacao) : null, !legenda && !candidato ? semCandidatos : null].filter(Boolean).join(' ') || null,
    escolhas: [...legendas, ...candidatos.map(({ valor: v, rotulo: r }) => ({ valor: v, rotulo: r })), { valor: 'branco', rotulo: 'Deixar em branco' }],
  }
}

export const montarLinhas = (
  todas: Partial<Record<SiglaDeClasse, ColinhaDoPartido>>,
  escolha: Escolha & { partido: SiglaDeClasse },
  ehDf: boolean,
): Linha[] => {
  const { partido } = escolha
  const doPartido = todas[partido]
  const senadores = doPartido?.senador ?? []
  const outrasSenado = outrasDeClasse(todas, partido, 'senador')
  const linhas = [
    linhaProporcional('deputadoFederal', 'Deputado(a) federal', '4 dígitos ou 2 da legenda', todas, partido, 'deputadoFederal', escolha.deputadoFederal),
    linhaProporcional(
      'deputadoEstadual',
      ehDf ? 'Deputado(a) distrital' : 'Deputado(a) estadual',
      '5 dígitos ou 2 da legenda',
      todas,
      partido,
      'deputadoEstadual',
      escolha.deputadoEstadual,
    ),
    linhaMajoritaria('senador1', 'Senador(a) · 1º voto', '3 dígitos', senadores, outrasSenado, escolha.senador1, senadores[0], partido),
    linhaMajoritaria('senador2', 'Senador(a) · 2º voto', '3 dígitos', senadores, outrasSenado, escolha.senador2, senadores[1], partido),
    linhaMajoritaria('governador', 'Governador(a)', '2 dígitos', doPartido?.governador ?? [], outrasDeClasse(todas, partido, 'governador'), escolha.governador, doPartido?.governador[0], partido),
    linhaMajoritaria('presidente', 'Presidente', '2 dígitos', doPartido?.presidente ?? [], outrasDeClasse(todas, partido, 'presidente'), escolha.presidente, doPartido?.presidente[0], partido),
  ]
  // O mesmo senador nos dois votos anula o 2º voto.
  const [, , s1, s2] = linhas
  s2.escolhas = s2.escolhas.filter((e) => e.valor !== String(s1.numero))
  if (s1.numero !== null && s2.numero === s1.numero) Object.assign(s2, { numero: null, nome: null, aviso: 'Escolha outro nome para o 2º voto ou deixe em branco.' })
  s1.escolhas = s1.escolhas.filter((e) => e.valor === 'branco' || e.valor !== String(s2.numero))
  return linhas
}

export const textoDaColinha = (linhas: Linha[], estado: string, url: string) =>
  [
    `COLINHA DE CLASSE · ${estado.toUpperCase()} · 4/10`,
    ...linhas.map((l) => `${l.rotulo}: ${l.numero ?? '—'}${l.nome ? ` (${l.nome})` : ''}`),
    '',
    'Celular é proibido na cabine: leve no papel.',
    'Confira os números no TSE: divulgacandcontas.tse.jus.br',
    url,
  ].join('\n')
