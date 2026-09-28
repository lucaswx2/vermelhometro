// ignoreCommand da Vercel: sai com 0 (pula o build) durante as janelas em que a lei proíbe propaganda nova.
// Lei 9.504/97, art. 39, § 5º; Res. TSE 23.610/2019, art. 87.
const JANELAS = [
  ['2026-10-03T22:00:00-03:00', '2026-10-04T17:00:00-03:00'],
  ['2026-10-24T22:00:00-03:00', '2026-10-25T17:00:00-03:00'],
]

const agora = Date.now()
const congelado = JANELAS.some(([inicio, fim]) => agora >= Date.parse(inicio) && agora < Date.parse(fim))

if (congelado) console.log('Congelamento eleitoral: deploy ignorado.')
process.exit(congelado ? 0 : 1)
