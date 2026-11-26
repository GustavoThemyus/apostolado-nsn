export function hojeUTC(): Date {
  const a = new Date();
  return new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
}

export const comoIso = (d: Date): string => d.toISOString().slice(0, 10);

export function diaDaBusca(busca: URLSearchParams, padrao: Date): Date {
  const cru = busca.get("dia");
  if (!cru || !/^\d{4}-\d{2}-\d{2}$/.test(cru)) return padrao;
  const d = new Date(`${cru}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? padrao
    : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
