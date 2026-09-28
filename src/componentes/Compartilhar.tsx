const SITE = 'https://vermelhometro.vercel.app'

export function Compartilhar({ texto, caminho, cartaz }: { texto: string; caminho: string; cartaz: string }) {
  const zap = `https://wa.me/?text=${encodeURIComponent(`${texto} ${SITE}${caminho}`)}`
  return (
    <div className="flex flex-col gap-2.5">
      <a
        href={zap}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-[58px] items-center justify-center bg-vermelho font-display text-[23px] uppercase tracking-wide text-ouro hover:bg-sangue"
      >
        ★ Espalhe no zap ★
      </a>
      <a
        href={cartaz}
        download
        className="flex h-[58px] items-center justify-center border-[3px] border-vermelho font-display text-[23px] uppercase text-vermelho hover:bg-vermelho hover:text-papel"
      >
        Baixar cartaz pros stories
      </a>
    </div>
  )
}
