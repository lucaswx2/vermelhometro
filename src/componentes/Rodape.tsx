import Link from 'next/link'

export const REPOSITORIO = 'https://github.com/lucaswx2/vermelhometro'

export function Rodape() {
  return (
    <footer className="mt-auto bg-tinta px-5 py-6 text-center text-sm leading-relaxed text-papel">
      <p>
        Projeto independente de <strong>Lucas Freitas</strong>, pessoa física. Não é material oficial de candidato, partido, coligação ou TSE. Sem
        impulsionamento pago.
      </p>
      <p className="mt-2">
        Classificação dos candidatos feita com auxílio de IA (Claude, da Anthropic), revisada e assumida pelo autor. O critério das colinhas é do autor.
      </p>
      <p className="mt-2">
        <Link href="/transparencia" className="text-ouro underline">
          Transparência e método
        </Link>{' '}
        ·{' '}
        <a href={`${REPOSITORIO}/issues`} className="text-ouro underline">
          Contato e correções
        </a>{' '}
        ·{' '}
        <a href={REPOSITORIO} className="text-ouro underline">
          Código aberto
        </a>
      </p>
    </footer>
  )
}
