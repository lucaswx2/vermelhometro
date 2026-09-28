import type { Pesquisa } from '@/lib/esquemas'

const data = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// Res. TSE 23.600/2019, art. 10: dados obrigatórios em toda divulgação.
export function FichaPesquisa({ pesquisa }: { pesquisa: Pesquisa }) {
  return (
    <p className="text-xs leading-snug">
      Pesquisa{' '}
      <a href={pesquisa.fonteUrl} className="font-bold underline" target="_blank" rel="noopener noreferrer">
        {pesquisa.instituto}
      </a>
      , campo de {data(pesquisa.campoInicio)} a {data(pesquisa.campoFim)}/{pesquisa.campoFim.slice(0, 4)}, registro {pesquisa.registro},{' '}
      {pesquisa.entrevistas.toLocaleString('pt-BR')} entrevistas, margem de {pesquisa.margemPp} pontos para mais ou para menos, confiança de{' '}
      {pesquisa.confiancaPct}%, contratada por {pesquisa.contratante}.
    </p>
  )
}
