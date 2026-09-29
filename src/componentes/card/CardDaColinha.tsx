import type { Ref } from 'react'
import { PONTOS_ESTRELA, raiosDoSol } from '../sol'
import type { LinhaDoCard } from './CompartilharCard'
import {
  FORMATOS,
  enderecoDoEstado,
  linhaLegal,
  nomeDaLinha,
  numeroDaLinha,
  siglaDaLinha,
  tamanhoDoNumero,
  truncar,
  type Formato,
} from './formato'

const NOME_MAXIMO = 48

// Medidas de cada formato, tiradas dos mockups CardFeed e CardStories. O sol é maior que no
// mockup e nasce atrás dos quadros, para o rodapé (vinho) ficar inteiro sobre o ouro.
const DESENHO = {
  feed: {
    sol: { cx: 540, cy: 1500, r: 600 },
    raios: raiosDoSol(540, 1500, 24, 2200),
    estrela: { y: 88, escala: 0.9 },
    titulo: 'top-[140px] text-[96px]',
    subtitulo: 'top-[250px] text-[36px]',
    grade: 'left-[48px] top-[320px] w-[984px] grid grid-cols-2 gap-6',
    quadro: 'h-[232px] gap-5 p-[18px]',
    foto: 'h-[196px] w-[140px]',
    estrelaDoQuadro: 76,
    sigla: 'text-[30px]',
    textos: 'flex-col',
    rotulo: 'text-[22px]',
    nome: 'text-[26px]',
    rodape: 'top-[1112px] gap-2',
    chamada: 'text-[44px]',
    endereco: 'text-[30px]',
    legal: 'text-[19px] max-w-[940px]',
  },
  stories: {
    sol: { cx: 540, cy: 2080, r: 620 },
    raios: raiosDoSol(540, 2080, 26, 2800),
    estrela: { y: 190, escala: 1.1 },
    titulo: 'top-[270px] text-[110px]',
    subtitulo: 'top-[395px] text-[40px]',
    grade: 'left-[60px] top-[480px] w-[960px] flex flex-col gap-[18px]',
    quadro: 'h-[184px] gap-6 py-[14px] pl-[14px] pr-6',
    foto: 'h-[156px] w-[112px]',
    estrelaDoQuadro: 62,
    sigla: 'text-[26px]',
    textos: 'flex-col gap-1',
    rotulo: 'text-[26px]',
    nome: 'text-[34px]',
    rodape: 'top-[1700px] gap-2.5',
    chamada: 'text-[48px]',
    endereco: 'text-[32px]',
    legal: 'text-[20px] max-w-[960px]',
  },
} satisfies Record<Formato, unknown>

type PropsDaCardDaColinha = {
  formato: Formato
  linhas: LinhaDoCard[]
  estado: string
  uf: string
  dataTse: string
  fotosQuebradas: string[]
  aoFalharFoto: (foto: string) => void
  ref: Ref<HTMLDivElement>
}

// O card em tamanho real (1080 px de largura). É este nó que vira PNG.
export function CardDaColinha({ formato, linhas, estado, uf, dataTse, fotosQuebradas, aoFalharFoto, ref }: PropsDaCardDaColinha) {
  const { largura, altura } = FORMATOS[formato]
  const d = DESENHO[formato]
  return (
    <div ref={ref} style={{ width: largura, height: altura }} className="relative overflow-hidden bg-vermelho font-sans text-papel">
      <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} className="absolute left-0 top-0" aria-hidden="true">
        <path d={d.raios} fill="#E0402A" />
        <circle cx={d.sol.cx} cy={d.sol.cy} r={d.sol.r} fill="#F5C542" />
        <g transform={`translate(${largura / 2} ${d.estrela.y}) scale(${d.estrela.escala})`}>
          <polygon points={PONTOS_ESTRELA} fill="#F5C542" />
        </g>
      </svg>

      <p className={`absolute left-0 w-full text-center font-display uppercase leading-none ${d.titulo}`}>Colinha de luta</p>
      <p className={`absolute left-0 w-full text-center font-bold uppercase tracking-[4px] text-ouro ${d.subtitulo}`}>
        {estado} · 1º turno · 4/10
      </p>

      <ul className={`absolute ${d.grade}`}>
        {linhas.map((linha, i) => {
          const foto = linha.foto && !fotosQuebradas.includes(linha.foto) ? linha.foto : null
          const numero = numeroDaLinha(linha)
          const nome = truncar(nomeDaLinha(linha), NOME_MAXIMO)
          const sigla = siglaDaLinha(linha)
          return (
            <li key={`${linha.rotulo}-${i}`} className={`box-border flex min-w-0 items-center bg-papel text-tinta ${d.quadro}`}>
              {foto ? (
                <div className={`shrink-0 overflow-hidden border-2 border-tinta bg-cinza ${d.foto}`}>
                  {/* img comum: o PNG precisa da foto exata, sem o otimizador do next/image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto}
                    alt={`Foto de ${nome}`}
                    className="block h-full w-full object-cover"
                    // A foto pode falhar antes da hidratação, quando o onError ainda não existe.
                    ref={(img) => {
                      if (img?.complete && img.naturalWidth === 0) aoFalharFoto(foto)
                    }}
                    onError={() => aoFalharFoto(foto)}
                  />
                </div>
              ) : (
                <div className={`flex shrink-0 flex-col items-center justify-center gap-2.5 bg-vermelho ${d.foto}`}>
                  <svg width={d.estrelaDoQuadro} height={d.estrelaDoQuadro} viewBox="-50 -50 100 100" aria-hidden="true">
                    <polygon points={PONTOS_ESTRELA} fill="#F5C542" />
                  </svg>
                  {sigla && <span className={`max-w-full truncate px-1 font-display text-papel ${d.sigla}`}>{sigla}</span>}
                </div>
              )}
              <div className={`flex min-w-0 grow ${d.textos}`}>
                <span className={`truncate font-bold uppercase tracking-[1px] text-vermelho ${d.rotulo}`}>{linha.rotulo}</span>
                {formato === 'feed' && <Numero numero={numero} formato={formato} />}
                <span className={`line-clamp-2 font-bold uppercase leading-[1.1] break-words ${d.nome}`}>{nome}</span>
              </div>
              {formato === 'stories' && <Numero numero={numero} formato={formato} />}
            </li>
          )
        })}
      </ul>

      {/* Uma coluna que cresce para baixo: chamada e endereço numa linha cada, a linha legal em até duas.
          Na captura a fonte pode medir diferente da prévia; sem quebra e com entrelinha folgada, nada se sobrepõe. */}
      <div className={`absolute left-0 flex w-full flex-col items-center px-6 text-center text-sangue ${d.rodape}`}>
        <p className={`whitespace-nowrap font-display uppercase leading-[1.15] ${d.chamada}`}>Nenhum voto na extrema direita!</p>
        <p className={`whitespace-nowrap font-bold leading-[1.25] ${d.endereco}`}>Anote no papel · {enderecoDoEstado(uf)}</p>
        <p className={`line-clamp-2 font-medium leading-[1.35] ${d.legal}`}>{linhaLegal(dataTse)}</p>
      </div>
    </div>
  )
}

// Número em texto corrido: nada de caixinhas de urna.
function Numero({ numero, formato }: { numero: string; formato: Formato }) {
  return (
    <span
      style={{ fontSize: tamanhoDoNumero(numero, formato) }}
      className={`shrink-0 whitespace-nowrap font-display tracking-[3px] ${formato === 'feed' ? 'leading-[1.02]' : 'leading-none'}`}
    >
      {numero}
    </span>
  )
}
