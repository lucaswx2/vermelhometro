import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { clima } from '@/lib/temperatura'
import { PONTOS_ESTRELA, raiosDoSol } from './sol'

const anton = readFile(join(process.cwd(), 'src/fontes/Anton-Regular.ttf'))

type Formato = 'og' | 'stories'

const TAMANHO = {
  og: { width: 1200, height: 630 },
  stories: { width: 1080, height: 1920 },
} satisfies Record<Formato, { width: number; height: number }>

type Cartaz = {
  formato: Formato
  chamada: string
  temperatura: number
  frentes: { nome: string; temperatura: number }[]
  nomeArquivo?: string
}

const g = (t: number) => `${Math.round(t)}°`

export async function imagemCartaz({ formato, chamada, temperatura, frentes, nomeArquivo }: Cartaz) {
  const { width, height } = TAMANHO[formato]
  const { nome, grito } = clima(temperatura)
  const stories = formato === 'stories'
  const escala = stories ? 2.7 : 1
  const sol = { cx: width / 2, cy: height + (stories ? 250 : 260), r: stories ? 760 : 420 }

  return new ImageResponse(
    (
      <div style={{ width, height, display: 'flex', position: 'relative', background: '#C8171E', fontFamily: 'Anton', color: '#FFF4DC' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d={raiosDoSol(sol.cx, sol.cy, 22, width * 2.5)} fill="#E0402A" />
          <circle cx={sol.cx} cy={sol.cy} r={sol.r} fill="#F5C542" />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width,
            height,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: stories ? 150 : 36,
          }}
        >
          <svg width={stories ? 200 : 70} height={stories ? 200 : 70} viewBox="-50 -50 100 100">
            <polygon points={PONTOS_ESTRELA} fill="#F5C542" />
          </svg>
          <div style={{ fontSize: stories ? 110 : 44, letterSpacing: 6, marginTop: stories ? 40 : 10 }}>VERMELHÔMETRO</div>
          <div style={{ fontSize: stories ? 44 : 22, color: '#F5C542', letterSpacing: 4, marginTop: stories ? 30 : 6 }}>{chamada.toUpperCase()}</div>
          <div style={{ fontSize: stories ? 460 : 190, lineHeight: 1, marginTop: stories ? 10 : -6 }}>{g(temperatura)}</div>
          <div style={{ display: 'flex', gap: 18 * escala, fontSize: 28 * (stories ? 1.9 : 1), marginTop: stories ? 20 : 0 }}>
            {frentes.map((f) => (
              <div key={f.nome} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#F5C542' }}>{f.nome.toUpperCase()}</span>
                <span>{g(f.temperatura)}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: stories ? 150 : 24,
            width,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#8E0F14',
          }}
        >
          {stories ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 96, lineHeight: 1.05 }}>
              <span>{`${nome.toUpperCase()}.`}</span>
              <span>{grito.toUpperCase()}</span>
            </div>
          ) : (
            <div style={{ fontSize: 40, lineHeight: 1.05 }}>{`${nome.toUpperCase()}. ${grito.toUpperCase()}`}</div>
          )}
          <div style={{ fontSize: stories ? 40 : 18, marginTop: stories ? 30 : 6 }}>vermelhometro.vercel.app</div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [{ name: 'Anton', data: await anton, weight: 400, style: 'normal' }],
      headers: nomeArquivo ? { 'Content-Disposition': `attachment; filename="${nomeArquivo}"` } : undefined,
    },
  )
}
