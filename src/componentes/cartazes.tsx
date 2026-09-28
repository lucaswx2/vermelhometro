import { ehUf } from '@/lib/dados'
import { NOME_UF } from '@/lib/estados'
import { calcularTermometro, termometroDaUf } from '@/lib/temperatura'
import { imagemCartaz } from './imagemCartaz'

type Formato = 'og' | 'stories'

export const cartazDoBrasil = (formato: Formato) => {
  const { temperatura, esferas } = calcularTermometro()
  return imagemCartaz({
    formato,
    chamada: 'A esquerda hoje está a',
    temperatura,
    frentes: [
      { nome: 'Pres', temperatura: esferas.presidente.temperatura },
      { nome: 'Sen', temperatura: esferas.senado.temperatura },
      { nome: 'Gov', temperatura: esferas.governadores.temperatura },
      { nome: 'Câm', temperatura: esferas.camara.temperatura },
    ],
    nomeArquivo: formato === 'stories' ? 'vermelhometro.png' : undefined,
  })
}

export const cartazDaUf = (ufMinuscula: string, formato: Formato) => {
  const uf = ufMinuscula.toUpperCase()
  if (!ehUf(uf)) return new Response('UF inválida', { status: 404 })
  const { temperatura, governo, temperaturaSenado } = termometroDaUf(uf)
  const frentes = [
    governo?.temperatura != null ? { nome: 'Governo', temperatura: governo.temperatura } : null,
    temperaturaSenado !== null ? { nome: 'Senado', temperatura: temperaturaSenado } : null,
  ].filter((f) => f !== null)
  return imagemCartaz({
    formato,
    chamada: `Em ${NOME_UF[uf]} a esquerda está a`,
    temperatura: temperatura ?? 50,
    frentes,
    nomeArquivo: formato === 'stories' ? `vermelhometro-${ufMinuscula}.png` : undefined,
  })
}
