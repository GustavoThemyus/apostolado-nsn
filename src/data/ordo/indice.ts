// Gerado por ferramentas/ordo/importar.py. Não edite à mão.

/** Os anos que a capela já publicou. */
export const ANOS: number[] = [2026, 2027];

/** O último dia publicado de cada ano: um ano pode vir pela metade. */
export const ATE: Record<number, string> = {
  2026: "2026-12-31",
  2027: "2027-03-31",
};

/**
 * Um arquivo por ano, carregado só quando o leitor pede o pré-55.
 *
 * O tipo aqui é `unknown` de propósito: o que o JSON garante é o
 * importador, e quem confere é ferramentas/ordo/conferir.py. Declarar
 * a forma aqui seria uma promessa que este arquivo não cumpre.
 */
export const ARQUIVOS: Record<number, () => Promise<{ default: unknown }>> = {
  2026: () => import("./2026.json"),
  2027: () => import("./2027.json"),
};
