import type { Uf } from '../../lib/estados.ts'
import type { Cargo } from './escolha.ts'

// Código da eleição geral de 2026 no DivulgaCandContas.
const ELEICAO = '20322002026'

// A região entra na rota do site; "CENTROOESTE" é como o próprio site do TSE escreve.
const REGIAO_DA_UF = {
  AC: 'NORTE', AM: 'NORTE', AP: 'NORTE', PA: 'NORTE', RO: 'NORTE', RR: 'NORTE', TO: 'NORTE',
  AL: 'NORDESTE', BA: 'NORDESTE', CE: 'NORDESTE', MA: 'NORDESTE', PB: 'NORDESTE', PE: 'NORDESTE', PI: 'NORDESTE', RN: 'NORDESTE',
  SE: 'NORDESTE',
  DF: 'CENTROOESTE', GO: 'CENTROOESTE', MS: 'CENTROOESTE', MT: 'CENTROOESTE',
  ES: 'SUDESTE', MG: 'SUDESTE', RJ: 'SUDESTE', SP: 'SUDESTE',
  PR: 'SUL', RS: 'SUL', SC: 'SUL',
} satisfies Record<Uf, 'NORTE' | 'NORDESTE' | 'CENTROOESTE' | 'SUDESTE' | 'SUL'>

// A página da candidatura no TSE. Presidente é candidatura nacional: região e UF viram BR.
export const enderecoNoTse = ({ sq, uf, cargo }: { sq: string; uf: Uf; cargo: Cargo }) => {
  const [regiao, abrangencia] = cargo === 'presidente' ? ['BR', 'BR'] : [REGIAO_DA_UF[uf], uf]
  return `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${regiao}/${abrangencia}/${ELEICAO}/${sq}/2026/${abrangencia}`
}
