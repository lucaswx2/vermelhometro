import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  abrirCandidaturas,
  escreverEscolha,
  ESCOLHA_VAZIA,
  lerEscolha,
  linkDaColinha,
  montarColinha,
  opcoesDoCargo,
  colinhasDeClasse,
  paraOutroEstado,
  votar,
  type CandidaturasCompactas,
  type Escolha,
  type LinhaDaColinha,
} from '../src/componentes/colinha/escolha.ts'
import type { ColinhaDoPartido } from '../src/lib/colinhas.ts'

const vazio = (): ColinhaDoPartido => ({
  presidente: [],
  governador: [],
  senador: [],
  deputadoFederal: { legenda: null, candidatos: [] },
  deputadoEstadual: { legenda: null, candidatos: [] },
})

const opcao = (numero: number, nomeUrna: string, partido: string, tipo: 'proprio' | 'apoio' = 'proprio') => ({
  numero,
  nomeUrna,
  partido,
  situacao: 'deferido',
  tipo,
})

// Colinha de classe de um estado de mentira.
const classe = {
  PSTU: {
    ...vazio(),
    presidente: [opcao(16, 'HERTZ DIAS', 'PSTU')],
    senador: [opcao(160, 'WELLER', 'PSTU'), opcao(161, 'ELIANA', 'PSTU')],
    deputadoFederal: { legenda: 16, candidatos: [{ numero: 1616, nomeUrna: 'FULANA', situacao: 'sub judice (indeferido com recurso)' }] },
  },
  PCB: { ...vazio(), presidente: [opcao(21, 'EDMILSON COSTA', 'PCB')] },
  UP: { ...vazio(), senador: [opcao(800, 'MARCIO', 'UP')] },
  PSOL: { ...vazio(), presidente: [opcao(13, 'LULA', 'PT', 'apoio')] },
}

// Todas as candidaturas aptas do mesmo estado, como o navegador recebe.
const compactas: CandidaturasCompactas = {
  deputadoFederal: [
    [1616, 'FULANA', 'PSTU', 0, 'sub judice (indeferido com recurso)', null, 'sq1'],
    [1310, 'CICRANO', 'PT', 1, '', null, 'sq2'],
    [2222, 'BELTRANO', 'PL', 4, '', '/fotos/1.jpg', 'sq12'],
  ],
  deputadoEstadual: [[16000, 'ZEZINHA', 'PSTU', 0, '', null, 'sq3']],
  senador: [
    [160, 'WELLER', 'PSTU', 0, '', null, 'sq4'],
    [161, 'ELIANA', 'PSTU', 0, '', null, 'sq5'],
    [800, 'MARCIO', 'UP', 0, '', null, 'sq6'],
    [222, 'CAPITAO', 'PL', 4, '', null, 'sq7'],
  ],
  governador: [[16, 'ANA', 'PSTU', 0, '', null, 'sq8']],
  presidente: [
    [16, 'HERTZ DIAS', 'PSTU', 0, '', null, 'sq9'],
    [21, 'EDMILSON COSTA', 'PCB', 0, '', null, 'sq10'],
    [13, 'LULA', 'PT', 1, '', null, 'sq11'],
  ],
}

const opcoes = abrirCandidaturas(compactas)
const daClasse = colinhasDeClasse(classe)

const montar = (escolha: Partial<Escolha>, ehDf = false) => montarColinha({ ...ESCOLHA_VAZIA, ...escolha }, opcoes, daClasse, ehDf)

const linha = (linhas: LinhaDaColinha[], cargo: string) => {
  const achada = linhas.find((l) => l.cargo === cargo)
  assert.ok(achada)
  return achada
}

const numero = (l: LinhaDaColinha) => (l.tipo === 'escolhida' ? l.opcao.numero : null)
const aviso = (l: LinhaDaColinha) => (l.tipo === 'branco' ? null : l.aviso)

describe('a colinha sem escolha nenhuma', () => {
  it('traz os seis cargos vazios, na ordem da urna', () => {
    const linhas = montar({})
    assert.deepEqual(
      linhas.map((l) => l.cargo),
      ['deputadoFederal', 'deputadoEstadual', 'senador1', 'senador2', 'governador', 'presidente'],
    )
    assert.ok(linhas.every((l) => l.tipo === 'vazia'))
  })

  it('chama o cargo de distrital no Distrito Federal', () => {
    assert.match(linha(montar({}, true), 'deputadoEstadual').rotulo, /distrital/)
  })
})

describe('a colinha de classe', () => {
  it('usa o voto de legenda quando o partido tem candidatos ao cargo', () => {
    const federal = linha(montar({ partido: 'PSTU' }), 'deputadoFederal')
    assert.equal(numero(federal), 16)
    assert.ok(federal.tipo === 'escolhida' && federal.opcao.tipo === 'legenda')
  })

  it('preenche os dois votos para o Senado com os dois nomes do partido', () => {
    const linhas = montar({ partido: 'PSTU' })
    assert.equal(numero(linha(linhas, 'senador1')), 160)
    assert.equal(numero(linha(linhas, 'senador2')), 161)
  })

  it('não sugere legenda de partido sem candidatos, porque o voto seria nulo', () => {
    const federal = linha(montar({ partido: 'PCB' }), 'deputadoFederal')
    assert.equal(federal.tipo, 'vazia')
    assert.match(aviso(federal) ?? '', /seria nulo/)
  })

  it('mostra o apoio formal do partido quando ele não tem candidato próprio', () => {
    const presidente = linha(montar({ partido: 'PSOL' }), 'presidente')
    assert.equal(numero(presidente), 13)
    assert.match(aviso(presidente) ?? '', /Apoio do PSOL/)
  })

  it('deixa trocar um cargo e mantém os outros da classe', () => {
    const linhas = montar({ partido: 'PSTU', votos: { presidente: 13 } })
    assert.equal(numero(linha(linhas, 'presidente')), 13)
    assert.equal(numero(linha(linhas, 'deputadoFederal')), 16)
  })
})

describe('o voto escolhido cargo a cargo', () => {
  it('aceita candidatura de qualquer partido', () => {
    const federal = linha(montar({ votos: { deputadoFederal: 2222 } }), 'deputadoFederal')
    assert.ok(federal.tipo === 'escolhida')
    assert.equal(federal.opcao.nome, 'BELTRANO')
    assert.equal(federal.opcao.foto, '/fotos/1.jpg')
    assert.equal(federal.opcao.faixa, 'extrema-direita')
  })

  it('guarda o voto em branco', () => {
    assert.equal(linha(montar({ partido: 'PSTU', votos: { governador: 'branco' } }), 'governador').tipo, 'branco')
  })

  it('avisa quando a candidatura escolhida está sub judice', () => {
    const federal = linha(montar({ votos: { deputadoFederal: 1616 } }), 'deputadoFederal')
    assert.equal(numero(federal), 1616)
    assert.match(aviso(federal) ?? '', /Sub judice/)
  })

  it('avisa quando o número não é de nenhuma candidatura apta', () => {
    const governador = linha(montar({ votos: { governador: 99 } }), 'governador')
    assert.equal(governador.tipo, 'vazia')
    assert.match(aviso(governador) ?? '', /99/)
  })

  it('não deixa o mesmo senador nos dois votos', () => {
    const linhas = montar({ partido: 'PSTU', votos: { senador2: 160 } })
    assert.equal(numero(linha(linhas, 'senador1')), 160)
    assert.equal(linha(linhas, 'senador2').tipo, 'vazia')
    assert.match(aviso(linha(linhas, 'senador2')) ?? '', /outro nome/)
  })

  it('deixa de ser colinha recebida quando a pessoa troca um nome', () => {
    const recebida = { ...ESCOLHA_VAZIA, partido: 'UP' as const, recebida: true }
    assert.equal(votar(recebida, 'governador', 'branco').recebida, false)
  })
})

describe('as opções de cada cargo', () => {
  it('oferecem a legenda de cada partido que tem candidatos ao cargo', () => {
    const legendas = opcoesDoCargo(opcoes, 'deputadoFederal').filter((o) => o.tipo === 'legenda')
    assert.deepEqual(legendas.map((o) => [o.numero, o.nome]).sort(), [
      [13, 'Legenda PT'],
      [16, 'Legenda PSTU'],
      [22, 'Legenda PL'],
    ])
  })

  it('tiram do 2º voto para o Senado quem já está no 1º', () => {
    const linhas = montar({ votos: { senador1: 800 } })
    assert.ok(!opcoesDoCargo(opcoes, 'senador2', linhas).some((o) => o.numero === 800))
    assert.ok(opcoesDoCargo(opcoes, 'senador1', linhas).some((o) => o.numero === 800))
  })
})

describe('a escolha no endereço da página', () => {
  it('volta igual depois de escrita e lida', () => {
    const escolha: Escolha = { partido: 'UP', recebida: true, votos: { senador1: 800, governador: 'branco', deputadoFederal: 1616 } }
    assert.deepEqual(lerEscolha(escreverEscolha(escolha)), escolha)
  })

  it('lê os endereços feitos antes da busca', () => {
    assert.deepEqual(lerEscolha('#p=PSOL&s1=180&g=branco'), { partido: 'PSOL', recebida: false, votos: { senador1: 180, governador: 'branco' } })
  })

  it('ignora partido fora da lista de classe e números inválidos', () => {
    assert.deepEqual(lerEscolha('#p=PL&g=abc&pr=1'), ESCOLHA_VAZIA)
  })

  it('fica vazia quando não há escolha', () => {
    assert.equal(escreverEscolha(ESCOLHA_VAZIA), '')
  })
})

describe('o link da colinha', () => {
  it('marca a colinha como recebida', () => {
    assert.equal(lerEscolha(linkDaColinha({ ...ESCOLHA_VAZIA, partido: 'PCB' })).recebida, true)
  })

  it('leva para outro estado só o partido e o presidente', () => {
    const escolha: Escolha = { partido: 'PSOL', recebida: true, votos: { presidente: 13, governador: 16, senador1: 160 } }
    assert.deepEqual(paraOutroEstado(escolha), { partido: 'PSOL', recebida: false, votos: { presidente: 13 } })
  })
})
