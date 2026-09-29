// Baixa o logo de cada partido do Wikimedia Commons para public/partidos/{SIGLA}.svg|png
// e grava a proveniência (página do arquivo, licença, autor) em dados/logos-partidos.json.
// Só entram arquivos com licença livre ou em domínio público (PD-textlogo, PD-shape etc.) no Commons.
// Logo de partido é marca registrada: o domínio público cobre o direito autoral, não a marca.
// Uso: node scripts/baixar-logos.ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as esperar } from 'node:timers/promises'
import { z } from 'zod'

const API = 'https://commons.wikimedia.org/w/api.php'
const USER_AGENT = 'vermelhometro/0.1 (baixar-logos; freitasmlucas@gmail.com) node-fetch'
const PASTA = join(import.meta.dirname, '..', 'public', 'partidos')
const MANIFESTO = join(import.meta.dirname, '..', 'dados', 'logos-partidos.json')
// PNG mais largo que isso vem da miniatura que o próprio Commons gera.
const LARGURA_PNG = 384

type Escolha = { arquivo: string; confianca: 'alta' | 'baixa'; nota?: string }

// Escolha manual, conferida contra o site de cada partido em 29/09/2026.
const ESCOLHAS: Record<string, Escolha> = {
  AGIR: { arquivo: 'Logotipo do partido Agir.svg', confianca: 'alta' },
  AVANTE: { arquivo: 'Avante 70 (Brasil) logo.svg', confianca: 'alta' },
  CIDADANIA: { arquivo: 'Cidadania (Brasil) logo (variant 1).svg', confianca: 'alta' },
  DC: { arquivo: 'Logomarca Democracia Cristã.png', confianca: 'alta' },
  DEMOCRATA: { arquivo: 'Logomarca O Democrata 35.png', confianca: 'alta', nota: 'Democrata é o ex-PMB, renomeado em 2025.' },
  MDB: { arquivo: 'Movimento Democrático Brasileiro (2017).svg', confianca: 'alta' },
  MISSÃO: {
    arquivo: 'Partido Missão logo (dark).svg',
    confianca: 'baixa',
    nota: 'Só o texto "missão". O logo completo, com a onça, só existe como conteúdo restrito (fair use) na pt.wikipedia: https://pt.wikipedia.org/wiki/Ficheiro:MISSÃO_logo.png',
  },
  MOBILIZA: { arquivo: 'Logomarca Partido Mobiliza.png', confianca: 'alta', nota: 'Mobiliza é o ex-PMN.' },
  NOVO: { arquivo: 'Partido Novo logo (2023).svg', confianca: 'alta' },
  PCB: { arquivo: 'PCB logo.svg', confianca: 'alta' },
  PCDOB: { arquivo: 'PCdoB logo.svg', confianca: 'alta' },
  PCO: { arquivo: 'Logo PCO Institucional.svg', confianca: 'alta', nota: 'Vetorização feita por usuário do Commons a partir do logo oficial.' },
  PDT: {
    arquivo: 'PDT logo 2026 (cropped).png',
    confianca: 'alta',
    nota: 'Identidade visual nova de 2026. A versão SVG do mesmo logo tem pedido de exclusão no Commons (jun/2026) por talvez passar do limiar de originalidade; se for apagada, este PNG pode ter o mesmo destino.',
  },
  PL: { arquivo: 'Partido Liberal (Brazil) logo.svg', confianca: 'alta' },
  PODE: { arquivo: 'Podemos (Brasil) logo.svg', confianca: 'alta' },
  PP: { arquivo: 'Progressistas (Brazil) logo.svg', confianca: 'alta' },
  PRD: { arquivo: 'Partido Renovação Democrática logo.svg', confianca: 'alta' },
  PRTB: { arquivo: 'Logomarca do Partido Renovador Trabalhista Brasileiro 2.png', confianca: 'alta', nota: 'Logo "Brasileiro 28", o mesmo do site prtb.org.br em set/2026. Fundo cinza claro, não transparente.' },
  PSB: { arquivo: 'Logo of the Brazilian Socialist Party (wordmark color).svg', confianca: 'alta' },
  PSD: { arquivo: 'PSD Brazil logo.svg', confianca: 'alta' },
  PSDB: { arquivo: 'Logo of the Brazilian Social Democracy Party (2023).svg', confianca: 'alta' },
  PSOL: { arquivo: 'Logo PSOL roxo.svg', confianca: 'alta' },
  PSTU: {
    arquivo: 'Flag of the PSTU.svg',
    confianca: 'baixa',
    nota: 'É a bandeira (retângulo vermelho com "PSTU"). O logo oficial, a bandeira tremulando, só existe no Commons com 139x90 px.',
  },
  PT: { arquivo: 'PT (Brazil) logo 2021.svg', confianca: 'alta' },
  PV: { arquivo: 'Logomarca do Partido Verde.svg', confianca: 'alta' },
  REDE: { arquivo: 'Rede Sustentabilidade logo.svg', confianca: 'alta' },
  REPUBLICANOS: {
    arquivo: 'Republicanos (Brazil) wordmark.svg',
    confianca: 'alta',
    nota: 'O logo completo da pt.wikipedia é conteúdo restrito; este é o logotipo em texto, em domínio público.',
  },
  SOLIDARIEDADE: { arquivo: 'Solidariedade 77 (Brasil) logo.svg', confianca: 'alta' },
  UNIÃO: { arquivo: 'União Brasil logo.svg', confianca: 'alta' },
  UP: { arquivo: 'Unidade Popular wordmark.svg', confianca: 'alta', nota: 'Quadrado preto com "UP" em branco.' },
}

const paginaSchema = z.object({
  title: z.string(),
  missing: z.string().optional(),
  revisions: z.array(z.object({ slots: z.object({ main: z.object({ '*': z.string() }) }) })).optional(),
  imageinfo: z
    .array(
      z.object({
        url: z.string().url(),
        thumburl: z.string().url().optional(),
        descriptionurl: z.string().url(),
        width: z.number(),
        height: z.number(),
        mime: z.string(),
        extmetadata: z.object({
          LicenseShortName: z.object({ value: z.string() }).optional(),
          Artist: z.object({ value: z.string() }).optional(),
        }),
      }),
    )
    .optional(),
})
const respostaSchema = z.object({ query: z.object({ pages: z.record(z.string(), paginaSchema) }) })

const buscar = async (url: string | URL) => {
  const resposta = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!resposta.ok) throw new Error(`${url}: HTTP ${resposta.status}`)
  return resposta
}

const consultar = async (arquivo: string) => {
  const url = new URL(API)
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: `File:${arquivo}`,
    prop: 'imageinfo|revisions',
    iiprop: 'url|size|mime|extmetadata',
    iiextmetadatafilter: 'LicenseShortName|Artist',
    iiurlwidth: String(LARGURA_PNG),
    rvprop: 'content',
    rvslots: 'main',
  }).toString()
  const [pagina] = Object.values(respostaSchema.parse(await (await buscar(url)).json()).query.pages)
  const info = pagina?.imageinfo?.[0]
  if (!pagina || pagina.missing !== undefined || !info) throw new Error(`${arquivo}: não está no Commons`)
  return { info, wikitexto: pagina.revisions?.[0]?.slots.main['*'] ?? '' }
}

const semHtml = (texto: string) =>
  texto
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    // {{Unknown|author}} chega renderizado duas vezes ("Unknown authorUnknown author").
    .replace(/^(Unknown author)+$/, 'desconhecido')
    .trim()

// Domínio público vem do template da página ({{PD-textlogo}}...), mais preciso que o "Public domain" do extmetadata.
const licencaDe = (wikitexto: string, curta: string | undefined) => {
  const templates = [...wikitexto.matchAll(/\{\{\s*PD-([\w.-]+)/gi)].map((m) => `PD-${m[1]}`)
  if (templates.length > 0) return [...new Set(templates)].join(', ')
  if (curta) return curta
  throw new Error('licença não identificada')
}

// Tira do SVG o que não é desenho: scripts, handlers, metadados, comentários e o estado do editor.
const limparSvg = (svg: string) => {
  const limpo = svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
    .replace(/<sodipodi:namedview[\s\S]*?(\/>|<\/sodipodi:namedview>)/gi, '')
    .replace(/<inkscape:[\w-]+[\s\S]*?(\/>|<\/inkscape:[\w-]+>)/gi, '')
    .replace(/\s(?:sodipodi|inkscape):[\w-]+="[^"]*"/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\n\s*\n/g, '\n')
    .trim()
  const semNamespacesOrfaos = ['inkscape', 'sodipodi', 'rdf', 'dc', 'cc'].reduce(
    (svg, prefixo) =>
      new RegExp(`[<\\s]${prefixo}:`).test(svg.replace(/\sxmlns:\w+="[^"]*"/g, '')) ? svg : svg.replace(new RegExp(`\\sxmlns:${prefixo}="[^"]*"`), ''),
    limpo,
  )
  if (/<script|<foreignObject|\bhref="(?!#|data:)|url\((?!#)/i.test(semNamespacesOrfaos)) throw new Error('SVG com referência externa ou script')
  return semNamespacesOrfaos + '\n'
}

type Logo = {
  arquivo: string | null
  fonte: string
  licenca: string | null
  autor: string | null
  status: 'ok' | 'sem-licenca-livre' | 'nao-encontrado'
  confianca: 'alta' | 'baixa'
  nota?: string
}

mkdirSync(PASTA, { recursive: true })
const logos: Record<string, Logo> = {}

for (const [sigla, escolha] of Object.entries(ESCOLHAS)) {
  const { info, wikitexto } = await consultar(escolha.arquivo)
  const nome = sigla.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const ehSvg = info.mime === 'image/svg+xml'
  const destino = `${nome}.${ehSvg ? 'svg' : 'png'}`
  const origem = !ehSvg && info.width > LARGURA_PNG && info.thumburl ? info.thumburl : info.url
  const bytes = new Uint8Array(await (await buscar(origem)).arrayBuffer())
  writeFileSync(join(PASTA, destino), ehSvg ? limparSvg(new TextDecoder().decode(bytes)) : bytes)
  logos[sigla] = {
    arquivo: `/partidos/${destino}`,
    fonte: info.descriptionurl,
    licenca: licencaDe(wikitexto, info.extmetadata.LicenseShortName?.value),
    autor: semHtml(info.extmetadata.Artist?.value ?? '') || null,
    status: 'ok',
    confianca: escolha.confianca,
    ...(escolha.nota ? { nota: escolha.nota } : {}),
  }
  console.log(`${sigla}: ${destino} (${logos[sigla].licenca})`)
  await esperar(300)
}

writeFileSync(MANIFESTO, JSON.stringify({ geradoEm: new Date().toISOString(), logos }, null, 2) + '\n')
console.log(`${Object.keys(logos).length} logos em ${PASTA}`)
