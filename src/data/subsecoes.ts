import type { Secao } from "./tipos";

export interface Subsecao {
  id: string;
  titulo: string;
}

export function subsecoesDe(secao: Secao): Subsecao[] {
  const saida: Subsecao[] = [];
  for (const bloco of secao.blocos) {
    if (bloco.tipo === "subtitulo" && bloco.ancora && !bloco.menor) {
      const titulo = bloco.texto
        .replace(/\[nota\][^[]*\[\/nota\]/g, "")
        .replace(/\[[^\]]*\]/g, "")
        .trim();
      saida.push({ id: bloco.ancora, titulo });
    }
  }
  return saida;
}
