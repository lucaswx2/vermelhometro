import { Cartaz } from '@/componentes/Cartaz'
import { Compartilhar } from '@/componentes/Compartilhar'
import { FichaPesquisa } from '@/componentes/FichaPesquisa'
import { GradeEstados } from '@/componentes/GradeEstados'
import { Rodape } from '@/componentes/Rodape'
import { atualizadoEm } from '@/lib/dados'
import { calcularTermometro, clima } from '@/lib/temperatura'
import { faixaDoPartido } from '@/lib/faixas'

const graus = (t: number) => `${Math.round(t)}°`

export default function Inicio() {
  const { temperatura, esferas } = calcularTermometro()
  const { presidente, senado, governadores, camara } = esferas
  const duelo = presidente.pesquisas[0]?.resultados.filter((r) => r.partido).sort((a, b) => b.pct - a.pct) ?? []
  const frentes = [
    {
      nome: 'Presidente',
      temperatura: presidente.temperatura,
      resumo: presidente.turno === 2 ? 'Média do 2º turno nas últimas pesquisas.' : 'Média do 1º turno nas últimas pesquisas.',
    },
    {
      nome: 'Senado',
      temperatura: senado.temperatura,
      resumo: `Projeção 2027: ${senado.cadeiras.esquerda} de esquerda, ${senado.cadeiras.direita} de direita, ${senado.cadeiras.centro} do centrão.`,
    },
    {
      nome: 'Governos',
      temperatura: governadores.temperatura,
      resumo: `Esquerda lidera em ${governadores.lideres.esquerda} estados, direita em ${governadores.lideres.direita}.`,
    },
    {
      nome: 'Câmara',
      temperatura: camara.temperatura,
      resumo: camara.usaProjecao ? 'Projeção de bancadas do DIAP.' : 'Bancada atual. A projeção entra quando houver.',
    },
  ]
  const { nome } = clima(temperatura)

  return (
    <>
      <Cartaz temperatura={temperatura} chamada="A esquerda hoje está a" atualizadoEm={atualizadoEm} />
      <p className="bg-sangue px-5 py-2.5 text-center text-xs leading-snug text-papel">
        50° é empate de forças entre esquerda e direita. Acima disso, nosso campo tá na frente.
      </p>

      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
        <section className="moldura flex flex-col gap-3.5 px-4 py-5">
          <h2 className="text-center font-display text-[28px] uppercase tracking-wide text-vermelho">★ As 4 frentes ★</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {frentes.map((frente) => (
              <article key={frente.nome} className="flex flex-col gap-1 bg-vermelho p-3 text-papel">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ouro">{frente.nome}</h3>
                <p className="font-display text-[46px] leading-none">{graus(frente.temperatura)}</p>
                <p className="text-xs leading-snug font-medium">{frente.resumo}</p>
              </article>
            ))}
          </div>
        </section>

        {presidente.pesquisas[0] && (
          <section className="flex flex-col gap-2.5 bg-tinta p-5 text-papel">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-ouro">
              Presidente · {presidente.turno}º turno
            </h2>
            <div className="flex items-end justify-between">
              {duelo.slice(0, 2).map((r, i) => (
                <div key={r.nomeUrna} className={`flex flex-col ${i === 1 ? 'items-end' : ''}`}>
                  <span
                    className={`font-display text-[60px] leading-none ${faixaDoPartido(r.partido ?? '') === 'frente-ampla' ? 'text-ouro' : 'text-cinza'}`}
                  >
                    {r.pct}%
                  </span>
                  <span className="font-bold uppercase">
                    {r.nomeUrna} · {r.partido}
                  </span>
                </div>
              ))}
            </div>
            <p className="font-bold uppercase">
              {Math.abs(presidente.margem) <= 2 * presidente.pesquisas[0].margemPp ? 'Empate técnico' : 'Fora da margem'}
              {presidente.chance !== null && ` · chance do Lula ${Math.round(presidente.chance * 100)}%`}
            </p>
            <p className="text-xs opacity-80">
              Número principal: {presidente.pesquisas[0].instituto}. Temperatura: média de {presidente.pesquisas.length}{' '}
              {presidente.pesquisas.length === 1 ? 'instituto' : 'institutos'}.
            </p>
            {presidente.pesquisas.map((p) => (
              <FichaPesquisa key={p.id} pesquisa={p} />
            ))}
          </section>
        )}

        <section className="moldura flex flex-col gap-3 px-4 py-5">
          <h2 className="text-center font-display text-[24px] uppercase tracking-wide text-vermelho">★ Quem lidera ★</h2>
          <GradeEstados
            lideres={governadores.porUf.map((e) => ({ uf: e.uf, faixa: e.lider?.faixa ?? null, nome: e.lider?.nomeUrna ?? null }))}
          />
          <p className="text-center text-xs">Toque num estado para ver governo e Senado.</p>
        </section>

        <Compartilhar
          texto={`A esquerda tá a ${graus(temperatura)} no Vermelhômetro. ${nome}! Confere:`}
          caminho="/"
          cartaz="/cartaz"
        />
      </main>
      <Rodape />
    </>
  )
}
