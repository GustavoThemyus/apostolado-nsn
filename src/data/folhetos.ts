import bruto from "./folhetos.json";
import type { ColecaoDeFolhetos, Folheto } from "./tipos";

export const colecao = bruto as unknown as ColecaoDeFolhetos;

export function publicados(): Folheto[] {
  return colecao.folhetos.filter((f) => f.publicado !== false);
}

export function porId(id: string | undefined): Folheto | undefined {
  return id ? publicados().find((f) => f.id === id) : undefined;
}

export const condicoes = colecao.condicoes;
