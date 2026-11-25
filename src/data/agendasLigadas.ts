import { site } from "./site";

/**
 * Os calendários que o leitor ligou em Indulgências, guardados no aparelho.
 * Num arquivo à parte porque a página inicial lê a mesma escolha.
 */
export const LEMBRANCA = "nsn:indulgencias:agendas";

/**
 * A Arquidiocese não é agenda do Google: é conta deste site.
 *
 * Sai das 75 datas do documento do Perez, pelo mesmo motor das indulgências
 * de cima, e por isso não passa pelo Worker. O id vive junto dos outros na
 * lista do que o leitor ligou — é um interruptor como os outros, e guardar
 * em separado faria duas memórias para a mesma pergunta —, mas sai da lista
 * antes da busca, que é só para quem tem calendário no Google.
 */
export const ARQUIDIOCESE = "arquidiocese";

export function agendasLembradas(): string[] {
  try {
    const cru = localStorage.getItem(LEMBRANCA);
    const lista = cru ? (JSON.parse(cru) as unknown) : null;
    if (!Array.isArray(lista)) return [];
    /*
     * O que não está mais na grade não volta: nem o que saiu do site.json
     * desde a última visita, nem o calendário universal do Apostolado, que
     * esteve ligado à força enquanto teve bolinha e hoje não tem nenhuma.
     */
    const validos = new Set([...site.agendas.map((a) => a.id), ARQUIDIOCESE]);
    return lista.filter(
      (x): x is string =>
        typeof x === "string" && validos.has(x) && x !== "indulgencias-apostolado",
    );
  } catch {
    return [];
  }
}
