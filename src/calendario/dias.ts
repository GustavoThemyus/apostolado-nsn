/**
 * As contas de data que mais de uma tela faz, e sempre em UTC.
 *
 * UTC porque o calendário litúrgico é de dias, e não de instantes: lido num
 * fuso a oeste, um `new Date()` local viraria o dia anterior, e a festa de
 * hoje apareceria como a de ontem.
 */

/** O dia de hoje, à meia-noite UTC. */
export function hojeUTC(): Date {
  const a = new Date();
  return new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
}

/** "AAAA-MM-DD", que é como o dia viaja na URL. */
export const comoIso = (d: Date): string => d.toISOString().slice(0, 10);

/** Lê `?dia=AAAA-MM-DD`, para o dia poder ser mandado por link. */
export function diaDaBusca(busca: URLSearchParams, padrao: Date): Date {
  const cru = busca.get("dia");
  if (!cru || !/^\d{4}-\d{2}-\d{2}$/.test(cru)) return padrao;
  const d = new Date(`${cru}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? padrao
    : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
