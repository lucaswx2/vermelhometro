import { faixaInfo } from '@/lib/faixas'
import type { Opcao } from './escolha'

// Partido e faixa num selo com a cor da faixa.
export function SeloDoPartido({ opcao, comFaixa = true }: { opcao: Pick<Opcao, 'partido' | 'faixa'>; comFaixa?: boolean }) {
  const info = faixaInfo[opcao.faixa]
  return (
    <span className="inline-block px-1.5 py-px text-xs font-bold" style={{ background: info.cor, color: info.texto }}>
      {opcao.partido}
      {comFaixa && ` · ${info.nome}`}
    </span>
  )
}
