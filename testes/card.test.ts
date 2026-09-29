import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  FORMATOS,
  enderecoDoEstado,
  linhaLegal,
  nomeDaLinha,
  nomeDoArquivo,
  numeroDaLinha,
  siglaDaLinha,
  tamanhoDaPrevia,
  tamanhoDoNumero,
  truncar,
} from '../src/componentes/card/formato.ts'

describe('os formatos do card', () => {
  it('usa 1080×1350 no feed e 1080×1920 nos stories', () => {
    assert.deepEqual([FORMATOS.feed.largura, FORMATOS.feed.altura], [1080, 1350])
    assert.deepEqual([FORMATOS.stories.largura, FORMATOS.stories.altura], [1080, 1920])
  })

  it('reduz a prévia mantendo a proporção do formato', () => {
    for (const formato of ['feed', 'stories'] as const) {
      const previa = tamanhoDaPrevia(formato)
      assert.ok(previa.escala < 1)
      assert.equal(previa.largura, Math.round(FORMATOS[formato].largura * previa.escala))
      assert.equal(previa.altura, Math.round(FORMATOS[formato].altura * previa.escala))
    }
  })

  it('não deixa a prévia dos stories mais alta que a tela comporta', () => {
    assert.ok(tamanhoDaPrevia('stories').altura <= 480)
    assert.ok(tamanhoDaPrevia('feed').largura <= 324)
  })
})

describe('o arquivo do card', () => {
  it('leva a UF em minúsculas e o formato no nome', () => {
    assert.equal(nomeDoArquivo('SP', 'feed'), 'colinha-sp-feed.png')
    assert.equal(nomeDoArquivo('df', 'stories'), 'colinha-df-stories.png')
  })

  it('aponta para a página do estado', () => {
    assert.equal(enderecoDoEstado('RJ'), 'vermelhometro.vercel.app/estado/rj')
  })

  it('credita o TSE e o autor na linha legal', () => {
    const texto = linhaLegal('28/09')
    assert.match(texto, /números do TSE de 28\/09/)
    assert.match(texto, /fotos: TSE \(CC-BY\)/)
    assert.match(texto, /Lucas Freitas, pessoa física/)
    assert.match(texto, /não é material oficial de candidato, partido ou TSE/)
  })
})

describe('uma linha do card', () => {
  it('diz "em branco" quando não há número', () => {
    assert.equal(nomeDaLinha({ numero: null, nome: 'FULANA' }), 'em branco')
    assert.equal(numeroDaLinha({ numero: null }), '—')
  })

  it('mostra o nome e o número escolhidos', () => {
    assert.equal(nomeDaLinha({ numero: 160, nome: 'WELLER' }), 'WELLER')
    assert.equal(numeroDaLinha({ numero: 160 }), '160')
  })

  it('usa o partido como sigla do quadro sem foto', () => {
    assert.equal(siglaDaLinha({ partido: 'PSTU', nome: 'HERTZ DIAS' }), 'PSTU')
  })

  it('tira a sigla do voto de legenda quando o partido não vem', () => {
    assert.equal(siglaDaLinha({ partido: null, nome: 'Legenda PSOL' }), 'PSOL')
  })

  it('fica sem sigla quando não há partido nem legenda', () => {
    assert.equal(siglaDaLinha({ partido: null, nome: null }), null)
  })

  it('diminui o número de cinco dígitos para caber no quadro', () => {
    assert.ok(tamanhoDoNumero('50123', 'feed') < tamanhoDoNumero('50', 'feed'))
    assert.ok(tamanhoDoNumero('50123', 'stories') < tamanhoDoNumero('50', 'stories'))
  })
})

describe('o corte de textos longos', () => {
  it('mantém textos que cabem', () => {
    assert.equal(truncar('LULA', 10), 'LULA')
  })

  it('corta com reticências sem passar do limite', () => {
    const cortado = truncar('MARIA DAS GRAÇAS FOSTER DA SILVA SAURO', 20)
    assert.equal(cortado.length, 20)
    assert.ok(cortado.endsWith('…'))
  })

  it('não deixa espaço antes das reticências', () => {
    assert.equal(truncar('ANA MARIA BRAGA', 5), 'ANA…')
  })
})
