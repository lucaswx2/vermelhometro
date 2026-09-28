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

export const candidatos = z.array(candidatoSchema).parse(candidatosJson)
export const pesquisas = z.array(pesquisaSchema).parse(pesquisasJson)
export const camara = camaraSchema.parse(camaraJson)
export const senadoresContinuam = z.array(senadorContinuaSchema).parse(senadoresJson)
export const eleitorado = z.record(z.string(), z.number()).parse(eleitoradoJson)
export const atualizadoEm = new Date(atualizacaoSchema.parse(atualizacaoJson).em)
