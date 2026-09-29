import { FICHA_DA_FAIXA } from '@/lib/faixas'
import type { Opcao } from './escolha'

// Partido e faixa num selo com a cor da faixa.
export function SeloDoPartido({ opcao, comFaixa = true }: { opcao: Pick<Opcao, 'partido' | 'faixa'>; comFaixa?: boolean }) {
  const ficha = FICHA_DA_FAIXA[opcao.faixa]
  return (
    <span className="inline-block px-1.5 py-px text-xs font-bold" style={{ background: ficha.cor, color: ficha.texto }}>
      {opcao.partido}
      {comFaixa && ` · ${ficha.nome}`}
    </span>
  )
}
