import bruto from "./indulgencias-dias.json";
import type { DiaDeIndulgencia, Especie } from "../calendario/indulgencias";
import type { Bloco } from "./tipos";

/**
 * As indulgências plenárias universais, como o Perez as escreveu.
 *
 * Mora aqui, e não dentro de uma página, porque são duas as que a usam: a
 * grade do mês, na página geral das indulgências, e a lista do ano inteiro,
 * na página do calendário. Importado das duas, o JSON vira um pedaço só que
 * as duas carregam, em vez de viajar duplicado.
 */
export interface Colecao {
  titulo: string;
  descricao: string;
  /** As quatro condições ordinárias, escritas uma vez para toda a página. */
  condicoes: { titulo: string; blocos: Bloco[] };
  /** O que vale para todas elas: nove itens, com a citação de cada um. */
  observacoes: { titulo: string; blocos: Bloco[] };
  /** As notas de rodapé das duas, pela chamada. */
  notas: Record<string, string>;
  dias: DiaDeIndulgencia[];
  /** As que valem em qualquer dia, e por isso não entram na grade. */
  semDiaFixo: {
    id: string;
    titulo: string;
    especie: Especie;
    fonte?: string;
    obra: Bloco[];
  }[];
}

export const indulgencias = bruto as unknown as Colecao;
