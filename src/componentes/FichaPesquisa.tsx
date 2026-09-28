import type { Pesquisa } from '@/lib/esquemas'

const data = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7)

// Res. TSE 23.600/2019, art. 10: dados obrigatórios em toda divulgação.
export function FichaPesquisa({ pesquisa }: { pesquisa: Pesquisa }) {
  return (
    <p className="text-[10px] leading-snug opacity-80">
      <a href={pesquisa.fonteUrl} className="underline" target="_blank" rel="noopener noreferrer">
        {pesquisa.instituto}
      </a>
      , {data(pesquisa.campoInicio)}–{data(pesquisa.campoFim)}/{pesquisa.campoFim.slice(0, 4)} · registro {pesquisa.registro} ·{' '}
      {pesquisa.entrevistas.toLocaleString('pt-BR')} entrevistas · margem ±{pesquisa.margemPp} p.p. · confiança{' '}
      {pesquisa.confiancaPct}% · contratante {pesquisa.contratante}
    </p>
  )
}
