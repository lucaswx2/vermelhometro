export const FAIXAS = [
  'esquerda-radical',
  'frente-ampla',
  'centrao',
  'direita-liberal',
  'extrema-direita',
] as const

export type Faixa = (typeof FAIXAS)[number]

export type Lado = 'esquerda' | 'centro' | 'direita'

export const faixaInfo = {
  'esquerda-radical': { nome: 'Esquerda radical', cor: '#8E0F14', texto: '#FFF4DC', lado: 'esquerda' },
  'frente-ampla': { nome: 'Frente ampla', cor: '#E0402A', texto: '#FFFFFF', lado: 'esquerda' },
  centrao: { nome: 'Centrão', cor: '#E8D9B5', texto: '#2A0A0A', lado: 'centro' },
  'direita-liberal': { nome: 'Direita liberal', cor: '#8A8F99', texto: '#FFFFFF', lado: 'direita' },
  'extrema-direita': { nome: 'Extrema direita', cor: '#2A0A0A', texto: '#FFF4DC', lado: 'direita' },
} satisfies Record<Faixa, { nome: string; cor: string; texto: string; lado: Lado }>

const faixaPorPartido: Record<string, Faixa> = {
  PSOL: 'esquerda-radical',
  PCB: 'esquerda-radical',
  PCO: 'esquerda-radical',
  PSTU: 'esquerda-radical',
  UP: 'esquerda-radical',
  PT: 'frente-ampla',
  PCDOB: 'frente-ampla',
  PSB: 'frente-ampla',
  PDT: 'frente-ampla',
  REDE: 'frente-ampla',
  PV: 'frente-ampla',
  SOLIDARIEDADE: 'frente-ampla',
  AVANTE: 'frente-ampla',
  NOVO: 'direita-liberal',
  MISSAO: 'direita-liberal',
  PSDB: 'direita-liberal',
  CIDADANIA: 'direita-liberal',
  PL: 'extrema-direita',
}

export const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim()

export const faixaDoPartido = (partido: string): Faixa => faixaPorPartido[normalizar(partido).replace(/ /g, '')] ?? 'centrao'

export const ladoDaFaixa = (faixa: Faixa): Lado => faixaInfo[faixa].lado
