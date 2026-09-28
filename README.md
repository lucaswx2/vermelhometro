# Vermelhômetro

A temperatura da esquerda nas eleições 2026: presidente, governadores, Senado e Câmara.

https://vermelhometro.vercel.app

## Discorda de uma classificação?

A faixa de cada candidato (esquerda radical, frente ampla, centrão, direita liberal, extrema direita) foi definida pelo Claude, a IA da Anthropic, e está em [`dados/classificacao-candidatos.csv`](dados/classificacao-candidatos.csv).

Para propor uma mudança:

1. Edite a coluna `faixa_final` da linha do candidato.
2. Explique o motivo na coluna `override_motivo`, com link na `fonte_url`.
3. Abra um pull request.

## Dados

- `dados/classificacao-candidatos.csv`: candidatos e faixas.
- `dados/raw/`: pesquisas e bases brutas.
- `dados/*.json`: gerados por `node scripts/importar-dados.ts`.

Só entram pesquisas com todos os dados exigidos pela Resolução TSE 23.600/2019. A metodologia completa está em [/como-calculamos](https://vermelhometro.vercel.app/como-calculamos).

## Rodar local

```bash
pnpm install
pnpm dev
```
