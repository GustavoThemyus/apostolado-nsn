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

export type Classe = 1 | 2 | 3 | 4;

export type Cor = "branco" | "vermelho" | "verde" | "roxo" | "preto" | "rosa";

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
  advento: Date;
}

export interface DiaLiturgico {
  data: Date;
  tempo: Tempo;
  cor: Cor;
  semana?: number;
  nome: string;
  classe: Classe;
  comemoracoes: string[];
  origem: "temporal" | "santoral";
  transferidaDe?: string;
  observacoes: string[];
}
