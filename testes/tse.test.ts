import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { enderecoNoTse } from '../src/componentes/colinha/tse.ts'

describe('o endereço da candidatura no TSE', () => {
  it('aponta a candidatura estadual para a região e a UF dela', () => {
    assert.equal(
      enderecoNoTse({ sq: '250002541365', uf: 'SP', cargo: 'senador1' }),
      'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUDESTE/SP/20322002026/250002541365/2026/SP',
    )
  })

  it('escreve o Centro-Oeste do jeito que o site do TSE espera', () => {
    assert.equal(
      enderecoNoTse({ sq: '90002540993', uf: 'GO', cargo: 'governador' }),
      'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/CENTROOESTE/GO/20322002026/90002540993/2026/GO',
    )
  })

  it('aponta a candidatura a presidente para o Brasil, qualquer que seja o estado', () => {
    assert.equal(
      enderecoNoTse({ sq: '280002542548', uf: 'RS', cargo: 'presidente' }),
      'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BR/BR/20322002026/280002542548/2026/BR',
    )
  })
})
