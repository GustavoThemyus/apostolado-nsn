import bruto from "../data/indulgencias-dias.json";
import { diasDaArquidiocese } from "../data/arquidioceseDias";
import { indulgenciasDoMes, temPlenaria, type DiaDeIndulgencia } from "./indulgencias";
import { dataDaFestaMovel } from "./moveis";

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

conferir(
  "primeira sexta-feira de setembro de 2026",
  diasCom(entrada("sextas", { tipo: "mensal", diaDaSemana: 5, ocorrencia: 1 }, "parcial"), 2026, 9),
  ["2026-09-04"]
);
conferir(
  "primeira sexta-feira de agosto de 2026",
  diasCom(entrada("sextas", { tipo: "mensal", diaDaSemana: 5, ocorrencia: 1 }, "parcial"), 2026, 8),
  ["2026-08-07"]
);

const titular2026 = indulgenciasDoMes([entrada("titular", { tipo: "titular" })], 2026, 8);
conferir("a titular em 2026 cai no próprio dia", [...titular2026.keys()], ["2026-08-05"]);
conferir(
  "e sem aviso de transferência",
  titular2026.get("2026-08-05")?.[0].transferidaDe ?? null,
  null
);

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

const reais = (bruto as { dias: DiaDeIndulgencia[] }).dias;

const naData = (ano: number, mes: number, data: string, id: string): boolean =>
  !!indulgenciasDoMes(reais, ano, mes)
    .get(data)
    ?.some((o) => o.entrada.id === id);

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

conferir("em 2025 Finados não fica no dia 2",
  naData(2025, 11, "2025-11-02", "finados"), false);
conferir("em 2025 Finados vai para o dia 3",
  naData(2025, 11, "2025-11-03", "finados"), true);
conferir("e a tela sabe dizer de onde ele veio",
  indulgenciasDoMes(reais, 2025, 11).get("2025-11-03")
    ?.find((o) => o.entrada.id === "finados")?.transferidaDe,
  "2025-11-02");

conferir("Cristo Rei em 2026", naData(2026, 10, "2026-10-25", "cristo-rei"), true);
conferir("Cristo Rei em 2027", naData(2027, 10, "2027-10-31", "cristo-rei"), true);
conferir("Cristo Rei em 2028", naData(2028, 10, "2028-10-29", "cristo-rei"), true);

conferir("a Cátedra vale mesmo quando só se comemora",
  naData(2026, 2, "2026-02-22", "catedra-antioquia"), true);
conferir("e vale quando é a festa do dia",
  naData(2027, 2, "2027-02-22", "catedra-antioquia"), true);

conferir("29 de junho tem duas",
  indulgenciasDoMes(reais, 2026, 6).get("2026-06-29")?.length, 2);
conferir("a Sexta-feira Santa tem duas",
  indulgenciasDoMes(reais, 2026, 4).get("2026-04-03")?.length, 2);

conferir("toda entrada diz a data por extenso",
  reais.filter((d) => !d.quandoPorExtenso?.trim()).map((d) => d.id), []);

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

const sagradaFamilia = entrada("sagrada-familia", {
  tipo: "diaDaSemanaEntre",
  diaDaSemana: 0,
  de: { mes: 1, dia: 7 },
  ate: { mes: 1, dia: 13 },
});
conferir("domingo na Oitava da Epifania, 2026", diasCom(sagradaFamilia, 2026, 1),
  ["2026-01-11"]);
conferir("domingo na Oitava da Epifania, 2027", diasCom(sagradaFamilia, 2027, 1),
  ["2027-01-10"]);
conferir("quando 7 de janeiro é domingo, é ele mesmo",
  diasCom(sagradaFamilia, 2029, 1), ["2029-01-07"]);
conferir("um domingo só por ano", diasCom(sagradaFamilia, 2026, 2), []);

const primeiroDomingoDeJunho = entrada("menino-jesus-de-praga", {
  tipo: "diaDaSemanaEntre",
  diaDaSemana: 0,
  de: { mes: 6, dia: 1 },
  ate: { mes: 6, dia: 7 },
});
conferir("primeiro domingo de junho de 2026",
  diasCom(primeiroDomingoDeJunho, 2026, 6), ["2026-06-07"]);
conferir("primeiro domingo de junho de 2027",
  diasCom(primeiroDomingoDeJunho, 2027, 6), ["2027-06-06"]);

for (const ano of [2026, 2027]) {
  const vistas = new Set<string>();
  for (let mes = 1; mes <= 12; mes++) {
    for (const ocorrencias of indulgenciasDoMes(diasDaArquidiocese, ano, mes).values()) {
      for (const o of ocorrencias) vistas.add(o.entrada.id);
    }
  }
  const faltando = diasDaArquidiocese.filter((d) => !vistas.has(d.id)).map((d) => d.id);
  conferir(`Arquidiocese: toda festa cai em algum dia de ${ano}`, faltando, []);
  conferir(`Arquidiocese: são 75 festas em ${ano}`, vistas.size, 75);
}

const emIso = (d: Date | undefined) => (d ? d.toISOString().slice(0, 10) : undefined);

conferir("Sagrado Coração em 2026", emIso(dataDaFestaMovel("Sagrado Coração de Jesus", 2026)), "2026-06-12");
conferir("Sagrado Coração em 2027", emIso(dataDaFestaMovel("Sagrado Coração de Jesus", 2027)), "2027-06-04");
conferir("Sagrado Coração em 2031", emIso(dataDaFestaMovel("Sagrado Coração de Jesus", 2031)), "2031-06-20");

const pascoaDominicana = "Domingo da Ressurreição de Nosso Senhor Jesus Cristo";
conferir("Páscoa da Dominicana em 2026", emIso(dataDaFestaMovel(pascoaDominicana, 2026)), "2026-04-05");
conferir("Páscoa da Dominicana em 2031", emIso(dataDaFestaMovel(pascoaDominicana, 2031)), "2031-04-13");

conferir("Cristo Rei em 2026", emIso(dataDaFestaMovel("Nosso Senhor Jesus Cristo Rei", 2026)), "2026-10-25");

for (const fixa of [
  "Nossa Senhora do Monte Carmelo",
  "Santa Teresa de Jesus",
  "Santa Teresinha do Menino Jesus",
  "Santo Elias Profeta, Primeiro Mestre e Nosso Pai",
  "São João da Cruz",
  "São Simão Stock",
  "Todos os Santos da Ordem Carmelita",
  "Imaculada Conceição da Bem-aventurada Virgem Maria, Padroeira das três Ordens Seráficas",
  "Santa Bernadette Soubirous",
  "Santa Rosa de Viterbo",
  "Santo Antônio de Pádua",
  "São Benedito José Labre, Patrono principal da Arquiconfraria",
  "São Francisco de Assis, Fundador das Três Ordens Seráficas",
  "São Luís, Rei da França",
  "Beato Luquésio, o primeiro a ser admitido à Ordem Terceira, com sua esposa Buonadonna",
  "Nosso Pai São Francisco de Assis, Fundador das Três Ordens Seráficas",
  "Santa Clara de Assis",
  "Santa Isabel de Hungria, Patrona da Ordem Terceira",
  "Santa Margarida de Cortona",
  "Todos os Santos das três Ordens Seráficas",
  "Anunciação de Nossa Senhora",
  "Assunção de Nossa Senhora",
  "Natividade de Nosso Senhor Jesus Cristo",
  "Nossa Senhora do Rosário",
  "Nosso Pai São Domingos, Fundador da Ordem Dominicana",
  "Santa Catarina de Sena",
  "São Francisco Xavier, Padroeiro principal do AO.",
  "São Pedro e São Paulo, Apóstolos",
]) {
  conferir(`"${fixa}" não é móvel`, emIso(dataDaFestaMovel(fixa, 2026)), undefined);
}

const total = passaram + falhas.length;
console.log(`\nindulgências: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
