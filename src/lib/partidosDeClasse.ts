// Critério do autor (Lucas Freitas) para a colinha de voto de classe.
export const PARTIDOS_DE_CLASSE = [
  { sigla: 'PSTU', numero: 16, nome: 'PSTU' },
  { sigla: 'PCB', numero: 21, nome: 'PCB' },
  { sigla: 'UP', numero: 80, nome: 'UP' },
  { sigla: 'PSOL', numero: 50, nome: 'PSOL' },
] as const

export type SiglaDeClasse = (typeof PARTIDOS_DE_CLASSE)[number]['sigla']
