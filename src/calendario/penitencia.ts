import { eixoDoAno } from "./computo";
import type { DiaLiturgico } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const DIA = 86400000;

/**
 * Abstinência e jejum no calendário de 1962.
 *
 * Não saiu de dedução minha: saiu do Ordo que a capela publica, que marca dia
 * a dia. Lendo os 365 dias de 2026, a disciplina que ele segue é esta:
 *
 *   - abstinência em **todas as sextas-feiras** do ano;
 *   - jejum e abstinência na **Quarta-feira de Cinzas** e na **Sexta-feira
 *     Santa**;
 *   - nada marcado nos sábados da Quaresma, nas Têmporas nem nas vigílias.
 *
 * Vale dizer o que isto *não* é: não é o cânon 1252 do Código de 1917 na
 * forma universal, que acrescentaria os sábados da Quaresma, as Têmporas, as
 * vigílias e o jejum nos dias de semana da Quaresma. O Brasil tem indulto
 * próprio, e quem manda aqui é o Ordo da capela, não o texto universal.
 */
export type Penitencia = "abstinencia" | "jejum-e-abstinencia" | "dispensada";

/**
 * Dias santos de guarda no Brasil, entre os que podem cair numa sexta-feira.
 *
 * Corpus Christi também é de guarda e não entra: cai sempre numa quinta. A
 * dispensa é a do cânon 1252 §4 — a abstinência cessa em dia de preceito fora
 * da Quaresma — e o Ordo a confirma no Natal de 2026.
 */
const DE_GUARDA = [
  { mes: 1, dia: 1 },    // Oitava do Natal
  { mes: 12, dia: 8 },   // Imaculada Conceição
  { mes: 12, dia: 25 },  // Natividade do Senhor
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
