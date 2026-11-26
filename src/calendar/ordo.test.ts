import { ANOS, ARQUIVOS, ATE } from "../data/ordo/indice";
import { penitenciaDe } from "./penitencia";
import { diaLiturgico } from "./precedencia";
import {
  ANOS_COM_ORDO,
  analisarMissa,
  carregarOrdo,
  celebracoesDoOrdo,
  ladosDoDia,
  type DiaDoOrdo,
  ehFestaMaiorDoOrdo,
  mesDoOrdo,
  naMissaDoOrdo,
  temOrdo,
} from "./ordo";
import { folhetoDoDia } from "./proprioDoDia";
import type { Cor } from "./tipos";

let passaram = 0;
const falhas: string[] = [];

const conferir = (rotulo: string, obtido: unknown, esperado: unknown) => {
  if (JSON.stringify(obtido) === JSON.stringify(esperado)) passaram += 1;
  else falhas.push(`${rotulo}: ${JSON.stringify(obtido)} != ${JSON.stringify(esperado)}`);
};

const CORES: Cor[] = ["branco", "vermelho", "verde", "roxo", "preto", "rosa"];
const bissexto = (a: number) => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;

async function rodar() {
  conferir("o índice e os arquivos falam dos mesmos anos",
    ANOS_COM_ORDO, Object.keys(ARQUIVOS).map(Number).sort((a, b) => a - b));
  conferir("há ao menos um ano publicado", ANOS.length > 0, true);
  conferir("ano sem Ordo é reconhecido como tal", temOrdo(1900), false);

  {
    const c = (nome: string, mais: object = {}) =>
      ({ missa: nome, notas: [], permitidas: [], ...mais });
    const { daqui, universal } = ladosDoDia([
      c("a"), c("b", { alternativa: true }),
      c("c", { rotulo: "Na Igreja universal" }), c("d", { alternativa: true }),
    ]);
    conferir("as daqui ficam no primeiro painel", daqui.map((x) => x.missa), ["a", "b"]);
    conferir("as da Igreja universal ficam no segundo",
      universal.map((x) => x.missa), ["c", "d"]);
  }

  for (const ano of ANOS_COM_ORDO) {
    const arquivo = await carregarOrdo(ano);
    if (!arquivo) {
      falhas.push(`${ano}: o índice promete o arquivo e ele não abre`);
      continue;
    }

    conferir(`${ano}: o arquivo diz de que ano é`, arquivo.ano, ano);
    const ate = ATE[ano];
    const esperados = (Date.parse(ate) - Date.UTC(ano, 0, 1)) / 86_400_000 + 1;
    conferir(`${ano}: não há buracos até ${ate}`,
      Object.keys(arquivo.dias).length, esperados);

    const semNome: string[] = [];
    const semGrau: string[] = [];
    const corEstranha: string[] = [];
    const foraDoAno: string[] = [];
    for (const [data, dia] of Object.entries(arquivo.dias)) {
      if (!dia.nome?.trim()) semNome.push(data);
      if (!(dia.rito ?? dia.grau)?.trim()) semGrau.push(data);
      if (!CORES.includes(dia.cor)) corEstranha.push(`${data}=${dia.cor}`);
      if (!data.startsWith(`${ano}-`)) foraDoAno.push(data);
    }
    conferir(`${ano}: todo dia tem celebração`, semNome, []);
    conferir(`${ano}: todo dia tem rito`, semGrau, []);
    conferir(`${ano}: as cores são as seis litúrgicas`, corEstranha, []);
    conferir(`${ano}: nenhum dia de outro ano no arquivo`, foraDoAno, []);

    if (ano >= 2027) {
      const todos = Array.from({ length: Number(ate.slice(5, 7)) }, (_, i) =>
        mesDoOrdo(arquivo, ano, i + 1)).flat();
      const linhas = (l: string[]) => [...l].sort();
      const perdeu = todos.filter((d) =>
        JSON.stringify(linhas(celebracoesDoOrdo(d).flatMap((c) =>
          [...(c.missa ? [c.missa] : []), ...c.notas, ...c.permitidas]))) !==
        JSON.stringify(linhas([...d.partes, ...(d.outras ?? []).flatMap((o) => o.partes)])));
      conferir(`${ano}: nenhuma linha se perde nem se repete`, perdeu.length, 0);

      const missas = todos.flatMap((d) => celebracoesDoOrdo(d)
        .map((c) => [d.data.toISOString().slice(0, 10), c] as const));
      conferir(`${ano}: só a Sexta-feira e o Sábado Santo ficam sem tabela`,
        missas.filter(([, c]) => !analisarMissa(c.missa))
          .map(([d]) => d.slice(5)).filter((d) => !["03-26", "03-27"].includes(d)), []);
      conferir(`${ano}: toda tabela reconhece a despedida e o Prefácio`,
        missas.map(([, c]) => analisarMissa(c.missa))
          .filter((n) => n && (!n.fecho || !n.prefacio)).length, 0);
      conferir(`${ano}: a Oração sobre o povo não entra nas orações do tempo`,
        missas.map(([, c]) => analisarMissa(c.missa))
          .filter((n) => n?.oracoes.some((o) => /sobre o povo/i.test(o))).length, 0);
      const quartaDeCinzas = todos.find((d) => d.nome === "Quarta-feira de Cinzas");
      conferir(`${ano}: nas Cinzas há Oração sobre o povo`,
        quartaDeCinzas && naMissaDoOrdo(quartaDeCinzas)?.oracaoSobreOPovo, true);
      conferir(`${ano}: toda Missa extra tem nome, rito e cor`,
        todos.flatMap((d) => d.outras ?? [])
          .filter((o) => !o.nome || !o.rito || !CORES.includes(o.cor)).length, 0);
    }

    const janeiro = mesDoOrdo(arquivo, ano, 1);
    conferir(`${ano}: janeiro tem 31 dias`, janeiro.length, 31);
    conferir(`${ano}: o tempo vem calculado`, typeof janeiro[0].tempo, "string");
    conferir(`${ano}: a data vem em UTC, sem hora`,
      janeiro[0].data.toISOString(), `${ano}-01-01T00:00:00.000Z`);
    const completo = ate === `${ano}-12-31`;
    if (completo) {
      conferir(`${ano}: dezembro tem 31 dias`, mesDoOrdo(arquivo, ano, 12).length, 31);
    } else {
      const [mes, dia] = [Number(ate.slice(5, 7)), Number(ate.slice(8))];
      conferir(`${ano}: o último dia publicado tem Ordo`, temOrdo(ano, mes, dia), true);
      conferir(`${ano}: o dia seguinte não tem`, temOrdo(ano, mes, dia + 1), false);
    }
    conferir(`${ano}: fevereiro tem o que o ano manda`,
      mesDoOrdo(arquivo, ano, 2).length, bissexto(ano) ? 29 : 28);
  }

  const de2026 = await carregarOrdo(2026);
  if (de2026) {
    conferir("Epifania: grau", de2026.dias["2026-01-06"]?.grau,
      "Duples de 1ª classe com Oitava privilegiada de 2ª ordem");
    conferir("Sexta-feira Santa: cor", de2026.dias["2026-04-03"]?.cor, "preto");
    conferir("Natal: dia santo de guarda", de2026.dias["2026-12-25"]?.guarda, true);
    conferir("as oitavas existem, que é o que o de 1962 não tem",
      de2026.dias["2026-01-07"]?.nome, "Dia segundo da Oitava da Epifania");
  } else {
    falhas.push("2026: o Ordo não abriu");
  }

  const dias2026 = de2026
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].flatMap((m) => mesDoOrdo(de2026, 2026, m))
    : [];
  const em = (data: string) => {
    const dia = dias2026.find((d) => d.data.toISOString().startsWith(data));
    return dia ? naMissaDoOrdo(dia) : null;
  };

  conferir("Epifania: Glória e Credo", [em("2026-01-06")?.gloria, em("2026-01-06")?.credo],
    [true, true]);
  conferir("Epifania: o Prefácio vem com o Communicantes próprio",
    [em("2026-01-06")?.prefacio, em("2026-01-06")?.communicantes], ["da Epifania", true]);
  conferir("féria menor: sem Glória e sem Credo",
    [em("2026-02-16")?.gloria, em("2026-02-16")?.credo], [false, false]);
  conferir("féria menor: fecha com Benedicamus Domino",
    em("2026-02-16")?.fecho, "Benedicamus Domino");
  conferir("São Jorge: o Ordo diz por que há Credo",
    [em("2026-04-23")?.credo, em("2026-04-23")?.credoPorque], [true, "por causa da Oitava"]);
  conferir("Glória colada ao nome da Missa depois de dois pontos",
    em("2026-04-15")?.gloria, true);
  conferir("São João Batista: I classe e ainda assim sem Credo",
    em("2026-06-24")?.credo, false);
  conferir("Sexta-feira Santa não tem linha de Missa", em("2026-04-03"), null);

  conferir("o nome da Missa sobrevive à Glória colada com dois pontos",
    em("2026-04-15")?.resto, ["Missa Quasi modo do domingo precedente"]);
  conferir("e à comemoração colada com dois pontos",
    em("2026-12-05")?.resto, ["Missa Ad te levavi do domingo precedente"]);
  conferir("a linha não repete o que a tabela diz",
    em("2026-01-06")?.resto, ["Missa Ecce advenit"]);

  conferir("a oração sai do nome da Missa",
    em("2026-04-15")?.oracoes, ["oração Concede e Ecclesiæ"]);
  conferir("a oração de duas partes não vira duas",
    em("2026-01-02")?.oracoes, ["oração Deus, qui salutis e Ecclesiæ"]);
  conferir("a oração grudada na comemoração se separa dela",
    em("2026-01-05")?.oracoes, ["oração Deus, qui salutis"]);
  conferir("e a comemoração fica só com o santo",
    em("2026-01-05")?.comemoracoes, ["comemoração de São Telésforo Papa e Mártir"]);
  conferir("dia sem oração acrescentada não ganha casa",
    em("2026-01-06")?.oracoes, []);

  conferir("Orações próprias não é oração do tempo",
    em("2026-01-22")?.oracoes, ["oração Deus, qui salutis e oração Ecclesiæ"]);
  conferir("e volta para o lado do nome da Missa",
    em("2026-01-22")?.resto.includes("Orações próprias"), true);
  conferir("oração única também não é do tempo",
    em("2026-03-29")?.oracoes, []);

  conferir("na casa da Missa só sobram as orações sem nome",
    [...new Set(dias2026.flatMap((d) => naMissaDoOrdo(d)?.resto ?? [])
      .filter((r) => /\boraç(ão|ões)\b/i.test(r)))].sort(),
    ["Oração, Epístola e Evangelho próprios",
     "Orações e Epístola próprias",
     "Orações e Evangelho próprios",
     "Orações e Evangelhos próprios",
     "Orações próprias",
     "oração única"]);

  conferir("a rubrica que cita o Último Evangelho não vira o Último Evangelho",
    em("2026-04-02")?.ultimoEvangelho, undefined);
  conferir("e ela chega inteira à casa da Missa",
    em("2026-04-02")?.resto.some((r) => r.endsWith("Santíssimo Sacramento)")), true);
  conferir("o Último Evangelho condicional dos Ramos também fica na rubrica",
    em("2026-03-29")?.ultimoEvangelho, undefined);
  conferir("39 celebrações dizem qual é o Último Evangelho",
    dias2026.flatMap((d) => celebracoesDoOrdo(d))
      .filter((c) => analisarMissa(c.missa)?.ultimoEvangelho).length, 39);

  conferir("as comemorações continuam sendo reconhecidas",
    dias2026.filter((d) => (naMissaDoOrdo(d)?.comemoracoes.length ?? 0) > 0).length > 120, true);

  const comTabela = dias2026.map(naMissaDoOrdo).filter((n) => n !== null);
  const conta = (f: (n: NonNullable<typeof comTabela[number]>) => boolean) =>
    comTabela.filter((n) => f(n!)).length;
  conferir("362 dos 365 dias têm linha de Missa", comTabela.length, 362);
  conferir("todo dia com linha de Missa tem Prefácio", conta((n) => !!n.prefacio), 362);
  conferir("todo dia com linha de Missa tem fecho", conta((n) => !!n.fecho), 362);
  conferir("Glória em 298 dias", conta((n) => n.gloria), 298);
  conferir("Credo em 196 dias", conta((n) => n.credo), 196);
  conferir("nenhum dia fica sem o nome da Missa na linha",
    conta((n) => !n.resto.some((r) => /^Missa/.test(r))), 0);
  conferir("e nenhum repete o itinerário que a tabela já mostra",
    conta((n) => n.resto.some((r) => /Glória|Credo|Prefácio|Ite, Missa|Benedicamus/.test(r))), 0);

  if (de2026) {
    const dias = ["11-29", "12-06", "12-08", "12-12", "12-13", "12-20", "12-24"];
    conferir("os próprios do Advento são achados pelo anexo do dia",
      dias.map((d) => folhetoDoDia(de2026.dias[`2026-${d}`]?.anexos)),
      ["proprio-advento-i", "proprio-advento-ii", "proprio-imaculada-conceicao",
        "proprio-guadalupe", "proprio-advento-iii", "proprio-advento-iv",
        "proprio-vigilia-do-natal"]);
  }

  if (de2026) {
    const comAnexo = Object.values(de2026.dias).filter((d) => d.anexos?.length);
    conferir("87 dias trazem o próprio da Missa", comAnexo.length, 87);
    conferir("todo anexo tem nome e endereço",
      comAnexo.flatMap((d) => d.anexos!).filter((a) => !a.nome || !a.url).length, 0);
    conferir("todo anexo aponta para o Drive",
      comAnexo.flatMap((d) => d.anexos!).filter((a) => !a.url.startsWith("https://drive.google.com/")).length, 0);
    conferir("o Natal traz as três Missas", de2026.dias["2026-12-25"]?.anexos?.length, 3);
  }

  if (de2026) {
    const doOrdo = (data: string) => de2026.dias[data]?.penitencia;
    const calculada = (data: string) =>
      penitenciaDe(diaLiturgico(new Date(`${data}T00:00:00Z`)));

    let batem = 0;
    const divergem: string[] = [];
    for (const data of Object.keys(de2026.dias)) {
      if (doOrdo(data) === calculada(data)) batem += 1;
      else divergem.push(`${data}: Ordo ${doOrdo(data) ?? "—"}, calculado ${calculada(data) ?? "—"}`);
    }
    conferir("a regra de 1962 bate com o Ordo em 364 dos 365", batem, 364);
    conferir(
      "a única divergência é o Sacratíssimo Coração, que o Ordo dispensa por provisão própria",
      divergem,
      ["2026-06-12: Ordo dispensada, calculado abstinencia"],
    );

    conferir("Cinzas: jejum e abstinência", calculada("2026-02-18"), "jejum-e-abstinencia");
    conferir("Sexta-feira Santa: jejum e abstinência", calculada("2026-04-03"), "jejum-e-abstinencia");
    conferir("sexta comum: abstinência", calculada("2026-09-25"), "abstinencia");
    conferir("quinta-feira: nada", calculada("2026-09-24"), undefined);
    conferir("Natal numa sexta: dispensada", calculada("2026-12-25"), "dispensada");
    conferir("sexta da Oitava da Páscoa: abstinência, que féria não dispensa",
      calculada("2026-04-10"), "abstinencia");

    const contar = (q: string) =>
      Object.values(de2026.dias).filter((d) => d.penitencia === q).length;
    conferir("o Ordo marca 49 abstinências, 2 jejuns e 2 dispensas",
      [contar("abstinencia"), contar("jejum-e-abstinencia"), contar("dispensada")],
      [49, 2, 2]);
  }

  {
    const maiores = Object.values(de2026.dias).filter(ehFestaMaiorDoOrdo);
    conferir("81 festas de 1ª ou 2ª classe em 2026", maiores.length, 81);

    const porGrau = (q: string) =>
      Object.values(de2026.dias).filter((d) => d.grau === q);
    conferir("'Duples de 1ª classe' é festa maior",
      porGrau("Duples de 1ª classe").every(ehFestaMaiorDoOrdo), true);
    conferir("'Féria maior de 2ª ordem, simples' não é: ordem não é classe",
      porGrau("Féria maior de 2ª ordem, simples").some(ehFestaMaiorDoOrdo), false);
    conferir("'Oitava privilegiada de 1ª ordem, semiduples' também não",
      porGrau("Oitava privilegiada de 1ª ordem, semiduples").some(ehFestaMaiorDoOrdo), false);
    conferir("'Duples maior' não é festa maior, apesar do nome",
      porGrau("Duples maior").some(ehFestaMaiorDoOrdo), false);
  }

  {
    const perdidas: string[] = [];
    let comSegunda = 0;
    let comRotulo = 0;
    const porRotulo = new Map<string, number>();

    for (const [data, bruto] of Object.entries(de2026.dias)) {
      const dia = { ...bruto, data: new Date(`${data}T00:00:00Z`), tempo: "tempo-comum" } as DiaDoOrdo;
      const celebracoes = celebracoesDoOrdo(dia);

      const recolhidas = celebracoes.flatMap((c) => [
        ...(c.rotulo ? [c.rotulo] : []),
        ...(c.posto ? [c.posto] : []),
        ...(c.proprio ? [c.proprio] : []),
        ...(c.missa ? [c.missa] : []),
        ...c.notas,
        ...c.permitidas,
      ]);
      const emLinhas = (lista: string[]) =>
        lista.flatMap((t) => t.split("\n").map((l) => l.trim()).filter(Boolean)).sort();
      if (JSON.stringify(emLinhas(recolhidas)) !== JSON.stringify(emLinhas(dia.partes))) {
        perdidas.push(`${data}: ${dia.partes.length} linhas viraram ${recolhidas.length}`);
      }

      if (celebracoes.length > 1) comSegunda += 1;
      for (const c of celebracoes.slice(1)) {
        if (c.rotulo) {
          comRotulo += 1;
          const chave = c.rotulo.replace(/\s*:\s*$/, "").trim();
          porRotulo.set(chave, (porRotulo.get(chave) ?? 0) + 1);
        }
      }
    }

    conferir("celebrações: nenhuma linha se perde nem se repete em 2026",
      perdidas, []);
    conferir("celebrações: a primeira é sempre a da capela",
      celebracoesDoOrdo({
        ...de2026.dias["2026-02-26"],
        data: new Date("2026-02-26T00:00:00Z"),
        tempo: "quaresma",
      } as DiaDoOrdo).length, 1);

    {
      const comProprio = Object.entries(de2026.dias).flatMap(([data, bruto]) =>
        celebracoesDoOrdo({
          ...bruto, data: new Date(`${data}T00:00:00Z`), tempo: "tempo-comum",
        } as DiaDoOrdo).filter((c) => c.proprio).map((c) => [data, c] as const));
      conferir("39 celebrações dizem de que próprio sai a Missa", comProprio.length, 39);
      conferir("e todas elas continuam abrindo em 'Missa'",
        comProprio.filter(([, c]) => !c.missa?.startsWith("Missa")).length, 0);
      conferir("os títulos são os do Ordo",
        [...new Set(comProprio.map(([, c]) => c.proprio))].sort(),
        ["Próprio da Arquidiocese da Paraíba", "Próprio do Brasil",
         "Quatro Têmporas da Quaresma", "Quatro Têmporas de Pentecostes",
         "Quatro Têmporas de Setembro", "Quatro Têmporas do Advento"]);
      conferir("a Dedicação de Santa Maria das Neves sai do próprio da Arquidiocese",
        comProprio.find(([d]) => d === "2026-08-05")?.[1].proprio,
        "Próprio da Arquidiocese da Paraíba");
      conferir("o parágrafo recuado debaixo de rubrica não vira título",
        comProprio.some(([d]) => d === "2026-07-02"), false);
    }

    conferir("31 celebrações rotuladas em 2026", comRotulo, 31);
    conferir("em 35 dias o dia tem mais de uma celebração", comSegunda, 35);
    conferir("os três rótulos do Ordo, com as contagens dele",
      [...porRotulo.entries()].sort((a, b) => a[0].localeCompare(b[0])),
      [["Na Igreja Catedral", 1],
       ["Na Igreja Catedral da Arquidiocese da Paraíba", 2],
       ["No Brasil", 2],
       ["No Calendário Universal", 26]]);

    const abril27 = celebracoesDoOrdo({
      ...de2026.dias["2026-04-27"],
      data: new Date("2026-04-27T00:00:00Z"),
      tempo: "pascoa",
    } as DiaDoOrdo);
    conferir("27 de abril tem duas celebrações", abril27.length, 2);
    conferir("a segunda é a do Calendário Universal", abril27[1].rotulo?.trim(),
      "No Calendário Universal:");
    conferir("e traz o posto daquele calendário", abril27[1].posto,
      "São Pedro Canísio Confessor e Doutor da Igreja, duples – cor branca");
    conferir("a Missa dela é lida como a da capela",
      analisarMissa(abril27[1].missa)?.gloria, true);

    for (const data of ["2026-04-03", "2026-04-04", "2026-05-23"]) {
      const c = celebracoesDoOrdo({
        ...de2026.dias[data],
        data: new Date(`${data}T00:00:00Z`),
        tempo: "quaresma",
      } as DiaDoOrdo);
      conferir(`${data}: a abertura do rito é a primeira linha`,
        c[0]?.missa?.startsWith("Rito:"), true);
      conferir(`${data}: e não se analisa em campos`, analisarMissa(c[0]?.missa), null);
    }

    const pentecostes = celebracoesDoOrdo({
      ...de2026.dias["2026-05-23"],
      data: new Date("2026-05-23T00:00:00Z"),
      tempo: "pascoa",
    } as DiaDoOrdo);
    conferir("a Missa privada da Vigília fica com a rubrica dela",
      pentecostes[0].notas.some((n) => /^Missa Cum sanctificatus/.test(n)), true);

    const maio3 = celebracoesDoOrdo({
      ...de2026.dias["2026-05-03"],
      data: new Date("2026-05-03T00:00:00Z"),
      tempo: "pascoa",
    } as DiaDoOrdo);
    conferir("3 de maio: a segunda celebração não repete a Missa",
      maio3[1]?.missa, undefined);
    conferir("3 de maio: a rubrica é que diz 'como acima'",
      maio3[1]?.notas.some((n) => /Missa como acima/.test(n)), true);
  }

  {
    const dia = {
      data: new Date("2027-01-14T00:00:00Z"),
      tempo: "tempo-comum",
      nome: "Dia quinto da Oitava da Epifania",
      cor: "branco",
      grau: "Semiduples",
      partes: [
        "Missa Ecce advenit; Glória; Credo; Prefácio da Epifania; Ite, Missa est",
        "➢ Missas permitidas: exequial; votiva solene",
        "Pode-se celebrar, à escolha:",
        "São Hilário Bispo, Confessor e Doutor, duples – cor branca",
        "Missa In medio; Glória; comemoração da Oitava; Credo; Ite, Missa est",
        "São Félix de Nola Mártir, simples – cor vermelha",
        "Missa Os justi; sem Glória; comemoração da Oitava; Ite, Missa est",
        "No Calendário Universal:",
        "São Hilário, duples – cor branca",
        "Missa In medio; Glória; comemoração de São Félix; Credo; Ite, Missa est",
      ],
    } as unknown as DiaDoOrdo;

    const c = celebracoesDoOrdo(dia);
    conferir("à escolha: a principal, duas opções e o universal", c.length, 4);
    conferir("a principal não é alternativa", c[0].alternativa, undefined);
    conferir("as duas do meio são", [c[1].alternativa, c[2].alternativa], [true, true]);
    conferir("o universal não é, apesar de vir depois", c[3].alternativa, undefined);
    conferir("e ele mantém o rótulo", c[3].rotulo?.trim(), "No Calendário Universal:");
    conferir(
      "a linha que abre a escolha não sobra como nota em lugar nenhum",
      c.flatMap((x) => x.notas).filter((n) => /à escolha/i.test(n)),
      [],
    );
  }

  const total = passaram + falhas.length;
  console.log(`\nOrdo pré-55: ${passaram}/${total}`);
  if (falhas.length > 0) {
    for (const f of falhas) console.log(`  ${f}`);
    process.exit(1);
  }
}

rodar();
