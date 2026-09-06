/**
 * Suítes do calendário de 1962.
 *
 * Rodar com `npm test`. Sai com código diferente de zero se algo falhar.
 *
 * Estas verificações já pegaram erros reais: Corpus Christi saindo verde por
 * herdar a cor do tempo, o Prefácio da Trindade vazando para as ferias, e a
 * Anunciação transferindo para dentro da Oitava da Páscoa. Mexer em
 * src/calendario sem rodá-las é trabalhar no escuro.
 */

import { eixoDoAno, pascoa } from "./computo";
import { desenvolvimentoDe } from "./desenvolvimento";
import { diaLiturgico, mesLiturgico } from "./precedencia";
import { corDe, tempoDe } from "./tempo";

const dia = (iso: string) => new Date(`${iso}T12:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);

let passaram = 0;
const falhas: string[] = [];

function conferir(rotulo: string, obtido: unknown, esperado: unknown) {
  if (Object.is(obtido, esperado)) passaram += 1;
  else falhas.push(`${rotulo}: obtido ${String(obtido)}, esperado ${String(esperado)}`);
}

function suite(nome: string, corpo: () => void) {
  const antes = passaram + falhas.length;
  corpo();
  const total = passaram + falhas.length - antes;
  console.log(`  ${nome}: ${total} verificações`);
}

// ---------------------------------------------------------------- computo

suite("Computo da Páscoa", () => {
  const conhecidas: Record<number, string> = {
    2020: "2020-04-12", 2021: "2021-04-04", 2022: "2022-04-17", 2023: "2023-04-09",
    2024: "2024-03-31", 2025: "2025-04-20", 2026: "2026-04-05", 2027: "2027-03-28",
    2028: "2028-04-16", 2029: "2029-04-01", 2030: "2030-04-21", 2033: "2033-04-17",
    2038: "2038-04-25", 2049: "2049-04-18",
  };
  for (const [ano, esperado] of Object.entries(conhecidas)) {
    conferir(`Páscoa de ${ano}`, iso(pascoa(Number(ano))), esperado);
  }
});

suite("Datas móveis", () => {
  const e = eixoDoAno(2026);
  conferir("Septuagésima 2026", iso(e.septuagesima), "2026-02-01");
  conferir("Cinzas 2026", iso(e.cinzas), "2026-02-18");
  conferir("Ramos 2026", iso(e.ramos), "2026-03-29");
  conferir("Ascensão 2026", iso(e.ascensao), "2026-05-14");
  conferir("Pentecostes 2026", iso(e.pentecostes), "2026-05-24");
  conferir("Corpus Christi 2026", iso(e.corpusChristi), "2026-06-04");
  conferir("Advento I 2026", iso(e.advento), "2026-11-29");
  conferir("Advento I 2025", iso(eixoDoAno(2025).advento), "2025-11-30");
  conferir("Advento I 2027", iso(eixoDoAno(2027).advento), "2027-11-28");
});

suite("Tempo e cor", () => {
  const casos: [string, string, string][] = [
    ["2026-01-06", "natal", "branco"],
    ["2026-01-25", "depoisDaEpifania", "verde"],
    ["2026-02-01", "septuagesima", "roxo"],
    ["2026-02-18", "quaresma", "roxo"],
    ["2026-03-15", "quaresma", "rosa"],      // Laetare
    ["2026-03-22", "paixao", "roxo"],
    ["2026-04-03", "paixao", "preto"],       // Sexta-feira Santa
    ["2026-04-05", "pascoa", "branco"],
    ["2026-05-24", "pascoa", "vermelho"],    // Pentecostes
    ["2026-07-12", "depoisDePentecostes", "verde"],
    ["2026-11-29", "advento", "roxo"],
    ["2026-12-13", "advento", "rosa"],       // Gaudete
    ["2026-12-25", "natal", "branco"],
  ];
  for (const [data, tempo, cor] of casos) {
    const d = dia(data);
    const t = tempoDe(d);
    conferir(`${data} tempo`, t.tempo, tempo);
    conferir(`${data} cor`, corDe(d, t.tempo), cor);
  }
});

// ------------------------------------------------------------ precedência

suite("Precedência", () => {
  const casos: [string, string, string?][] = [
    ["2026-11-01", "Todos os Santos", "branco"],
    ["2026-08-15", "Assunção de Nossa Senhora", "branco"],
    ["2026-05-01", "São José Operário", "branco"],
    ["2026-09-29", "Dedicação de São Miguel Arcanjo", "branco"],
    ["2026-12-08", "Imaculada Conceição de Nossa Senhora", "branco"],
    ["2026-03-19", "São José, esposo de Nossa Senhora", "branco"],
    ["2026-11-02", "Comemoração de Todos os Fiéis Defuntos", "preto"],
    ["2026-03-25", "Anunciação de Nossa Senhora", "branco"],
    ["2026-04-05", "Domingo de Páscoa", "branco"],
    ["2026-04-03", "Sexta-feira Santa", "preto"],
    ["2026-05-24", "Domingo de Pentecostes", "vermelho"],
    ["2026-09-06", "Domingo XV depois de Pentecostes", "verde"],
    ["2026-08-05", "Nossa Senhora das Neves, Titular da capela", "branco"],
    ["2026-10-25", "Nosso Senhor Jesus Cristo Rei", "branco"],
    ["2027-10-31", "Nosso Senhor Jesus Cristo Rei", "branco"],
  ];
  for (const [data, nome, cor] of casos) {
    const x = diaLiturgico(dia(data));
    conferir(`${data} nome`, x.nome, nome);
    if (cor) conferir(`${data} cor`, x.cor, cor);
  }
  // Todos os Santos num domingo comemora o domingo vencido
  const todosOsSantos = diaLiturgico(dia("2026-11-01"));
  conferir(
    "Todos os Santos comemora o domingo",
    todosOsSantos.comemoracoes.includes("Domingo XXIII depois de Pentecostes"),
    true
  );
});

// ---------------------------------------------------------- transferências

suite("Transferências", () => {
  const casos: [string, string, string][] = [
    // Imaculada Conceição em domingo do Advento vai para o dia 9
    ["8/12/2019 é domingo", "2019-12-08", "Domingo II do Advento"],
    ["Imaculada transferida", "2019-12-09", "Imaculada Conceição de Nossa Senhora"],
    ["8/12/2024 é domingo", "2024-12-08", "Domingo II do Advento"],
    ["Imaculada transferida", "2024-12-09", "Imaculada Conceição de Nossa Senhora"],
    ["Imaculada sem impedimento", "2026-12-08", "Imaculada Conceição de Nossa Senhora"],
    // São José em domingo Laetare
    ["19/3/2023 é Laetare", "2023-03-19", "Domingo Laetare"],
    ["São José transferido", "2023-03-20", "São José, esposo de Nossa Senhora"],
    // Anunciação em Semana Santa pula a Oitava da Páscoa inteira
    ["25/3/2016 é Sexta Santa", "2016-03-25", "Sexta-feira Santa"],
    ["Anunciação transferida", "2016-04-04", "Anunciação de Nossa Senhora"],
    ["25/3/2024 é Segunda Santa", "2024-03-25", "Segunda-feira Santa"],
    ["Anunciação transferida", "2024-04-08", "Anunciação de Nossa Senhora"],
    // Finados em domingo vai para o dia 3
    ["2/11/2025 é domingo", "2025-11-02", "Domingo XXI depois de Pentecostes"],
    ["Finados transferido", "2025-11-03", "Comemoração de Todos os Fiéis Defuntos"],
    ["Finados sem impedimento", "2026-11-02", "Comemoração de Todos os Fiéis Defuntos"],
  ];
  for (const [rotulo, data, nome] of casos) {
    conferir(`${rotulo} (${data})`, diaLiturgico(dia(data)).nome, nome);
  }
  // a transferida guarda de onde veio
  conferir(
    "Imaculada registra a origem",
    diaLiturgico(dia("2024-12-09")).transferidaDe,
    "2024-12-08"
  );
});

// ------------------------------------------- Têmporas, Rogações e Santoral

suite("Têmporas, Rogações e Santoral", () => {
  const nomes: [string, string, string][] = [
    ["Têmporas do Advento, quarta", "2026-12-16", "Quarta-feira das Têmporas do Advento"],
    ["Têmporas do Advento, sexta", "2026-12-18", "Sexta-feira das Têmporas do Advento"],
    ["Têmporas do Advento, sábado", "2026-12-19", "Sábado das Têmporas do Advento"],
    ["Têmporas da Quaresma, quarta", "2026-02-25", "Quarta-feira das Têmporas da Quaresma"],
    ["Têmporas da Quaresma, sábado", "2026-02-28", "Sábado das Têmporas da Quaresma"],
    ["Têmporas de Setembro, quarta", "2026-09-23", "Quarta-feira das Têmporas de Setembro"],
    ["Têmporas de Setembro, sábado", "2026-09-26", "Sábado das Têmporas de Setembro"],
    ["Filipe e Tiago em 11 de maio", "2026-05-11", "São Filipe e São Tiago, apóstolos"],
    ["Vigília de São João", "2026-06-23", "Vigília de São João Batista"],
    ["Batismo do Senhor", "2026-01-13", "Comemoração do Batismo do Senhor"],
    ["São Bruno, III classe", "2026-10-06", "São Bruno"],
    ["Santa Gertrudes, III classe", "2026-11-16", "Santa Gertrudes"],
    ["Santa Bibiana, III classe", "2026-12-02", "Santa Bibiana"],
    ["Feria de 3 de fevereiro", "2026-02-03", "Terça-feira"],
  ];
  for (const [rotulo, data, nome] of nomes) {
    conferir(`${rotulo} (${data})`, diaLiturgico(dia(data)).nome, nome);
  }

  // Rogações acontecem mesmo quando outra celebração ocupa a Missa
  for (const data of ["2026-05-11", "2026-05-12", "2026-05-13"]) {
    conferir(
      `Rogações em ${data}`,
      diaLiturgico(dia(data)).observacoes.some((o) => o.includes("Rogações")),
      true
    );
  }
  conferir(
    "Ladainhas maiores em 25 de abril",
    diaLiturgico(dia("2026-04-25")).observacoes.some((o) => o.includes("maiores")),
    true
  );

  // comemoração de IV classe entra na feria, mas não no domingo
  conferir(
    "São Brás comemorado na feria",
    diaLiturgico(dia("2026-02-03")).comemoracoes.includes("São Brás"),
    true
  );
  conferir(
    "IV classe omitida em domingo",
    diaLiturgico(dia("2026-10-25")).comemoracoes.includes("São Crisanto e Santa Daria"),
    false
  );
});

// ------------------------------------------------- desenvolvimento da Missa

suite("Desenvolvimento da Missa", () => {
  const casos: [string, Partial<Record<"gloria" | "credo", boolean>> & { prefacio?: string }][] = [
    ["2026-09-06", { gloria: true, credo: true, prefacio: "da Santíssima Trindade" }],
    ["2026-12-06", { gloria: false, credo: true, prefacio: "da Santíssima Trindade" }],
    ["2026-03-08", { gloria: false, credo: true, prefacio: "da Quaresma" }],
    ["2026-11-02", { gloria: false, credo: false, prefacio: "dos Defuntos" }],
    ["2026-08-15", { gloria: true, credo: true, prefacio: "de Nossa Senhora" }],
    ["2026-06-29", { gloria: true, credo: true, prefacio: "dos Apóstolos" }],
    ["2026-12-24", { gloria: false, credo: false, prefacio: "Comum" }],
    ["2026-05-24", { prefacio: "do Espírito Santo" }],
    ["2026-07-14", { prefacio: "Comum" }],
  ];
  for (const [data, esperado] of casos) {
    const d = desenvolvimentoDe(diaLiturgico(dia(data)));
    if (esperado.gloria !== undefined) conferir(`${data} Glória`, d.gloria, esperado.gloria);
    if (esperado.credo !== undefined) conferir(`${data} Credo`, d.credo, esperado.credo);
    if (esperado.prefacio) conferir(`${data} Prefácio`, d.prefacio, esperado.prefacio);
  }
});

// ------------------------------------------------------------- integridade

suite("Varredura de anos inteiros", () => {
  let dias = 0;
  let quebrados = 0;
  for (const ano of [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2033, 2038]) {
    for (let mes = 1; mes <= 12; mes += 1) {
      for (const d of mesLiturgico(ano, mes)) {
        dias += 1;
        const ok =
          Boolean(d.nome) &&
          !d.nome.includes("undefined") &&
          Boolean(d.cor) &&
          Boolean(d.tempo) &&
          d.classe >= 1 &&
          d.classe <= 4;
        if (!ok) quebrados += 1;
      }
    }
  }
  conferir(`${dias} dias em 9 anos sem defeito`, quebrados, 0);
});

// ------------------------------------------------------------------ saída

const total = passaram + falhas.length;
console.log(`\n${passaram}/${total} verificações passaram`);
if (falhas.length > 0) {
  console.log("\nfalhas:");
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
