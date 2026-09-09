import type { Secao } from "./tipos";

export interface Subsecao {
  id: string;
  titulo: string;
}

/**
 * As subseções de uma seção, tiradas dos próprios blocos.
 *
 * Derivar em vez de guardar uma segunda lista: um documento de cem páginas
 * ganha e perde subtítulo o tempo todo, e um índice guardado à parte começa
 * certo e termina divergindo do texto.
 */
export function subsecoesDe(secao: Secao): Subsecao[] {
  const saida: Subsecao[] = [];
  for (const bloco of secao.blocos) {
    // o subtítulo menor tem âncora mas fica fora do índice: são as
    // orações dentro de uma concessão, e listá-las estufaria o sumário
    if (bloco.tipo === "subtitulo" && bloco.ancora && !bloco.menor) {
      // a chamada de nota vive no título, como no impresso; no índice ela
      // seria só um número solto, então sai inteira, e não só a etiqueta
      const titulo = bloco.texto
        .replace(/\[nota\][^[]*\[\/nota\]/g, "")
        .replace(/\[[^\]]*\]/g, "")
        .trim();
      saida.push({ id: bloco.ancora, titulo });
    }
  }
  return saida;
}
