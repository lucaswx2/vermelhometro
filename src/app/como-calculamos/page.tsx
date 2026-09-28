import type { Metadata } from 'next'
import Link from 'next/link'
import { Legenda } from '@/componentes/GradeEstados'
import { REPOSITORIO, Rodape } from '@/componentes/Rodape'

export const metadata: Metadata = {
  title: 'Como calculamos',
  description: 'A metodologia do Vermelhômetro: faixas ideológicas, pesos, fontes e regras legais.',
}

const secoes = [
  {
    titulo: 'A temperatura',
    texto: [
      'Cada frente vira um número de 0° a 100°: a fatia da esquerda na soma esquerda + direita. 50° é empate de forças.',
      'O centrão fica fora da conta. É o campo em disputa, e aparece separado.',
      'A temperatura geral é a média simples das 4 frentes: Presidente, Senado, Governos e Câmara. Todas pesam igual.',
    ],
  },
  {
    titulo: 'Presidente',
    texto: [
      'Média das pesquisas de 2º turno do cenário mais testado, uma por instituto, dos últimos 21 dias.',
      'A chance de vitória usa a vantagem média e um erro histórico de 6 pontos na diferença entre os dois.',
    ],
  },
  {
    titulo: 'Governos',
    texto: [
      'Em cada estado, a pesquisa de 1º turno mais recente: votos da esquerda contra votos da direita.',
      'O número nacional pondera cada estado pelo tamanho do eleitorado. São Paulo pesa mais que Roraima.',
    ],
  },
  {
    titulo: 'Senado',
    texto: [
      'Cadeiras projetadas para 2027: os 27 senadores que seguem até 2031 mais os 2 primeiros colocados de cada estado nas pesquisas.',
    ],
  },
  {
    titulo: 'Câmara',
    texto: [
      'Não existe pesquisa por deputado. Usamos a projeção de bancadas do DIAP. Sem projeção, a bancada atual da Câmara. Depois da apuração, os eleitos.',
    ],
  },
  {
    titulo: 'Quem é esquerda e quem é direita',
    texto: [
      'Cada candidato tem uma faixa. O ponto de partida é o partido. Muda quando o apoio real diverge: um candidato do MDB com o PT na coligação vira frente ampla; um do PP com o PL na coligação vira extrema direita.',
      'A classificação foi feita pelo Claude, a IA da Anthropic, e está numa planilha aberta. Discorda de alguma? Abra um pull request no GitHub com a mudança e o motivo.',
    ],
  },
  {
    titulo: 'Pesquisas e a lei',
    texto: [
      'Só entram pesquisas registradas no TSE com todos os dados exigidos pela Resolução 23.600/2019: período, margem de erro, confiança, entrevistas, instituto, contratante e registro. Faltou um, a pesquisa fica de fora.',
      'O Vermelhômetro não faz pesquisa nem enquete. Só agrega o que foi publicado.',
    ],
  },
]

export default function ComoCalculamos() {
  return (
    <>
      <header className="bg-vermelho px-5 py-8 text-center text-papel">
        <Link href="/" className="font-display text-2xl uppercase tracking-widest text-ouro">
          ★ Vermelhômetro ★
        </Link>
        <h1 className="mt-2 font-display text-5xl uppercase">Como calculamos</h1>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
        {secoes.map((secao) => (
          <section key={secao.titulo} className="moldura flex flex-col gap-2 px-4 py-4">
            <h2 className="font-display text-2xl uppercase text-vermelho">{secao.titulo}</h2>
            {secao.texto.map((p) => (
              <p key={p} className="leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-2xl uppercase text-vermelho">As faixas</h2>
          <Legenda />
        </section>
        <a href={`${REPOSITORIO}/blob/main/dados/classificacao-candidatos.csv`} className="text-center font-bold text-vermelho underline">
          Ver a planilha de classificação
        </a>
      </main>
      <Rodape />
    </>
  )
}
