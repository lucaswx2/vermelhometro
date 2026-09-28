import { clima } from '@/lib/temperatura'
import { PONTOS_ESTRELA, raiosDoSol } from './sol'

const RAIOS = raiosDoSol(200, 600, 22, 900)

export function Cartaz({ temperatura, chamada, atualizadoEm }: { temperatura: number; chamada: string; atualizadoEm: Date }) {
  const { nome, grito } = clima(temperatura)
  return (
    <section className="relative h-[560px] overflow-hidden bg-vermelho text-papel">
      <svg
        viewBox="0 0 400 560"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path d={RAIOS} fill="#E0402A" />
        <circle cx="200" cy="600" r="170" fill="#F5C542" />
      </svg>
      <div className="relative mx-auto flex h-full max-w-xl flex-col items-center px-5 text-center">
        <p className="mt-4 flex w-full justify-between text-xs font-bold tracking-[0.2em]">
          <span>ELEIÇÕES 2026</span>
          <span>{formatarAtualizacao(atualizadoEm)}</span>
        </p>
        <svg viewBox="-50 -50 100 100" className="mt-[30px] h-[90px] w-[90px]" aria-hidden="true">
          <polygon points={PONTOS_ESTRELA} fill="#F5C542" />
        </svg>
        <h1 className="mt-[26px] font-display text-[40px] uppercase leading-none tracking-[0.08em]">Vermelhômetro</h1>
        <p className="mt-3 text-[15px] font-bold uppercase tracking-[0.15em] text-ouro">{chamada}</p>
        <p className="font-display text-[170px] leading-none" aria-label={`${Math.round(temperatura)} graus`}>
          {Math.round(temperatura)}°
        </p>
        <p className="absolute bottom-6 font-display text-[30px] uppercase leading-[1.05] text-sangue">
          {nome}.<br />
          {grito}
        </p>
      </div>
    </section>
  )
}

const formatador = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

const formatarAtualizacao = (data: Date) => formatador.format(data).replace(',', ' ·').toUpperCase()
