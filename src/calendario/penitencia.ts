import { eixoDoAno } from "./computo";
import type { DiaLiturgico } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const DIA = 86400000;

export type Penitencia = "abstinencia" | "jejum-e-abstinencia" | "dispensada";

const DE_GUARDA = [
  { mes: 1, dia: 1 },
  { mes: 12, dia: 8 },
  { mes: 12, dia: 25 },
];

export function penitenciaDe(dia: DiaLiturgico): Penitencia | undefined {
  const data = dia.data;
  const e = eixoDoAno(data.getUTCFullYear());
  const hoje = soData(data);

  if (hoje === soData(e.cinzas)) return "jejum-e-abstinencia";
  if (hoje === soData(e.pascoa) - 2 * DIA) return "jejum-e-abstinencia";
  if (data.getUTCDay() !== 5) return undefined;

  const naQuaresma = hoje >= soData(e.cinzas) && hoje < soData(e.pascoa);
  const deGuarda = DE_GUARDA.some(
    (d) => d.mes === data.getUTCMonth() + 1 && d.dia === data.getUTCDate(),
  );
  return deGuarda && !naQuaresma ? "dispensada" : "abstinencia";
}

export const NOME_DA_PENITENCIA: Record<Penitencia, string> = {
  abstinencia: "Abstinência de carne",
  "jejum-e-abstinencia": "Jejum e abstinência",
  dispensada: "Abstinência dispensada",
};
