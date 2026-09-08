/**
 * Suíte do resolvedor de indulgências. Roda junto com `npm test`.
 *
 * O que importa aqui é o cânon 922: indulgência presa à *festa* anda com a
 * transferência dela, indulgência presa à *data* não anda. Errar isso põe a
 * plenária no dia errado, que é o defeito mais caro que esta página pode ter.
 */

import { indulgenciasDoMes, temPlenaria, type DiaDeIndulgencia } from "./indulgencias";

let passaram = 0;
const falhas: string[] = [];

const conferir = (rotulo: string, obtido: unknown, esperado: unknown) => {
  if (JSON.stringify(obtido) === JSON.stringify(esperado)) passaram += 1;
  else falhas.push(`${rotulo}: ${JSON.stringify(obtido)} != ${JSON.stringify(esperado)}`);
};

const entrada = (id: string, quando: DiaDeIndulgencia["quando"], especie = "plenaria" as const) =>
  ({ id, titulo: id, quando, especie, obra: [] }) as DiaDeIndulgencia;

const diasCom = (e: DiaDeIndulgencia, ano: number, mes: number) =>
  [...indulgenciasDoMes([e], ano, mes).keys()].sort();

// --- data fixa --------------------------------------------------------------
conferir(
  "Finados cai sempre em 2 de novembro",
  diasCom(entrada("finados", { tipo: "fixa", mes: 11, dia: 2 }), 2026, 11),
  ["2026-11-02"]
);
conferir(
  "e não aparece em outro mês",
  diasCom(entrada("finados", { tipo: "fixa", mes: 11, dia: 2 }), 2026, 10),
  []
);

// --- intervalo --------------------------------------------------------------
conferir(
  "visita ao cemitério, 1 a 8 de novembro",
  diasCom(
    entrada("cemiterio", {
      tipo: "intervalo",
      de: { mes: 11, dia: 1 },
      ate: { mes: 11, dia: 8 },
    }),
    2026,
    11
  ).length,
  8
);

// --- mensal -----------------------------------------------------------------
// setembro de 2026: dia 1 é terça, então a primeira sexta é dia 4
conferir(
  "primeira sexta-feira de setembro de 2026",
  diasCom(entrada("sextas", { tipo: "mensal", diaDaSemana: 5, ocorrencia: 1 }, "parcial"), 2026, 9),
  ["2026-09-04"]
);
// agosto de 2026: dia 1 é sábado, então a primeira sexta é dia 7
conferir(
  "primeira sexta-feira de agosto de 2026",
  diasCom(entrada("sextas", { tipo: "mensal", diaDaSemana: 5, ocorrencia: 1 }, "parcial"), 2026, 8),
  ["2026-08-07"]
);

// --- titular, o caso do cânon 922 ------------------------------------------
// Nossa Senhora das Neves é 5 de agosto e em 2026 cai numa quarta-feira livre
const titular2026 = indulgenciasDoMes([entrada("titular", { tipo: "titular" })], 2026, 8);
conferir("a titular em 2026 cai no próprio dia", [...titular2026.keys()], ["2026-08-05"]);
conferir(
  "e sem aviso de transferência",
  titular2026.get("2026-08-05")?.[0].transferidaDe ?? null,
  null
);

// --- festa por nome ---------------------------------------------------------
conferir(
  "festa achada pelo nome",
  diasCom(entrada("assuncao", { tipo: "festa", nome: "Assunção de Nossa Senhora" }), 2026, 8),
  ["2026-08-15"]
);
conferir(
  "o nome casa ignorando o que vem depois da vírgula",
  diasCom(entrada("neves", { tipo: "festa", nome: "Nossa Senhora das Neves" }), 2026, 8),
  ["2026-08-05"]
);
conferir(
  "festa que não existe não casa com nada",
  diasCom(entrada("nada", { tipo: "festa", nome: "Festa Inventada" }), 2026, 8),
  []
);

// --- espécie ----------------------------------------------------------------
const mistura = indulgenciasDoMes(
  [
    entrada("plena", { tipo: "fixa", mes: 8, dia: 2 }),
    entrada("parcial", { tipo: "fixa", mes: 8, dia: 3 }, "parcial"),
  ],
  2026,
  8
);
conferir("dia com plenária", temPlenaria(mistura.get("2026-08-02")), true);
conferir("dia só com parcial", temPlenaria(mistura.get("2026-08-03")), false);
conferir("dia sem nada", temPlenaria(mistura.get("2026-08-04")), false);

const total = passaram + falhas.length;
console.log(`\nindulgências: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
