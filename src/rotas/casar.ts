/**
 * Casamento de caminhos. Sem dependência, para poder ser exercitado sozinho.
 *
 * Só existe um curinga: `:nome`, que captura um segmento. Segmento fixo vence
 * segmento curinga, então `/calendario/santos` ganha de `/calendario/:que`.
 */

export type Parametros = Record<string, string>;

const partir = (caminho: string): string[] =>
  caminho.replace(/\/+$/, "").split("/").filter((p) => p !== "");

/** Devolve os parâmetros capturados, ou null se o caminho não casa. */
export function casar(padrao: string, caminho: string): Parametros | null {
  const p = partir(padrao);
  const c = partir(caminho);
  if (p.length !== c.length) return null;

  const parametros: Parametros = {};
  for (let i = 0; i < p.length; i += 1) {
    const parte = p[i];
    if (parte.startsWith(":")) {
      parametros[parte.slice(1)] = decodeURIComponent(c[i]);
    } else if (parte !== c[i]) {
      return null;
    }
  }
  return parametros;
}

/** Quantos segmentos curinga o padrão tem. Menos curingas vence. */
const curingas = (padrao: string): number =>
  partir(padrao).filter((s) => s.startsWith(":")).length;

/**
 * Escolhe a rota que melhor casa com o caminho. Entre duas que casam, ganha a
 * que tem menos curingas: assim uma rota literal nunca é roubada por uma que
 * captura parâmetro no mesmo lugar.
 */
export function resolver<T extends { padrao: string }>(
  rotas: T[],
  caminho: string
): { rota: T; parametros: Parametros } | null {
  let melhor: { rota: T; parametros: Parametros } | null = null;

  for (const rota of rotas) {
    const parametros = casar(rota.padrao, caminho);
    if (!parametros) continue;
    if (!melhor || curingas(rota.padrao) < curingas(melhor.rota.padrao)) {
      melhor = { rota, parametros };
    }
  }
  return melhor;
}
