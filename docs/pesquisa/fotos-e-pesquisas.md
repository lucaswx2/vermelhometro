# Fotos de candidatos e pesquisas eleitorais: fontes primárias

Levantamento feito em 28/09/2026, contra fontes primárias (TSE, respostas de API baixadas na hora, colinha.ai inspecionado no navegador). Onde há número, ele veio de uma requisição feita nesse dia.

## Resumo

- **Fotos existem em duas fontes oficiais do TSE, com a mesma chave.** A chave é o `SQ_CANDIDATO` (na API do DivulgaCandContas, o campo `id`). A foto tem 161 x 225 px e cerca de 3 a 8 KB.
  - Em lote: um zip por UF no Portal de Dados Abertos, `foto_cand2026_{UF}_div.zip`, cerca de 125 MB no total.
  - Uma a uma: `https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/{SQ_CANDIDATO}/{UF}`.
- **Licença:** o conjunto "Candidatos - 2026", que inclui as fotos, está publicado como `cc-by` (Creative Commons Atribuição). A política de dados abertos do TSE limita a exigência a creditar a fonte. Direito de imagem e uso eleitoral são outra camada e ficam em aberto (ver lacunas).
- **Recomendação prática:** baixar os zips no script de dados e servir as fotos do próprio site. O hotlink na API do TSE funciona, mas tem três problemas:
  - a API responde 200 com uma imagem genérica quando a foto não existe;
  - a resposta não manda CORS, o que suja o canvas de `desenharColinha.ts`;
  - a borda do TSE (Akamai) bloqueou `curl` fora do navegador neste teste.
- **Resultados de pesquisa não têm fonte primária legível por máquina antes da eleição.** O TSE publica o *registro* de cada pesquisa (PesqEle e CSV diário nos dados abertos): instituto, datas, amostra, cargo e valor. O relatório com resultados só fica público depois da eleição (Res. TSE 23.600/2019, art. 2º, § 7º-B). Os números continuam vindo da divulgação de cada instituto ou da imprensa.
- **"Tempo real" é, no máximo, diário.** O CSV de registros é atualizado uma vez por dia (gerado às 05:46 de 28/09). Novas pesquisas saem em lotes, com pelo menos 5 dias entre registro e divulgação.
- **O colinha.ai não mostra pesquisas.** O bundle, as páginas e a API não têm nada de intenção de voto. O único "tempo real" do site está nos Termos, como aviso de que os dados *não* são garantidamente em tempo real.
  - As fotos vêm de um bucket próprio, `assets.colinha.ai/candidatos/fotos/{ano}/{SQ}.jpeg`, com os mesmos bytes do TSE.
  - A data de atualização aparece como "atualizado em DD/MM às HHhMM", no horário de Brasília.
- **No repo não existe hoje nenhum ID do TSE.** Nem `candidatos.json` nem `dados/raw/candidatos-tse/*.json` guardam `SQ_CANDIDATO`. O join atual é feito por nome e partido. Para ter foto, o script de importação precisa passar a gravar o `id` (ou `SQ_CANDIDATO`).
- **Os 58 registros de pesquisa do repo existem no CSV do TSE.** Em 14 deles, a data de fim do campo ou o número de entrevistas difere do que foi registrado. Detalhes na seção 2.4.

---

## 1. Fotos de candidatos

### 1.1 Portal de Dados Abertos (em lote)

- O conjunto [Candidatos - 2026](https://dadosabertos.tse.jus.br/api/3/action/package_show?id=candidatos-2026) lista 28 recursos "Fotos de candidatos": um por UF mais `BR`, que traz presidente e vice. O formato declarado é JPEG.
  - O padrão de URL é `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_{UF}_div.zip`.
  - Exemplo: [foto_cand2026_BR_div.zip](https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_BR_div.zip).
- A frequência de atualização declarada nos metadados do conjunto é "4 vezes ao dia" ([package_show](https://dadosabertos.tse.jus.br/api/3/action/package_show?id=candidatos-2026), campo `extras`).
  - No `HEAD` feito em 28/09, 26 zips tinham `Last-Modified` de 28/09 08:46 GMT. MG e RN estavam em 27/09 06:18 GMT.
- **Tamanho medido** (bytes do zip, via `HEAD`): o maior é SP (15,6 MB), depois RJ (12,1 MB) e MG (10,9 MB). O menor é BR (294 KB). A soma dos 28 zips dá cerca de 124,8 MB.
- **Volume medido** (entradas no diretório central do zip, lido por `Range`; cada zip traz também um `leiame.pdf`):

  | Zip | Entradas | Fotos |
  |---|---|---|
  | BR | 29 | 28 (14 presidentes e 14 vices) |
  | AC | 389 | 388 |
  | MG | 1.830 | 1.829 |
  | RJ | 2.056 | 2.055 |
  | SP | 2.631 | 2.630 |

- **Nome do arquivo:** `F{UF}{SQ_CANDIDATO}_div.jpg`, por exemplo `FBR280002552484_div.jpg`.
  - O `leiame.pdf` de dentro do [zip BR](https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_BR_div.zip) explica o padrão.
  - Segundo ele, o sequencial é o `SQ_CANDIDATO`, pode servir de chave para cruzar dados e não é o número de campanha.
  - `div` indica foto divulgável.
- **Chave de junção:** o CSV [consulta_cand_2026.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip) tem as colunas `SQ_CANDIDATO`, `NR_CANDIDATO`, `NM_URNA_CANDIDATO`, `SG_UF`, `SG_UE`, `DS_CARGO`, `SG_PARTIDO`, `DS_SITUACAO_CANDIDATURA`, entre outras.
  - Traz um arquivo por UF, mais `BR` e `BRASIL`, em latin1, separado por `;`.
  - O cabeçalho foi lido no próprio zip.
  - `CD_ELEICAO` nesse CSV vale `6257`. Na API do DivulgaCandContas, o ID da eleição é outro (ver 1.2).
- **Formato real:** JPEG, 161 x 225 px, de 2,7 KB a 6,6 KB no zip BR. A dimensão é a exigida para a urna pela [Res. TSE 23.609/2019, art. 27, II, a](https://www.tse.jus.br/legislacao/compilada/res/2019/resolucao-no-23-609-de-18-de-dezembro-de-2019): 161 x 225 pixels, sem moldura, 24 bpp, fundo uniforme.

### 1.2 DivulgaCandContas (uma a uma)

O TSE não documenta essa API. Ela é a que alimenta o front do DivulgaCandContas. Todos os endpoints abaixo foram chamados de dentro do navegador e responderam 200:

| Uso | URL | Observação |
|---|---|---|
| Eleições | [`/divulga/rest/v1/eleicao/ordinarias`](https://divulgacandcontas.tse.jus.br/divulga/rest/v1/eleicao/ordinarias) | 2026 = `id` `20322002026`, data 2026-10-04 |
| Lista por cargo | [`/divulga/rest/v1/candidatura/listar/2026/{UF\|BR}/20322002026/{codCargo}/candidatos`](https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2026/BR/20322002026/1/candidatos) | cargo 1 = presidente, 3 = governador; `fotoUrl` vem `null` na lista |
| Detalhe | [`/divulga/rest/v1/candidatura/buscar/2026/{UF\|BR}/20322002026/candidato/{id}`](https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/2026/BR/20322002026/candidato/280002552484) | traz `fotoUrl`, `fotoUrlPublicavel: true` e `dataUltimaAtualizacao` |
| Foto | [`/divulga/rest/arquivo/img/20322002026/{id}/{UF\|BR}`](https://divulgacandcontas.tse.jus.br/divulga/rest/arquivo/img/20322002026/280002552484/BR) | 161 x 225 |

- **O `id` da API é o mesmo `SQ_CANDIDATO` do zip.** No teste, o candidato `280002552484` rendeu 6.441 bytes pela API e 6.441 bytes como `FBR280002552484_div.jpg` no zip.
- **A foto não tem URL estável na lista.** É preciso montar a URL de foto com o `id` ou chamar o detalhe, um candidato por vez.
- **A resposta da foto engana:**
  - `Content-Type` variou entre `image/jpeg` e `image/png` para arquivos que o `Content-Disposition` chama de `.jpg`.
  - O `Content-Disposition` expõe o nome original do arquivo enviado pelo partido, às vezes com nome de terceiros.
  - Com `id` inexistente, ou com a UF errada, a API responde 200 com uma imagem genérica: 171 x 235 no teste com `id` falso. Por isso, o status HTTP não serve para saber se a foto existe.
- **Cache:** `Cache-Control: max-age` de cerca de 190 s a 1.400 s nas respostas observadas.
- **Sem CORS:** nenhum `Access-Control-Allow-Origin` nas respostas observadas.
- **A resposta de detalhe traz dados pessoais**, como título de eleitor, data de nascimento e CPF (campo presente). Não há motivo para gravar isso no repo.
- **Bloqueio fora do navegador:** `curl` com User-Agent de navegador recebeu 403 da Akamai em `divulgacandcontas.tse.jus.br`, `dadosabertos.tse.jus.br` e `cdn.tse.jus.br`. O navegador passou. Não há limite de requisições documentado. Ver lacunas.

### 1.3 Licença e termos

- O conjunto "Candidatos - 2026" declara `license_id: cc-by`, "Creative Commons Atribuição" ([package_show](https://dadosabertos.tse.jus.br/api/3/action/package_show?id=candidatos-2026)). Os recursos de foto fazem parte desse conjunto.
- A [Portaria TSE 93/2021, art. 2º, VI](https://www.tse.jus.br/legislacao/compilada/prt/2021/portaria-no-93-de-12-de-fevereiro-de-2021) define dados abertos como dados sob licença aberta de livre uso e cruzamento. A única exigência é creditar a autoria ou a fonte.
- A página [Sobre do portal](https://dadosabertos.tse.jus.br/about) diz que o portal cumpre essa política e pede que se leia o `leiame.pdf` de cada zip. O `leiame.pdf` das fotos não traz cláusula de licença.
- A API do DivulgaCandContas não declara licença própria. A marca `fotoUrlPublicavel: true` só diz que a foto pode ser divulgada, não em que termos.
- **Na prática:** citar "Fonte: TSE" junto das fotos. O site já faz isso nos rodapés, por exemplo em `src/componentes/colinha/desenharColinha.ts:53`.

### 1.4 Hotlink ou hospedagem própria

- **Hospedagem própria (recomendado):**
  - O script de dados baixa os zips das UFs, extrai só os `SQ_CANDIDATO` que entram em `colinhas.json` e grava as fotos em `public/` ou num bucket.
  - Hoje a colinha tem cerca de 1.051 entradas distintas (UF + cargo + número). A 6 KB por foto, isso dá perto de 6 MB.
  - Assim, o site não depende da Akamai do TSE no dia da eleição.
  - O canvas de `desenharColinha.ts` pode desenhar a foto sem ficar "sujo" (tainted). Uma imagem de outra origem sem CORS impede `toBlob` pela [regra origin-clean do HTML](https://html.spec.whatwg.org/multipage/canvas.html#security-with-canvas-elements), e o TSE não manda CORS (ver 1.2).
  - É o que o colinha.ai faz (seção 3).
- **Hotlink via `next/image`:**
  - Exige `images.remotePatterns` com `hostname: 'divulgacandcontas.tse.jus.br'` e `pathname: '/divulga/rest/arquivo/img/**'`. Hoje o `next.config.ts` não tem nenhum bloco `images`.
  - O otimizador do Next busca a imagem do servidor da Vercel. Se a Akamai barrar esse IP como barrou o `curl`, toda foto quebra.
  - No Next 16, o cache padrão do otimizador é 4 horas (`minimumCacheTTL: 14400`). Não há como invalidar esse cache (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`, seção `minimumCacheTTL`; `.../02-guides/upgrading/version-16.md`).
  - A imagem já tem 161 x 225 px e poucos KB, então há pouco a otimizar. `unoptimized` ou `<img>` simples bastam.
- **Hotlink com `<img>` simples:** funciona no navegador. No teste, `<img>` a partir de outra origem carregou 161 x 225. Mas herda os riscos acima e o falso 200 para foto ausente.

---

## 2. Pesquisas eleitorais

### 2.1 O que o TSE publica (registro, não resultado)

- O registro no PesqEle é obrigatório até 5 dias antes da divulgação ([Res. TSE 23.600/2019, art. 2º](https://www.tse.jus.br/legislacao/compilada/res/2019/resolucao-no-23-600-de-12-de-dezembro-de-2019)).
  - Pelo art. 9º, a consulta aos dados do registro é livre.
  - Pelo art. 5º, § 3º, parte das informações (incisos V a IX) fica restrita à Justiça Eleitoral.
- **O relatório com resultados é entregue, mas não é publicado antes da eleição.** O § 7º-A manda o instituto enviar o relatório completo com resultados. O § 7º-B diz que ele só se torna público "depois das eleições", salvo determinação contrária da Justiça Eleitoral.
- **Consulta pública:** [PesqEle Público](https://pesqele-divulgacao.tse.jus.br/app/pesquisa/listar.xhtml), versão 3.9.3. É um formulário JSF (`.xhtml`) com filtros de eleição, empresa etc. Não tem API documentada.
- **Dados abertos:** conjunto [Pesquisas Eleitorais - 2026](https://dadosabertos.tse.jus.br/api/3/action/package_show?id=pesquisas-eleitorais-2026), licença `cc-by`, frequência declarada "Diária". Recursos:
  - [`pesquisa_eleitoral_2026.zip`](https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_eleitoral_2026.zip): cerca de 5,9 MB, um CSV por UF mais `BRASIL`. Em 28/09 tinha `DT_GERACAO` 28/09/2026 05:46:54 e cerca de 3.500 registros.
  - `pesquisa_contratante_2026.zip`, `pesquisa_pagante_2026.zip`.
  - PDFs de notas fiscais, questionários e detalhamento de bairro/município.
- **Colunas do CSV de registro** (lidas no arquivo):
  - `NR_PROTOCOLO_REGISTRO` (formato `SP037302026`, sem hífen nem barra), `DT_REGISTRO`, `NM_EMPRESA`.
  - `DS_CARGO`, `DT_INICIO_PESQUISA`, `DT_FIM_PESQUISA`, `DT_DIVULGACAO`, `QT_ENTREVISTADO`, `VR_PESQUISA`.
  - `DS_METODOLOGIA_PESQUISA`, `DS_PLANO_AMOSTRAL`, `SG_UF`, `SG_UE`.
  - **Não há coluna de resultado.**

### 2.2 Fonte primária de resultados

- **Não existe fonte primária legível por máquina com os resultados antes da eleição.** Pelo § 7º-B citado acima, nem o TSE os publica.
- A fonte primária de cada número é a divulgação do próprio instituto ou do contratante. Na maioria dos casos é um PDF ou uma matéria. Um formato estruturado comum não foi encontrado.
- No repo, a maior parte das `fonteUrl` aponta para imprensa: Gazeta do Povo (144 de 250), Poder360 (63), CNN Brasil (22). Poucas apontam para o instituto, como `realtimebigdata.com.br` (6) e `nexus.fsb.com.br` (1).
- Não verifiquei um a um quais institutos (Datafolha, Quaest, AtlasIntel, Paraná Pesquisas, PoderData, Futura, Palver, Veritá, Anova) publicam relatório próprio em URL estável. Ver lacunas.

### 2.3 O que "tempo real" pode significar

- **Registro de pesquisas:** o CSV é atualizado uma vez por dia (metadado "Diária"; `Last-Modified` 28/09 09:08 GMT).
- **Resultados:** chegam quando cada instituto divulga. Entre o registro e a divulgação há pelo menos 5 dias inteiros (art. 2º, § 2º). Na reta final, isso dá algumas pesquisas novas por dia no país, em lotes.
- **Candidaturas:** o conjunto declara "4 vezes ao dia". A situação de cada candidatura muda por decisão judicial.
- **Rótulo honesto para o site:** "atualizado em DD/MM às HHhMM", com a data do último import (`dados/atualizacao.json`). "Tempo real" seria impreciso.

### 2.4 Conferência dos registros do repo contra o CSV do TSE

- As 58 chaves de `registro` distintas em `dados/pesquisas.json` existem no CSV do TSE, depois de normalizar `SP-03730/2026` para `SP037302026`.
- 44 batem em início, fim e número de entrevistas. 14 divergem, e a divergência é esperada: o registro é feito *antes* do campo e guarda o planejado.
  - Exemplo: SP-03730/2026 foi registrado em 18/09, com campo de 22 a 24/09. O repo diz 22 a 23/09. A nota do próprio item já registra essa dúvida.
  - AtlasIntel registrou 5.000 entrevistas e divulgou 5.018 e 5.015. Nexus registrou 2.000 e divulgou 2.002, 2.003 e 2.006.
  - Datafolha BR-00304, BR-04029 e BR-01833 terminam 1 dia depois no registro.
  - Futura BR-02793, BR-02322, BR-00749 e BR-05268 têm datas deslocadas.
- **Conclusão:** o CSV serve para *validar que a pesquisa existe* e para *preencher instituto e contratante*. Ele não deve sobrescrever datas e amostra divulgadas.

---

## 3. colinha.ai

Inspecionado em 28/09/2026: HTML das páginas, `island.js` (cerca de 316 KB) e requisições de rede, no navegador em viewport de celular (375 x 812).

- **Stack aparente:** páginas servidas pela Cloudflare, com um único bundle cliente [`/island.js`](https://colinha.ai/island.js) (não é Next nem Nuxt), um manifest PWA [`/site.webmanifest`](https://colinha.ai/site.webmanifest) e Cloudflare Turnstile no mural.
- **Fotos:**
  - Ficam num domínio próprio, `https://assets.colinha.ai/candidatos/fotos/{ano}/{SQ_CANDIDATO}.jpeg`. O padrão está no `island.js`, na função que monta a URL para os anos 2022, 2024 e 2026.
  - A foto de Haddad ([`.../2026/250002549705.jpeg`](https://assets.colinha.ai/candidatos/fotos/2026/250002549705.jpeg)) tem 5.565 bytes. É o mesmo tamanho servido pelo TSE, o que indica uma cópia sem reprocessamento. `Last-Modified` era 13/08/2026, servida pela Cloudflare.
  - A API também devolve uma `fotoAlt` em `assets.colinha.ai/politicos/fotos/{hash}.jpeg`, de origem não identificada.
  - Logos de partido ficam em `/partidos/{sigla}/logo/sm.jpg` e bandeiras de UF em `/estados/{uf}/bandeira/sm.jpg`.
- **Pesquisas: não há.**
  - `island.js` não contém "pesquisa", "Datafolha", "Quaest", "AtlasIntel", "intenção" nem "votos válidos".
  - As APIs referenciadas são só `/api/v1/situacao`, `/chapa`, `/colinha`, `/mural`, mais `/api/v1/perfil/{ano}/{slug}` e `/api/v1/stats?uf=` vistas na rede.
  - "Tempo real" só aparece nos [Termos](https://colinha.ai/termos), como aviso de que o site não garante dados atualizados em tempo real.
  - A premissa "pesquisas em tempo real" não se confirma nesse site.
- **Dados e atualização:**
  - A página [/dados](https://colinha.ai/dados) diz que os dados vêm dos dados abertos do TSE (candidatos 2026) e mostra a última carga como "DD/MM às HHhMM (horário de Brasília)", com a contagem de candidaturas alteradas na carga.
  - `/api/v1/stats` devolve `snapshot` em UTC compacto, por exemplo `2026-09-28T1651`, que a página mostra como 13h51 em Brasília.
  - O perfil do candidato termina com "Fonte: TSE · 2026 · atualizado em DD/MM/AAAA às HHhMM".
- **`/api/v1/situacao?sq=a,b,c`:** revalida em lote (até 12 SQs) a situação das escolhas salvas no aparelho. Devolve nome, número, sigla, foto, logo, slug e situação de julgamento.
- **Padrões de UX (mobile):**
  - **Barra de navegação inferior fixa** com 5 itens: Início, Busca, Simulador, Colinhas, Vídeos.
  - **Cabeçalho** com seletor de UF (bandeira + sigla) e botão de tema claro/escuro.
  - **Faixa de progresso** com um segmento por cargo.
  - **Cards por cargo na ordem da urna**, com caixas de dígitos tracejadas, uma por dígito ("4 dígitos · SP"), e botão de busca por cargo.
  - **Busca em folha de tela cheia** com campo "digite o número", alternância para teclado ABC, filtro por partido e ordenação "A-Z rotativa". Essa ordenação começa numa letra diferente para não favorecer ninguém.
  - Cada resultado da busca mostra foto 161 x 225, número em caixas de dígitos, nome de urna e logo do partido.
  - **Atalhos de voto nulo e branco** fixos no rodapé da busca.
  - **Perfil do candidato em bottom sheet** (`/candidato/{slug}`): foto, idade, partido, situação do registro, número em caixas, vice, "Adicionar à colinha", plano de governo (PDF), link para o TSE, redes, ocupação, escolaridade, teto de gastos, histórico e bens.
  - **Saída:** "Passar cola" usa `navigator.share` e link `wa.me`. "Imprimir colinha" leva a `/print/...`. Imagens de compartilhamento saem em `/share/...` com opções de formato e cor.
  - **Salvamento local** (`localStorage`), sem conta. Há ainda simulador de urna com som e vídeos.
  - **Rodapé** com aviso "não é o app oficial do TSE · sem recomendação".

---

## 4. O que já temos no repo

- **Candidatos majoritários da planilha:** `src/lib/esquemas.ts:6-19` (`candidatoSchema`) tem `cargo`, `uf`, `nomeUrna`, `partido` e afins, mas **nenhum ID do TSE**. O `dados/candidatos.json` (210 itens) segue esse esquema.
- **Candidaturas do TSE:** `scripts/gerar-colinhas.ts:17-24` (`candidaturaTse`) lê `dados/raw/candidatos-tse/{UF}.json` só com `cargo`, `numero`, `nomeUrna`, `partido`, `situacao` e `coligacaoOuFederacao`.
  - O `id`/`SQ_CANDIDATO` não foi gravado, e o script que baixou esses arquivos não está no repo.
  - A ligação entre planilha e TSE é feita por nome e partido em `scripts/gerar-colinhas.ts:53-58` (`acharNoTse`).
- **Chave natural disponível hoje:** `(UF, cargo, numero)`. Ela é única por eleição e pode ser cruzada com `SG_UF`/`SG_UE` + `DS_CARGO` + `NR_CANDIDATO` do `consulta_cand_2026` para obter o `SQ_CANDIDATO` e, daí, a foto.
  - O caminho mais simples é gravar o `id` já no download da API.
- **Fonte declarada:** `src/app/transparencia/page.tsx:35` e `README.md:21` dizem que os números vêm da API DivulgaCandContas.
- **Pesquisas:**
  - `src/lib/esquemas.ts:24-47` (`pesquisaSchema`) exige os campos da Res. 23.600, art. 10, e guarda `registro` (linha 27) no formato `UF-NNNNN/AAAA`.
  - `scripts/importar-dados.ts:27-45` junta arquivos `dados/raw/pesquisas-*.json` escritos à mão, valida e deduplica por `id`.
  - As fontes são matérias e PDFs (2.2). Não há consulta ao CSV do TSE.
- **Data de atualização:** `scripts/importar-dados.ts:61` grava `dados/atualizacao.json` e `src/lib/dados.ts:21` expõe `atualizadoEm`. Isso já dá o "atualizado em" no estilo do colinha.ai.
- **Imagens:** `next.config.ts:3-5` não tem bloco `images`, então hoje nenhum host remoto é aceito por `next/image`. O projeto usa Next 16.3.6.
- **Canvas:** `src/componentes/colinha/desenharColinha.ts:17,57` desenha a colinha e exporta com `toBlob`. Uma foto de outra origem sem CORS quebraria essa exportação (1.4).

---

## 5. Lacunas / não verificado

- **Direito de imagem.** A licença `cc-by` cobre o conjunto de dados. Não achei texto do TSE que trate da imagem das pessoas candidatas para uso fora do contexto informativo. Também não consultei a Lei 9.504/1997 nesse ponto. Usar a foto só para identificar a candidatura, sem montagem, parece o caminho seguro, mas não está confirmado em fonte primária.
- **Termos de uso do DivulgaCandContas.** Não encontrei página de termos nem limite de requisições documentado para a API `/divulga/rest/`. Ela não é documentada como API pública.
- **Bloqueio da Akamai.** O 403 apareceu para `curl` a partir desta máquina. Não testei a partir da Vercel nem com outros clientes. O repo diz que já baixou dados da API, então o bloqueio pode ser por IP ou por fingerprint.
- **Tamanho dos zips das outras UFs.** Só contei as entradas de BR, AC, MG, RJ e SP. As outras UFs têm apenas o tamanho em bytes.
- **Fotos faltantes.** Não medi quantos candidatos da colinha estão sem foto nos zips. Na busca do colinha.ai, um presidenciável (Avante) aparecia sem foto.
- **Leiame do CSV de pesquisas.** Não li o `leiame.pdf` do `pesquisa_eleitoral_2026.zip`, que pode definir `DT_DIVULGACAO` e os valores nulos (`#NULO#`).
- **Publicação direta dos institutos.** Não verifiquei, instituto por instituto, se há relatório próprio em URL estável ou em formato estruturado.
- **`fotoAlt` do colinha.ai.** A origem das imagens em `assets.colinha.ai/politicos/fotos/` não foi identificada.
- **Pesquisas no colinha.ai.** Não achei pesquisas em nenhuma página inspecionada (/, /dados, /sobre, /termos, /simulador, /mural, perfil de candidato) nem no bundle. Pode existir em rota não linkada, mas nada indica isso.
