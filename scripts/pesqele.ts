// Conferência das pesquisas contra o CSV de registros do PesqEle (dados abertos do TSE).
// Funções puras; o download fica em scripts/importar-dados.ts.
import { parse } from 'csv-parse/sync'

// 'SP-03730/2026' → 'SP037302026', o formato de NR_PROTOCOLO_REGISTRO.
export const normalizarRegistro = (registro: string) => {
  const partes = /^([A-Z]{2})-?(\d{1,5})\/?(\d{4})$/i.exec(registro.trim())
  if (!partes) return null
  const [, uf, numero, ano] = partes
  return `${uf.toUpperCase()}${numero.padStart(5, '0')}${ano}`
}

// CSV do TSE: ';', campos entre aspas que podem ter quebras de linha.
export const protocolosDoCsv = (texto: string) => {
  const [cabecalho = [], ...linhas]: string[][] = parse(texto, { delimiter: ';', relax_column_count: true })
  const coluna = cabecalho.indexOf('NR_PROTOCOLO_REGISTRO')
  if (coluna < 0) throw new Error('CSV do PesqEle sem a coluna NR_PROTOCOLO_REGISTRO')
  return new Set(linhas.map((linha) => linha[coluna]).filter((protocolo) => protocolo))
}

export const registrosAusentes = <T extends { id: string; registro: string }>(pesquisas: T[], protocolos: Set<string>) =>
  pesquisas.filter((p) => {
    const protocolo = normalizarRegistro(p.registro)
    return protocolo === null || !protocolos.has(protocolo)
  })
