import Link from 'next/link'

export const REPOSITORIO = 'https://github.com/lucaswx2/vermelhometro'

export function Rodape() {
  return (
    <footer className="mt-auto bg-vermelho px-5 py-5 text-center text-xs leading-relaxed text-papel">
      <p>
        Projeto independente de Lucas Freitas · código aberto ·{' '}
        <Link href="/como-calculamos" className="text-ouro underline">
          como calculamos
        </Link>{' '}
        ·{' '}
        <a href={REPOSITORIO} className="text-ouro underline">
          GitHub
        </a>
      </p>
      <p className="mt-1 opacity-80">
        A classificação dos candidatos foi feita pelo Claude (IA da Anthropic). Discorda? Abra um pull request.
      </p>
    </footer>
  )
}
