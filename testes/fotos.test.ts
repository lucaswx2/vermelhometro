import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ehJpeg, hashesRepetidos, sqDaFoto } from '../scripts/fotos.ts'

describe('sqDaFoto', () => {
  it('extrai o SQ_CANDIDATO do nome de arquivo do zip do TSE', () => {
    assert.equal(sqDaFoto('FBR280002552484_div.jpg'), '280002552484')
    assert.equal(sqDaFoto('FSP250002549705_div.jpg'), '250002549705')
  })

  it('aceita a extensão em maiúsculas e ignora pastas no caminho', () => {
    assert.equal(sqDaFoto('fotos/FAC10001234567_div.JPG'), '10001234567')
  })

  it('devolve null para arquivos que não são foto', () => {
    assert.equal(sqDaFoto('leiame.pdf'), null)
    assert.equal(sqDaFoto('FSP123_nao.jpg'), null)
  })
})

describe('ehJpeg', () => {
  it('reconhece os bytes mágicos de JPEG', () => {
    assert.equal(ehJpeg(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0])), true)
  })

  it('recusa PNG, HTML e arquivo vazio', () => {
    assert.equal(ehJpeg(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), false)
    assert.equal(ehJpeg(new TextEncoder().encode('<html>')), false)
    assert.equal(ehJpeg(new Uint8Array()), false)
  })
})

describe('hashesRepetidos', () => {
  it('aponta o hash que se repete a partir do limite, sinal de imagem genérica', () => {
    const hashes = ['a', 'b', 'x', 'x', 'c', 'x']
    assert.deepEqual([...hashesRepetidos(hashes, 3)], ['x'])
  })

  it('não aponta nada quando todas as fotos são diferentes', () => {
    assert.deepEqual([...hashesRepetidos(['a', 'b', 'c'], 2)], [])
  })
})
