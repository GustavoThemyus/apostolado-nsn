import type { Conteudo } from "./tipos";

export const comoConteudo = (bruto: unknown): Conteudo => bruto as Conteudo;
