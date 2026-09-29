import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buscar, girarPelaLetra, letraDaVez } from '../src/componentes/colinha/busca.ts'
import type { Opcao } from '../src/componentes/colinha/escolha.ts'
import type { Faixa } from '../src/lib/faixas.ts'

const candidata = (numero: number, nome: string, partido: string, faixa: Faixa): Opcao => ({
  tipo: 'candidatura',
  numero,
  nome,
  partido,
  faixa,
  situacao: '',
  foto: null,
})

const opcoes: Opcao[] = [
  candidata(160, 'WELLER GONÇALVES', 'PSTU', 'esquerda-radical'),
  candidata(808, 'MAÍRA DE SOUZA', 'UP', 'esquerda-radical'),
  candidata(211, 'PETTER MAAHS', 'PCB', 'esquerda-radical'),
  candidata(180, 'MARINA SILVA', 'REDE', 'frente-ampla'),
  candidata(400, 'SIMONE TEBET', 'PSB', 'frente-ampla'),
  candidata(222, 'CAPITÃO FULANO', 'PL', 'extrema-direita'),
  candidata(555, 'BELTRANO', 'PSD', 'centrao'),
  { tipo: 'legenda', numero: 16, nome: 'Legenda PSTU', partido: 'PSTU', faixa: 'esquerda-radical', situacao: '', foto: null },
]

const nomes = (lista: Opcao[]) => lista.map((o) => o.nome)

describe('a prioridade da esquerda na busca', () => {
  it('separa esquerda socialista, PT e aliados e outros partidos', () => {
    const grupos = buscar(opcoes, '', 0)
    assert.equal(grupos.esquerda.length, 4)
    assert.deepEqual(nomes(grupos.ampla).sort(), ['MARINA SILVA', 'SIMONE TEBET'])
    assert.deepEqual(nomes(grupos.outros).sort(), ['BELTRANO', 'CAPITÃO FULANO'])
  })

  it('põe o voto de legenda antes das candidaturas do grupo', () => {
    assert.equal(buscar(opcoes, '', 3).esquerda[0].tipo, 'legenda')
  })
})

describe('a ordem dentro de cada grupo', () => {
  const chave = (s: string) => s

  it('começa pela letra da vez e dá a volta no alfabeto', () => {
    assert.deepEqual(girarPelaLetra(['ANA', 'BIA', 'CAIO', 'DUDA'], chave, 'C'), ['CAIO', 'DUDA', 'ANA', 'BIA'])
  })

  it('volta ao começo quando nenhum nome vem depois da letra', () => {
    assert.deepEqual(girarPelaLetra(['BIA', 'ANA'], chave, 'Z'), ['ANA', 'BIA'])
  })

  it('dá a mesma ordem para a mesma semente', () => {
    assert.deepEqual(buscar(opcoes, '', 7), buscar(opcoes, '', 7))
  })

  it('muda quem vem primeiro quando a semente muda', () => {
    const primeiros = new Set(Array.from({ length: 26 }, (_, i) => buscar(opcoes, '', i).esquerda[1].nome))
    assert.equal(primeiros.size, 3)
  })

  it('sorteia uma letra de A a Z', () => {
    assert.equal(letraDaVez(0), 'A')
    assert.equal(letraDaVez(27), 'B')
    assert.match(letraDaVez(-5), /^[A-Z]$/)
  })
})

describe('o termo da busca', () => {
  it('acha pelo nome sem ligar para acento nem caixa', () => {
    assert.deepEqual(nomes(buscar(opcoes, 'maira', 0).esquerda), ['MAÍRA DE SOUZA'])
  })

  it('acha pelo começo do número', () => {
    assert.deepEqual(nomes(buscar(opcoes, '40', 0).ampla), ['SIMONE TEBET'])
  })

  it('acha pelo partido', () => {
    const grupos = buscar(opcoes, 'pstu', 0)
    assert.deepEqual(nomes(grupos.esquerda).sort(), ['Legenda PSTU', 'WELLER GONÇALVES'])
    assert.equal(grupos.outros.length, 0)
  })
})
