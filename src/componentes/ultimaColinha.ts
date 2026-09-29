'use client'

import { useSyncExternalStore } from 'react'

// A última colinha aberta, só neste aparelho: a aba "Colinha" volta para ela.
const CHAVE = 'vermelhometro:colinha'
const EVENTO = 'vermelhometro:colinha'
const CAMINHO_DE_COLINHA = /^\/estado\/[a-z]{2}(#[\w=&%-]*)?$/

export const lembrarColinha = (caminho: string) => {
  try {
    localStorage.setItem(CHAVE, caminho)
  } catch (erro) {
    console.warn('Não deu para lembrar a colinha neste aparelho', erro)
  }
  window.dispatchEvent(new Event(EVENTO))
}

const assinar = (aviso: () => void) => {
  window.addEventListener('storage', aviso)
  window.addEventListener(EVENTO, aviso)
  return () => {
    window.removeEventListener('storage', aviso)
    window.removeEventListener(EVENTO, aviso)
  }
}

const ler = () => {
  try {
    const caminho = localStorage.getItem(CHAVE)
    return caminho && CAMINHO_DE_COLINHA.test(caminho) ? caminho : null
  } catch {
    return null
  }
}

const noServidor = () => null

export const useUltimaColinha = () => useSyncExternalStore(assinar, ler, noServidor)
