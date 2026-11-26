import bruto from "./indulgencias-dias.json";
import type { DiaDeIndulgencia, Especie } from "../calendar/indulgencias";
import type { Bloco } from "./tipos";

export interface Colecao {
  titulo: string;
  descricao: string;
  condicoes: { titulo: string; blocos: Bloco[] };
  observacoes: { titulo: string; blocos: Bloco[] };
  notas: Record<string, string>;
  dias: DiaDeIndulgencia[];
  semDiaFixo: {
    id: string;
    titulo: string;
    especie: Especie;
    fonte?: string;
    obra: Bloco[];
  }[];
}

export const indulgencias = bruto as unknown as Colecao;
