import type { Metadata } from 'next'
import Link from 'next/link'
import { formatarAtualizacao } from '@/componentes/Cartaz'
import { Legenda } from '@/componentes/GradeEstados'
import { REPOSITORIO, Rodape } from '@/componentes/Rodape'
import { colinhasGeradasEm } from '@/lib/colinhas'
import { atualizadoEm } from '@/lib/dados'

export const metadata: Metadata = {
  title: 'Transparência e método',
  description: 'Quem faz o Vermelhômetro, o critério das colinhas, de onde vêm os números e como as pesquisas são tratadas.',
  alternates: { canonical: '/transparencia' },
}

const FOTOS_TSE = 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026'

const secoes = [
  {
    titulo: 'Quem faz',
    texto: [
      'Lucas Freitas, pessoa física, militante de esquerda. O site não fala em nome de nenhum partido, candidato ou coligação e não recebe dinheiro de ninguém.',
      'Não há impulsionamento pago. Se você viu este site em anúncio pago, não fomos nós.',
    ],
  },
  {
    titulo: 'O critério das colinhas',
    texto: [
      'Você monta a colinha cargo a cargo, com qualquer candidatura apta de qualquer partido. Na busca, quem luta com a classe trabalhadora vem primeiro: a esquerda socialista, depois a frente ampla, depois os outros partidos. Dentro de cada grupo, a ordem muda a cada visita.',
      'O atalho “Vote com a classe” preenche tudo com a indicação de um entre PSTU, PCB, UP e PSOL. O critério desse atalho é do autor: em cada cargo, o candidato do próprio partido; sem candidato próprio, quem o partido apoia formalmente na coligação, com aviso. Depois você troca o que quiser.',
      'Para deputado, o atalho usa o voto de legenda (o número do partido), que só aparece quando o partido tem candidatos ao cargo no estado. O voto de legenda do PSOL vai para a federação PSOL-Rede.',
      'A colinha fica só no seu aparelho: o que você escolhe vive no endereço da página, depois do #, e não é enviado a servidor nenhum.',
    ],
  },
  {
    titulo: 'Os números de urna',
    texto: [
      `Todos vêm da API oficial do TSE (DivulgaCandContas), baixados em ${formatarAtualizacao(colinhasGeradasEm)}, sem digitação manual. Ficam fora as candidaturas indeferidas, canceladas ou com renúncia. As sub judice aparecem com aviso.`,
      'Mesmo assim, confira no divulgacandcontas.tse.jus.br antes de votar. Situação de candidatura pode mudar até o dia.',
    ],
  },
  {
    titulo: 'As fotos',
    texto: [
      'Cada candidato aparece com a foto que entregou ao TSE, a mesma que a urna mostra depois de digitado o número. As fotos ficam guardadas no próprio site, sem montagem nem retoque.',
      <>
        Fotos: TSE, conjunto{' '}
        <a href={FOTOS_TSE} className="font-bold underline" target="_blank" rel="noopener noreferrer">
          Candidatos 2026
        </a>
        , licença CC-BY.
      </>,
      'No voto de legenda aparece a logo do partido. Todas vêm do Wikimedia Commons, com licença livre; fonte e licença de cada uma estão em dados/logos-partidos.json, no código aberto do site. As logos são marcas dos partidos e aparecem só para identificar cada um.',
      <>
        Logo do PCB: Partido Comunista Brasileiro,{' '}
        <a href="https://commons.wikimedia.org/wiki/File:PCB_logo.svg" className="font-bold underline" target="_blank" rel="noopener noreferrer">
          Wikimedia Commons
        </a>
        , CC BY-SA 2.5 BR. Logo do PCO: Calloshccp,{' '}
        <a href="https://commons.wikimedia.org/wiki/File:Logo_PCO_Institucional.svg" className="font-bold underline" target="_blank" rel="noopener noreferrer">
          Wikimedia Commons
        </a>
        , CC BY-SA 4.0.
      </>,
    ],
  },
  {
    titulo: 'As etiquetas',
    texto: [
      'Cada candidato tem a etiqueta do partido. Quando o palanque real é outro (por exemplo, alguém do MDB com o PT na coligação, ou do PP com o PL), aparece uma segunda etiqueta com o motivo.',
      '“Esquerda” nos números do site conta só pelo partido. Os aliados do Lula de outros partidos aparecem sempre separados.',
      'A classificação foi feita com auxílio de IA (Claude, da Anthropic), revisada e assumida pelo autor. A IA não escolhe os candidatos das colinhas. Discorda de alguma etiqueta? Abra um pull request na planilha.',
    ],
  },
  {
    titulo: 'As pesquisas',
    texto: [
      'Só entram pesquisas registradas no TSE com todos os dados exigidos pela Resolução 23.600/2019: período de campo, margem de erro, confiança, número de entrevistas, instituto, contratante e registro. Faltou um, fica de fora. Pesquisa suspensa pela Justiça Eleitoral sai.',
      'A cada atualização, o registro de toda pesquisa é conferido no PesqEle, o cadastro de pesquisas do TSE. Registro que não está lá trava a atualização.',
      'Presidente: média do 2º turno entre os dois primeiros do 1º, uma pesquisa por instituto, dos últimos 21 dias. Governo e Senado: a pesquisa mais recente de cada estado. Empate técnico é diferença menor que duas margens de erro.',
      'O site não faz pesquisa nem enquete.',
    ],
  },
  {
    titulo: 'Dia da eleição',
    texto: [
      'A lei proíbe publicar propaganda nova no dia da votação. Por isso o site congela no sábado às 22h e só volta a ser atualizado depois das 17h de domingo (horário de Brasília).',
    ],
  },
]

export default function Transparencia() {
  return (
    <>
      <header className="bg-vermelho px-5 py-8 text-center text-papel">
        <Link href="/" className="font-display text-2xl uppercase tracking-widest text-ouro">
          ★ Vermelhômetro ★
        </Link>
        <h1 className="mt-2 font-display text-5xl uppercase">Transparência e método</h1>
        <p className="mt-2 text-sm">Dados atualizados em {formatarAtualizacao(atualizadoEm)}</p>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
        {secoes.map((secao) => (
          <section key={secao.titulo} className="moldura flex flex-col gap-2 px-4 py-4">
            <h2 className="font-display text-2xl uppercase text-vermelho">{secao.titulo}</h2>
            {secao.texto.map((p, i) => (
              <p key={i} className="leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-2xl uppercase text-vermelho">As etiquetas por partido</h2>
          <Legenda />
        </section>
        <a href={`${REPOSITORIO}/blob/main/dados/classificacao-candidatos.csv`} className="botao-secundario">
          Ver a planilha de classificação
        </a>
      </main>
      <Rodape />
    </>
  )
}
