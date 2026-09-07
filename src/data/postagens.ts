import bruto from "./postagens.json";
import type { ColecaoDePostagens, Postagem } from "./tipos";

/**
 * A coleção de postagens, já filtrada e ordenada.
 *
 * Tudo num arquivo enquanto couber. O critério de divisão, para ser decisão e
 * não deriva: passando de ~120 KB crus, quebrar em src/data/postagens/<id>.json.
 */
export const colecao = bruto as unknown as ColecaoDePostagens;

/** Publicadas, da mais recente para a mais antiga. */
export function publicadas(): Postagem[] {
  return colecao.postagens
    .filter((p) => p.publicado !== false)
    .slice()
    .sort((a, b) => b.data.localeCompare(a.data));
}

export function porId(id: string | undefined): Postagem | undefined {
  return id ? publicadas().find((p) => p.id === id) : undefined;
}

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "2026-08-05" vira "5 de agosto de 2026". Sem Intl: o pacote fica menor. */
export function dataPorExtenso(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) return iso;
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}
