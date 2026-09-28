import { z } from 'zod'
import {
  atualizacaoSchema,
  camaraSchema,
  candidatoSchema,
  pesquisaSchema,
  senadorContinuaSchema,
} from './esquemas'
import candidatosJson from '../../dados/candidatos.json'
import pesquisasJson from '../../dados/pesquisas.json'
import camaraJson from '../../dados/camara.json'
import senadoresJson from '../../dados/senadores-continuam.json'
import eleitoradoJson from '../../dados/eleitorado.json'
import atualizacaoJson from '../../dados/atualizacao.json'

export const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA',
  'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const

export type Uf = (typeof UFS)[number]

export const candidatos = z.array(candidatoSchema).parse(candidatosJson)
export const pesquisas = z.array(pesquisaSchema).parse(pesquisasJson)
export const camara = camaraSchema.parse(camaraJson)
export const senadoresContinuam = z.array(senadorContinuaSchema).parse(senadoresJson)
export const eleitorado = z.record(z.string(), z.number()).parse(eleitoradoJson)
export const atualizadoEm = new Date(atualizacaoSchema.parse(atualizacaoJson).em)

export const ehUf = (valor: string): valor is Uf => (UFS as readonly string[]).includes(valor)
