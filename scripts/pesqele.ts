// Conferência das pesquisas contra o CSV de registros do PesqEle (dados abertos do TSE).
// Funções puras; o download fica em scripts/importar-dados.ts.

// 'SP-03730/2026' → 'SP037302026', o formato de NR_PROTOCOLO_REGISTRO.
export const normalizarRegistro = (registro: string) => {
  const partes = /^([A-Z]{2})-?(\d{1,5})\/?(\d{4})$/i.exec(registro.trim())
  if (!partes) return null
  const [, uf, numero, ano] = partes
  return `${uf.toUpperCase()}${numero.padStart(5, '0')}${ano}`
}

// CSV do TSE: ';', campos entre aspas com quebras de linha e "" como aspas escapadas.
const linhasCsv = function* (texto: string) {
  let campo = ''
  let linha: string[] = []
  let entreAspas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (entreAspas) {
      if (c !== '"') campo += c
      else if (texto[i + 1] === '"') {
        campo += '"'
        i++
      } else entreAspas = false
      continue
    }
    if (c === '"') entreAspas = true
    else if (c === ';') {
      linha.push(campo)
      campo = ''
    } else if (c === '\n') {
      linha.push(campo.replace(/\r$/, ''))
      yield linha
      linha = []
      campo = ''
    } else campo += c
  }
  if (campo !== '' || linha.length > 0) yield [...linha, campo]
}

export const protocolosDoCsv = (texto: string) => {
  const linhas = linhasCsv(texto)
  const cabecalho = linhas.next().value ?? []
  const coluna = cabecalho.indexOf('NR_PROTOCOLO_REGISTRO')
  if (coluna < 0) throw new Error('CSV do PesqEle sem a coluna NR_PROTOCOLO_REGISTRO')
  const protocolos = new Set<string>()
  for (const linha of linhas) {
    const protocolo = linha[coluna]
    if (protocolo) protocolos.add(protocolo)
  }
  return protocolos
}

export const registrosAusentes = <T extends { id: string; registro: string }>(pesquisas: T[], protocolos: Set<string>) =>
  pesquisas.filter((p) => {
    const protocolo = normalizarRegistro(p.registro)
    return protocolo === null || !protocolos.has(protocolo)
  })
