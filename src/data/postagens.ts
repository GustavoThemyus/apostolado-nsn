import bruto from "./postagens.json";
import type { ColecaoDePostagens, Postagem } from "./tipos";

export const colecao = bruto as unknown as ColecaoDePostagens;

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

export function dataPorExtenso(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) return iso;
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}
