// Raios do cartaz: triângulos alternados saindo do sol, na metade de cima.
export const raiosDoSol = (cx: number, cy: number, quantidade: number, raio: number) =>
  Array.from({ length: quantidade }, (_, i) => {
    const a0 = Math.PI + (i / quantidade) * Math.PI
    const a1 = a0 + Math.PI / quantidade / 2
    const ponto = (a: number) => `${(cx + raio * Math.cos(a)).toFixed(1)} ${(cy + raio * Math.sin(a)).toFixed(1)}`
    return `M${cx} ${cy} L${ponto(a0)} L${ponto(a1)} Z`
  }).join(' ')

export const PONTOS_ESTRELA =
  '0,-50 11.2,-15.5 47.6,-15.5 18.2,5.9 29.4,40.5 0,19.1 -29.4,40.5 -18.2,5.9 -47.6,-15.5 -11.2,-15.5'
