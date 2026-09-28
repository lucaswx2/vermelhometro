import type { SiglaDeClasse } from '@/lib/partidosDeClasse'
import type { Linha } from './escolha'

const LARGURA = 1080
const ALTURA = 1920

// Gera a imagem no próprio celular: nada sai do aparelho.
export async function desenharColinha(linhas: Linha[], estado: string, partido: SiglaDeClasse, atualizadoEm: string) {
  await document.fonts.ready
  const estilo = getComputedStyle(document.documentElement)
  const display = estilo.getPropertyValue('--font-anton').trim() || 'Impact, sans-serif'
  const texto = estilo.getPropertyValue('--font-oswald').trim() || 'sans-serif'

  const canvas = document.createElement('canvas')
  canvas.width = LARGURA
  canvas.height = ALTURA
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível')

  ctx.fillStyle = '#C8171E'
  ctx.fillRect(0, 0, LARGURA, ALTURA)
  ctx.fillStyle = '#FFF4DC'
  ctx.textAlign = 'center'
  ctx.font = `110px ${display}`
  ctx.fillText('COLINHA DE CLASSE', LARGURA / 2, 170)
  ctx.fillStyle = '#F5C542'
  ctx.font = `56px ${display}`
  ctx.fillText(`${estado.toUpperCase()} · 1º TURNO · 4/10`, LARGURA / 2, 250)

  const topo = 310
  const alturaLinha = 225
  linhas.forEach((linha, i) => {
    const y = topo + i * alturaLinha
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(60, y, LARGURA - 120, alturaLinha - 20)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#2A0A0A'
    ctx.font = `bold 38px ${texto}`
    ctx.fillText(linha.rotulo.toUpperCase(), 95, y + 55)
    ctx.font = `120px ${display}`
    ctx.fillText(linha.numero === null ? '—' : String(linha.numero), 95, y + 180)
    ctx.textAlign = 'right'
    ctx.font = `bold 40px ${texto}`
    ctx.fillText(cortar(ctx, linha.nome ?? 'em branco', 480), LARGURA - 95, y + 170)
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFF4DC'
  ctx.font = `64px ${display}`
  ctx.fillText('CELULAR NÃO ENTRA NA CABINE', LARGURA / 2, 1700)
  ctx.font = `bold 34px ${texto}`
  ctx.fillText(`Voto de classe · ${partido} · números do TSE de ${atualizadoEm}`, LARGURA / 2, 1765)
  ctx.fillText('Confira: divulgacandcontas.tse.jus.br · vermelhometro.vercel.app', LARGURA / 2, 1815)
  ctx.font = `28px ${texto}`
  ctx.fillText('Lucas Freitas, pessoa física. Não é material oficial de candidato, partido ou TSE.', LARGURA / 2, 1865)

  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob falhou'))), 'image/png'))
}

function cortar(ctx: CanvasRenderingContext2D, texto: string, largura: number) {
  if (ctx.measureText(texto).width <= largura) return texto
  let cortado = texto
  while (cortado.length > 1 && ctx.measureText(`${cortado}…`).width > largura) cortado = cortado.slice(0, -1)
  return `${cortado}…`
}
