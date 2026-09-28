import { cartazDaUf } from '@/componentes/cartazes'
import { UFS } from '@/lib/dados'

export const generateStaticParams = () => UFS.map((uf) => ({ uf: uf.toLowerCase() }))

export async function GET(_: Request, { params }: RouteContext<'/estado/[uf]/cartaz'>) {
  return cartazDaUf((await params).uf, 'stories')
}
