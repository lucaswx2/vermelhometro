export const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA',
  'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const

export type Uf = (typeof UFS)[number]

export const ehUf = (valor: string): valor is Uf => (UFS as readonly string[]).includes(valor)

export const NOME_UF = {
  AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco', PI: 'Piauí', PR: 'Paraná',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina', SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
} satisfies Record<Uf, string>

// "no Pará", "na Bahia", "em São Paulo"
const PREPOSICAO = {
  AC: 'no', AL: 'em', AM: 'no', AP: 'no', BA: 'na', CE: 'no', DF: 'no', ES: 'no', GO: 'em', MA: 'no',
  MG: 'em', MS: 'em', MT: 'em', PA: 'no', PB: 'na', PE: 'em', PI: 'no', PR: 'no', RJ: 'no', RN: 'no',
  RO: 'em', RR: 'em', RS: 'no', SC: 'em', SE: 'em', SP: 'em', TO: 'no',
} satisfies Record<Uf, 'no' | 'na' | 'em'>

export const noEstado = (uf: Uf) => `${PREPOSICAO[uf]} ${NOME_UF[uf]}`
