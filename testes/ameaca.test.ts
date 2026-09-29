import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  ameacaNosGovernos,
  bancadaDoPartido,
  cadeirasDoSenado,
  eleitoradoSobAmeaca,
  leituraDoConfronto,
  type DisputaDoSenado,
} from '../src/lib/ameaca.ts'
import type { SenadorContinua } from '../src/lib/esquemas.ts'

describe('eleitorado sob ameaça', () => {
  const eleitorado = { SP: 30, RJ: 10, AC: 5, ZZ: 5, BR: 50 }

  it('soma os eleitores só dos estados informados', () => {
    const resultado = eleitoradoSobAmeaca(eleitorado, ['SP', 'AC'])
    assert.equal(resultado.eleitores, 35)
    assert.equal(resultado.estados, 2)
  })

  it('divide pelo total do Brasil sem contar o total duas vezes', () => {
    const resultado = eleitoradoSobAmeaca(eleitorado, ['SP', 'AC'])
    assert.equal(resultado.total, 50)
    assert.equal(resultado.pct, 70)
  })

  it('soma os estados e o exterior quando falta o total do Brasil', () => {
    const resultado = eleitoradoSobAmeaca({ SP: 30, RJ: 10, ZZ: 10 }, ['RJ'])
    assert.equal(resultado.total, 50)
    assert.equal(resultado.pct, 20)
  })

  it('dá zero quando nenhum estado está na lista', () => {
    assert.equal(eleitoradoSobAmeaca(eleitorado, []).pct, 0)
  })
})

describe('leitura de um confronto de 2º turno', () => {
  it('chama de empate técnico a diferença de até duas margens', () => {
    assert.equal(leituraDoConfronto(46, 42, 2), 'empate')
  })

  it('diz que a esquerda está à frente quando passa das duas margens', () => {
    assert.equal(leituraDoConfronto(48, 42, 2), 'frente')
  })

  it('diz que a esquerda está atrás quando perde por mais de duas margens', () => {
    assert.equal(leituraDoConfronto(40, 46, 2), 'atras')
  })
})

describe('governos sob ameaça', () => {
  const governos = [
    { uf: 'SP', faixaLider: 'extrema-direita', extremaFavorita: true, extremaNoPrimeiroTurno: true },
    { uf: 'PR', faixaLider: 'extrema-direita', extremaFavorita: false, extremaNoPrimeiroTurno: false },
    { uf: 'BA', faixaLider: 'frente-ampla', extremaFavorita: false, extremaNoPrimeiroTurno: false },
    { uf: 'TO', faixaLider: null, extremaFavorita: false, extremaNoPrimeiroTurno: false },
  ] as const

  it('lista os estados onde a extrema direita lidera', () => {
    assert.deepEqual(ameacaNosGovernos(governos).lidera, ['SP', 'PR'])
  })

  it('separa onde ela é favorita e onde pode levar no 1º turno', () => {
    const resultado = ameacaNosGovernos(governos)
    assert.deepEqual(resultado.favorita, ['SP'])
    assert.deepEqual(resultado.primeiroTurno, ['SP'])
  })

  it('lista os estados sem pesquisa', () => {
    assert.deepEqual(ameacaNosGovernos(governos).semPesquisa, ['TO'])
  })
})

describe('cadeiras do Senado em 2027', () => {
  const senador = (partidoAtual: string, alinhamento: SenadorContinua['alinhamento']): SenadorContinua => ({
    uf: 'SP',
    nome: 'Fulano',
    partidoAtual,
    alinhamento,
  })

  it('põe na extrema direita quem continua num partido de extrema direita, qualquer que seja o alinhamento', () => {
    const { contagem } = cadeirasDoSenado([senador('PL', 'oposição'), senador('PL', '?')], [])
    assert.equal(contagem['extrema-direita'], 2)
  })

  it('agrupa quem continua pelo alinhamento com o governo', () => {
    const { contagem } = cadeirasDoSenado([senador('PT', 'pró-Lula'), senador('MDB', 'pró-Lula'), senador('REPUBLICANOS', 'oposição'), senador('PSD', '?')], [])
    assert.equal(contagem['esquerda-e-aliados'], 2)
    assert.equal(contagem['outra-oposicao'], 1)
    assert.equal(contagem['centrao-ou-indefinido'], 1)
  })

  it('agrupa as vagas em disputa pela faixa dos dois primeiros da pesquisa', () => {
    const disputas: DisputaDoSenado[] = [
      { uf: 'SP', status: 'com-pesquisa', faixas: ['extrema-direita', 'direita-liberal'] },
      { uf: 'BA', status: 'com-pesquisa', faixas: ['frente-ampla', 'esquerda-radical'] },
      { uf: 'MG', status: 'com-pesquisa', faixas: ['centrao', 'extrema-direita'] },
    ]
    const { contagem } = cadeirasDoSenado([], disputas)
    assert.equal(contagem['extrema-direita'], 2)
    assert.equal(contagem['outra-oposicao'], 1)
    assert.equal(contagem['esquerda-e-aliados'], 2)
    assert.equal(contagem['centrao-ou-indefinido'], 1)
  })

  it('conta duas vagas sem pesquisa por estado sem pesquisa', () => {
    const { contagem } = cadeirasDoSenado([], [{ uf: 'TO', status: 'sem-pesquisa' }])
    assert.equal(contagem['sem-pesquisa'], 2)
  })

  it('trata como indefinida a vaga de pesquisa com menos de dois nomes classificados', () => {
    const { contagem } = cadeirasDoSenado([], [{ uf: 'AC', status: 'com-pesquisa', faixas: ['extrema-direita', null] }])
    assert.equal(contagem['extrema-direita'], 1)
    assert.equal(contagem['centrao-ou-indefinido'], 1)
  })

  it('ordena as cadeiras da extrema direita para a esquerda e diz quanto falta para a maioria', () => {
    const resultado = cadeirasDoSenado(
      [senador('PT', 'pró-Lula'), senador('PL', 'oposição')],
      [{ uf: 'TO', status: 'sem-pesquisa' }],
    )
    assert.deepEqual(resultado.cadeiras, ['extrema-direita', 'sem-pesquisa', 'sem-pesquisa', 'esquerda-e-aliados'])
    assert.equal(resultado.faltamParaMaioria, 40)
  })
})

describe('bancada de um partido na Câmara', () => {
  const camara = {
    atual: { porPartido: { PL: 98, PT: 65, UNIÃO: 52 } },
    projecaoDiap: {
      porPartidoOuFederacao: [
        { sigla: 'PP/União', min: 93, max: 121, medio: 107 },
        { sigla: 'PL', min: 78, max: 103, medio: 91 },
      ],
    },
  }

  it('dá a bancada de hoje e a faixa da projeção do DIAP', () => {
    const bancada = bancadaDoPartido(camara, 'PL')
    assert.equal(bancada.hoje, 98)
    assert.deepEqual(bancada.projecao, { min: 78, max: 103, medio: 91 })
  })

  it('diz se o partido tem hoje a maior bancada', () => {
    assert.equal(bancadaDoPartido(camara, 'PL').maiorHoje, true)
    assert.equal(bancadaDoPartido(camara, 'PT').maiorHoje, false)
  })

  it('não inventa projeção quando o DIAP não traz o partido', () => {
    assert.equal(bancadaDoPartido(camara, 'PT').projecao, null)
    assert.equal(bancadaDoPartido({ ...camara, projecaoDiap: null }, 'PL').projecao, null)
  })
})
