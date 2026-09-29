import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizarRegistro, protocolosDoCsv, registrosAusentes } from '../scripts/pesqele.ts'

describe('normalizarRegistro', () => {
  it('converte o registro do site para o protocolo do CSV do TSE', () => {
    assert.equal(normalizarRegistro('SP-03730/2026'), 'SP037302026')
  })

  it('completa com zeros o número curto', () => {
    assert.equal(normalizarRegistro('AM-1856/2026'), 'AM018562026')
  })

  it('aceita o registro já no formato do CSV', () => {
    assert.equal(normalizarRegistro('br01833/2026'), 'BR018332026')
  })

  it('devolve null para texto fora do padrão', () => {
    assert.equal(normalizarRegistro('sem registro'), null)
  })
})

const cabecalho = '"DT_GERACAO";"SG_UF";"NR_PROTOCOLO_REGISTRO";"DS_METODOLOGIA_PESQUISA"'

describe('protocolosDoCsv', () => {
  it('lê a coluna de protocolo de cada linha', () => {
    const csv = `${cabecalho}\r\n"28/09/2026";"SP";"SP037302026";"x"\r\n"28/09/2026";"BR";"BR018332026";"y"\r\n`
    assert.deepEqual([...protocolosDoCsv(csv)].sort(), ['BR018332026', 'SP037302026'])
  })

  it('atravessa campos entre aspas com quebra de linha, ponto e vírgula e aspas escapadas', () => {
    const csv = `${cabecalho}\n"28/09/2026";"SP";"SP037302026";"linha 1\nlinha 2; com ""aspas"""\n"28/09/2026";"RJ";"RJ000012026";"z"\n`
    assert.deepEqual([...protocolosDoCsv(csv)].sort(), ['RJ000012026', 'SP037302026'])
  })

  it('falha quando o cabeçalho não tem a coluna de protocolo', () => {
    assert.throws(() => protocolosDoCsv('"A";"B"\n"1";"2"\n'), /NR_PROTOCOLO_REGISTRO/)
  })
})

describe('registrosAusentes', () => {
  it('lista as pesquisas cujo registro não está no PesqEle', () => {
    const protocolos = new Set(['SP037302026'])
    const pesquisas = [
      { id: 'a', registro: 'SP-03730/2026' },
      { id: 'b', registro: 'RJ-00001/2026' },
      { id: 'c', registro: 'inválido' },
    ]
    assert.deepEqual(registrosAusentes(pesquisas, protocolos), [
      { id: 'b', registro: 'RJ-00001/2026' },
      { id: 'c', registro: 'inválido' },
    ])
  })

  it('devolve lista vazia quando todas estão registradas', () => {
    assert.deepEqual(registrosAusentes([{ id: 'a', registro: 'SP-03730/2026' }], new Set(['SP037302026'])), [])
  })
})
