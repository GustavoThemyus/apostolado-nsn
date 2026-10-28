/**
 * Suíte do resolvedor de indulgências. Roda junto com `npm test`.
 *
 * O que importa aqui é o cânon 922: indulgência presa à *festa* anda com a
 * transferência dela, indulgência presa à *data* não anda. Errar isso põe a
 * plenária no dia errado, que é o defeito mais caro que esta página pode ter.
 */

import bruto from "../data/indulgencias-dias.json";
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

// --- o calendário que o Perez mandou ----------------------------------------
// Aqui os dados são os de verdade, e não fixtures: o que se quer provar é que
// as entradas do site caem nos dias certos.
const reais = (bruto as { dias: DiaDeIndulgencia[] }).dias;

const naData = (ano: number, mes: number, data: string, id: string): boolean =>
  !!indulgenciasDoMes(reais, ano, mes)
    .get(data)
    ?.some((o) => o.entrada.id === id);

/*
 * Toda entrada tem de cair em algum dia, todo ano.
 *
 * É a conferência que pega o erro mais barato e mais calado de todos: o nome
 * de festa escrito de um jeito no calendário e de outro aqui. "Dedicação da
 * Arquibasílica do Santíssimo Salvador" é como o Perez a chama; o motor a
 * chama de "Dedicação da Arquibasílica do Salvador", e com o nome dele a
 * entrada simplesmente nunca apareceria — sem erro, sem aviso, sem dia.
 */
for (const ano of [2025, 2026, 2027, 2028]) {
  const achadas = new Set<string>();
  for (let mes = 1; mes <= 12; mes += 1) {
    for (const ocorrencias of indulgenciasDoMes(reais, ano, mes).values()) {
      for (const o of ocorrencias) achadas.add(o.entrada.id);
    }
  }
  const sumidas = reais.filter((d) => !achadas.has(d.id)).map((d) => d.id);
  conferir(`em ${ano} nenhuma entrada fica sem dia`, sumidas, []);
}

conferir("Pedro e Paulo está no registro duas vezes, como no impresso",
  reais.filter((d) => d.id.startsWith("pedro-e-paulo")).length, 2);
conferir("Pedro e Paulo cai em 29 de junho",
  naData(2026, 6, "2026-06-29", "pedro-e-paulo-catedral"), true);
conferir("e não sobra na vigília, 28 de junho",
  naData(2026, 6, "2026-06-28", "pedro-e-paulo-catedral"), false);

/*
 * O cânon 922 na prática, com os dados de verdade.
 *
 * Em 2025 o dia 2 de novembro é domingo, e Finados anda para o dia 3. A
 * entrada é `festa`, e não `fixa`, justamente para a indulgência andar junto
 * — era este o caso que o Perez perguntou se o calendário resolvia sozinho.
 */
conferir("em 2025 Finados não fica no dia 2",
  naData(2025, 11, "2025-11-02", "finados"), false);
conferir("em 2025 Finados vai para o dia 3",
  naData(2025, 11, "2025-11-03", "finados"), true);
conferir("e a tela sabe dizer de onde ele veio",
  indulgenciasDoMes(reais, 2025, 11).get("2025-11-03")
    ?.find((o) => o.entrada.id === "finados")?.transferidaDe,
  "2025-11-02");

/*
 * Cristo Rei é o último domingo de outubro, e por isso anda todo ano. Ele
 * entra como `festa`: quem calcula a data é o motor do calendário, e repetir
 * a regra aqui seria uma segunda máquina de datas para divergir da primeira.
 */
conferir("Cristo Rei em 2026", naData(2026, 10, "2026-10-25", "cristo-rei"), true);
conferir("Cristo Rei em 2027", naData(2027, 10, "2027-10-31", "cristo-rei"), true);
conferir("Cristo Rei em 2028", naData(2028, 10, "2028-10-29", "cristo-rei"), true);

/*
 * A Cátedra de São Pedro, em 2026, perde a precedência para o II Domingo da
 * Quaresma e sobra como comemoração. A indulgência continua sendo daquele
 * dia, e é por isso que `casaNoDia` olha também as comemorações.
 */
conferir("a Cátedra vale mesmo quando só se comemora",
  naData(2026, 2, "2026-02-22", "catedra-antioquia"), true);
conferir("e vale quando é a festa do dia",
  naData(2027, 2, "2027-02-22", "catedra-antioquia"), true);

/*
 * Dois dias de 2026 levam duas plenárias: 29 de junho, pelas duas concessões
 * de Pedro e Paulo, e a Sexta-feira Santa, pela adoração da Cruz e pela
 * sexta-feira da Quaresma. O quadro tem de mostrar as duas, e não uma.
 */
conferir("29 de junho tem duas",
  indulgenciasDoMes(reais, 2026, 6).get("2026-06-29")?.length, 2);
conferir("a Sexta-feira Santa tem duas",
  indulgenciasDoMes(reais, 2026, 4).get("2026-04-03")?.length, 2);

/*
 * O quadro compacto da página de Indulgências lê a mesma coleção, e a coluna
 * da data sai de `quandoPorExtenso`. Faltando numa entrada, a linha abre com
 * a célula vazia e nada falha.
 */
conferir("toda entrada diz a data por extenso",
  reais.filter((d) => !d.quandoPorExtenso?.trim()).map((d) => d.id), []);

/*
 * As sextas-feiras da Quaresma são o caso que justifica o tipo novo. O
 * calendário de 1962 separa a Quaresma do Tempo da Paixão, e em 2026 duas das
 * sete sextas caem no segundo, uma delas a Sexta-feira Santa: casar só com
 * "quaresma" perderia justamente a principal.
 */
const sextas: string[] = [];
for (const mes of [2, 3, 4]) {
  for (const [data, ocorrencias] of indulgenciasDoMes(reais, 2026, mes)) {
    if (ocorrencias.some((o) => o.entrada.id === "sextas-da-quaresma")) sextas.push(data);
  }
}
sextas.sort();
conferir("sete sextas-feiras em 2026", sextas.length, 7);
conferir("a primeira é a da I semana", sextas[0], "2026-02-20");
conferir("a última é a Sexta-feira Santa", sextas[6], "2026-04-03");
conferir("duas delas estão no Tempo da Paixão",
  sextas.filter((d) => d >= "2026-03-27").length, 2);
conferir("a quarta-feira de Cinzas não entra",
  naData(2026, 2, "2026-02-18", "sextas-da-quaresma"), false);
conferir("a sexta depois da Páscoa não entra",
  naData(2026, 4, "2026-04-10", "sextas-da-quaresma"), false);
conferir("a sexta antes da Quaresma não entra",
  naData(2026, 2, "2026-02-13", "sextas-da-quaresma"), false);

const total = passaram + falhas.length;
console.log(`\nindulgências: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
