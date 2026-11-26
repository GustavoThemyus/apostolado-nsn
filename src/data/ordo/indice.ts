// Gerado por tools/ordo/importar.py. Não edite à mão.

export const ANOS: number[] = [2026, 2027];

export const ATE: Record<number, string> = {
  2026: "2026-12-31",
  2027: "2027-03-31",
};

export const ARQUIVOS: Record<number, () => Promise<{ default: unknown }>> = {
  2026: () => import("./2026.json"),
  2027: () => import("./2027.json"),
};
