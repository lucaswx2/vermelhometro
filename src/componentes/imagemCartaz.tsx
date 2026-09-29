import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { COR_DO_TEMA } from '@/lib/cores'
import { formatarAtualizacao } from './Cartaz'
import { PONTOS_ESTRELA, raiosDoSol } from './sol'

const anton = readFile(join(process.cwd(), 'src/fontes/Anton-Regular.ttf'))

export const TAMANHO_OG = { width: 1200, height: 630 }

// Card que aparece quando o link é colado no zap ou no X. Sempre com data e autoria.
export async function imagemCartaz({ chamada, titulo, atualizadoEm }: { chamada: string; titulo: string; atualizadoEm: Date }) {
  const { width, height } = TAMANHO_OG
  const sol = { cx: width / 2, cy: height + 260, r: 420 }
  return new ImageResponse(
    (
      <div style={{ width, height, display: 'flex', position: 'relative', background: COR_DO_TEMA.vermelho, fontFamily: 'Anton', color: COR_DO_TEMA.papel }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d={raiosDoSol(sol.cx, sol.cy, 22, width * 2.5)} fill={COR_DO_TEMA.raio} />
          <circle cx={sol.cx} cy={sol.cy} r={sol.r} fill={COR_DO_TEMA.ouro} />
        </svg>
        <div style={{ position: 'absolute', left: 0, top: 0, width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
          <svg width={72} height={72} viewBox="-50 -50 100 100">
            <polygon points={PONTOS_ESTRELA} fill={COR_DO_TEMA.ouro} />
          </svg>
          <div style={{ fontSize: 34, color: COR_DO_TEMA.ouro, letterSpacing: 4, marginTop: 14 }}>{chamada.toUpperCase()}</div>
          <div style={{ fontSize: 100, lineHeight: 1, marginTop: 8, textAlign: 'center', maxWidth: 1080 }}>{titulo.toUpperCase()}</div>
        </div>
        <div
          style={{ position: 'absolute', left: 0, bottom: 22, width, display: 'flex', flexDirection: 'column', alignItems: 'center', color: COR_DO_TEMA.sangue }}
        >
          <div style={{ fontSize: 40 }}>CELULAR NÃO ENTRA NA CABINE. LEVE NO PAPEL.</div>
          <div style={{ fontSize: 20, marginTop: 6 }}>
            {`vermelhometro.vercel.app · ${formatarAtualizacao(atualizadoEm)} · Lucas Freitas, pessoa física · não é material oficial`}
          </div>
        </div>
      </div>
    ),
    { width, height, fonts: [{ name: 'Anton', data: await anton, weight: 400, style: 'normal' }] },
  )
}
