import type { Conteudo } from "./tipos";

/**
 * Converte um JSON importado num Conteudo tipado.
 *
 * O JSON entra no pacote da rota que o importa, então cada página baixa só o
 * seu próprio conteúdo. Quem abre o início não recebe os 17 KB do guia.
 */
export const comoConteudo = (bruto: unknown): Conteudo => bruto as Conteudo;
