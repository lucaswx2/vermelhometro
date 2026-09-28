# Vermelhômetro

Colinha de voto de classe para as eleições 2026, com os números oficiais do TSE, e o placar da esquerda em cada disputa.

https://vermelhometro.vercel.app

## Discorda de uma classificação?

A faixa de cada candidato (esquerda socialista, PT e aliados, centrão, direita liberal, extrema direita) foi definida com auxílio de IA (Claude, da Anthropic), revisada e assumida pelo autor, e está em [`dados/classificacao-candidatos.csv`](dados/classificacao-candidatos.csv).

Para propor uma mudança:

1. Edite a coluna `faixa_final` da linha do candidato.
2. Explique o motivo na coluna `override_motivo`, com link na `fonte_url`.
3. Abra um pull request.

## Dados

- `dados/classificacao-candidatos.csv`: candidatos e faixas.
- `dados/raw/`: pesquisas e bases brutas.
- `dados/raw/candidatos-tse/`: candidaturas aptas com número de urna, da API DivulgaCandContas do TSE.
- `dados/*.json`: gerados por `pnpm dados`.

Só entram pesquisas com todos os dados exigidos pela Resolução TSE 23.600/2019. O método está em [/transparencia](https://vermelhometro.vercel.app/transparencia).

## Colinhas

O critério é do autor: voto de classe em PSTU, PCB, UP ou PSOL. Em cada cargo, o candidato do próprio partido; sem candidato, o apoio formal do partido na coligação; para deputado, voto de legenda quando o partido tem candidatos no estado. Veja `scripts/gerar-colinhas.ts`.

## Dia da eleição

`scripts/congelamento.mjs` impede deploys de sábado 22h a domingo 17h (Brasília), no 1º e no 2º turno.

## Rodar local

```bash
pnpm install
pnpm dev
```
