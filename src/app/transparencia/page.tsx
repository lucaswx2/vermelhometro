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
      'A colinha é de voto de classe: você escolhe um entre PSTU, PCB, UP e PSOL. O critério é do autor.',
      'Em cada cargo entra o candidato do próprio partido. Sem candidato próprio, entra quem o partido apoia formalmente na coligação, com aviso. Sem nenhum dos dois, você escolhe outra opção de classe ou deixa em branco.',
      'Para deputado, o padrão é o voto de legenda (o número do partido), que só aparece quando o partido tem candidatos ao cargo no estado. O voto de legenda do PSOL vai para a federação PSOL-Rede.',
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
            {secao.texto.map((p) => (
              <p key={p} className="leading-relaxed">
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
