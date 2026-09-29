import { normalizar, type Faixa } from '../../lib/faixas.ts'
import type { Opcao } from './escolha.ts'

// Prioridade da esquerda: esquerda socialista, depois a frente ampla, depois os outros, recolhidos.
export type Grupo = 'esquerda' | 'ampla' | 'outros'

export const GRUPOS = ['esquerda', 'ampla', 'outros'] as const satisfies readonly Grupo[]

const GRUPO_DA_FAIXA = {
  'esquerda-radical': 'esquerda',
  'frente-ampla': 'ampla',
  centrao: 'outros',
  'direita-liberal': 'outros',
  'extrema-direita': 'outros',
} satisfies Record<Faixa, Grupo>

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// A cada visita a ordem começa por uma letra: ninguém fica sempre em primeiro.
export const letraDaVez = (semente: number) => LETRAS[((Math.trunc(semente) % LETRAS.length) + LETRAS.length) % LETRAS.length]

export const girarPelaLetra = <T>(entradas: T[], chave: (entrada: T) => string, letra: string) => {
  const ordenados = [...entradas].sort((a, b) => (chave(a) < chave(b) ? -1 : chave(a) > chave(b) ? 1 : 0))
  const inicio = ordenados.findIndex((entrada) => chave(entrada) >= letra)
  if (inicio <= 0) return ordenados
  return [...ordenados.slice(inicio), ...ordenados.slice(0, inicio)]
}

const combina = (opcao: Opcao, termo: string) => {
  if (!termo) return true
  if (/^\d+$/.test(termo)) return String(opcao.numero).startsWith(termo)
  return normalizar(opcao.nome).includes(termo) || normalizar(opcao.partido).startsWith(termo)
}

export const buscar = (opcoes: Opcao[], termo: string, semente: number): Record<Grupo, Opcao[]> => {
  const alvo = normalizar(termo)
  const letra = letraDaVez(semente)
  const achadas = opcoes.filter((o) => combina(o, alvo))
  const ordenar = (grupo: Grupo, tipo: Opcao['tipo']) =>
    girarPelaLetra(
      achadas.filter((o) => o.tipo === tipo && GRUPO_DA_FAIXA[o.faixa] === grupo),
      (o) => normalizar(o.tipo === 'legenda' ? o.partido : o.nome),
      letra,
    )
  const grupo = (g: Grupo) => [...ordenar(g, 'legenda'), ...ordenar(g, 'candidatura')]
  return { esquerda: grupo('esquerda'), ampla: grupo('ampla'), outros: grupo('outros') }
}
