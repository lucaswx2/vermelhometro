import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { escreverEscolha, lerEscolha, montarLinhas } from '../src/componentes/colinha/escolha.ts'
import type { ColinhaDoPartido } from '../src/lib/colinhas.ts'

const vazio = (): ColinhaDoPartido => ({
  presidente: [],
  governador: [],
  senador: [],
  deputadoFederal: { legenda: null, candidatos: [] },
  deputadoEstadual: { legenda: null, candidatos: [] },
})

const candidato = (numero: number, nomeUrna: string, partido: string, tipo: 'proprio' | 'apoio' = 'proprio', situacao = 'deferido') => ({
  numero,
  nomeUrna,
  partido,
  situacao,
  tipo,
})

const estado = {
  PSTU: {
    ...vazio(),
    presidente: [candidato(16, 'HERTZ DIAS', 'PSTU')],
    senador: [candidato(160, 'WELLER', 'PSTU')],
    deputadoFederal: { legenda: 16, candidatos: [{ numero: 1616, nomeUrna: 'FULANA', situacao: 'sub judice (indeferido com recurso)' }] },
    deputadoEstadual: { legenda: 16, candidatos: [] },
  },
  PCB: { ...vazio(), presidente: [candidato(21, 'EDMILSON COSTA', 'PCB')] },
  UP: { ...vazio(), senador: [candidato(800, 'MARCIO', 'UP')] },
  PSOL: { ...vazio(), presidente: [candidato(13, 'LULA', 'PT', 'apoio')] },
}

const linha = (linhas: ReturnType<typeof montarLinhas>, cargo: string) => {
  const achada = linhas.find((l) => l.cargo === cargo)
  assert.ok(achada)
  return achada
}

describe('a colinha de voto de classe', () => {
  it('usa o voto de legenda quando o partido tem candidatos ao cargo', () => {
    const linhas = montarLinhas(estado, { partido: 'PSTU' }, false)
    assert.equal(linha(linhas, 'deputadoFederal').numero, 16)
  })

  it('não sugere legenda de partido sem candidatos, porque o voto seria nulo', () => {
    const federal = linha(montarLinhas(estado, { partido: 'PCB' }, false), 'deputadoFederal')
    assert.equal(federal.numero, null)
    assert.match(federal.aviso ?? '', /seria nulo/)
    assert.ok(!federal.escolhas.some((e) => e.valor === '21'))
  })

  it('mostra o apoio formal do partido quando ele não tem candidato próprio', () => {
    const presidente = linha(montarLinhas(estado, { partido: 'PSOL' }, false), 'presidente')
    assert.equal(presidente.numero, 13)
    assert.match(presidente.aviso ?? '', /Apoio do PSOL/)
  })

  it('oferece candidatos de outros partidos de classe quando falta candidatura', () => {
    const senado = linha(montarLinhas(estado, { partido: 'PCB' }, false), 'senador1')
    assert.equal(senado.numero, null)
    assert.ok(senado.escolhas.some((e) => e.valor === '800'))
  })

  it('não deixa o mesmo senador nos dois votos', () => {
    const linhas = montarLinhas(estado, { partido: 'PSTU', senador2: '160' }, false)
    assert.equal(linha(linhas, 'senador1').numero, 160)
    assert.equal(linha(linhas, 'senador2').numero, null)
    assert.ok(!linha(linhas, 'senador2').escolhas.some((e) => e.valor === '160'))
  })

  it('avisa quando a candidatura escolhida está sub judice', () => {
    const federal = linha(montarLinhas(estado, { partido: 'PSTU', deputadoFederal: '1616' }, false), 'deputadoFederal')
    assert.equal(federal.numero, 1616)
    assert.match(federal.aviso ?? '', /Sub judice/)
  })

  it('chama o cargo de distrital no Distrito Federal', () => {
    assert.match(linha(montarLinhas(estado, { partido: 'PSTU' }, true), 'deputadoEstadual').rotulo, /distrital/)
  })
})

describe('a escolha no endereço da página', () => {
  it('volta igual depois de escrita e lida', () => {
    const escolha = { partido: 'UP' as const, senador1: '800', governador: 'branco' }
    assert.deepEqual(lerEscolha(escreverEscolha(escolha)), escolha)
  })

  it('ignora partido fora da lista de classe', () => {
    assert.equal(lerEscolha('#p=PL').partido, null)
  })
})
