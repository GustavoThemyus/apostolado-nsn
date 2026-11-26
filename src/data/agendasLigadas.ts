import { site } from "./site";

export const LEMBRANCA = "nsn:indulgencias:agendas";

export const ARQUIDIOCESE = "arquidiocese";

export function agendasLembradas(): string[] {
  try {
    const cru = localStorage.getItem(LEMBRANCA);
    const lista = cru ? (JSON.parse(cru) as unknown) : null;
    if (!Array.isArray(lista)) return [];
    const validos = new Set([...site.agendas.map((a) => a.id), ARQUIDIOCESE]);
    return lista.filter(
      (x): x is string =>
        typeof x === "string" && validos.has(x) && x !== "indulgencias-apostolado",
    );
  } catch {
    return [];
  }
}
