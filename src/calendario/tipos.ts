/** Tempos do ano litúrgico no calendário de 1962. */
export type Tempo =
  | "advento"
  | "natal"
  | "depoisDaEpifania"
  | "septuagesima"
  | "quaresma"
  | "paixao"
  | "pascoa"
  | "depoisDePentecostes";

export const NOME_DO_TEMPO: Record<Tempo, string> = {
  advento: "Advento",
  natal: "Tempo do Natal",
  depoisDaEpifania: "Tempo depois da Epifania",
  septuagesima: "Septuagésima",
  quaresma: "Quaresma",
  paixao: "Tempo da Paixão",
  pascoa: "Tempo Pascal",
  depoisDePentecostes: "Tempo depois de Pentecostes",
};

/** Grau da celebração no Código de Rubricas de 1960. */
export type Classe = 1 | 2 | 3 | 4;

/** Cor do paramento. Usa os mesmos nomes das marcas de cor do guia. */
export type Cor = "branco" | "vermelho" | "verde" | "roxo" | "preto" | "rosa";

/** As datas móveis de um ano, todas derivadas da Páscoa. */
export interface Eixo {
  ano: number;
  septuagesima: Date;
  cinzas: Date;
  paixao: Date;
  ramos: Date;
  pascoa: Date;
  ascensao: Date;
  pentecostes: Date;
  trindade: Date;
  corpusChristi: Date;
  /** Primeiro domingo do Advento que abre o ano litúrgico seguinte. */
  advento: Date;
}

export interface DiaLiturgico {
  data: Date;
  tempo: Tempo;
  cor: Cor;
  /** Semana dentro do tempo, quando faz sentido (ex.: 15 em "XV depois de Pentecostes"). */
  semana?: number;
  /** O que se celebra: a festa que venceu a precedência, ou o dia do Temporal. */
  nome: string;
  classe: Classe;
  /** Celebrações vencidas que sobrevivem como comemoração. */
  comemoracoes: string[];
  /** De onde veio a celebração principal. */
  origem: "temporal" | "santoral";
  /** Data de origem, quando a festa chegou a este dia por transferência. */
  transferidaDe?: string;
}
