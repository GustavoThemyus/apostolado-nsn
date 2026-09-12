/**
 * Suíte do Ordo pré-55. Roda junto com `npm test`.
 *
 * Este calendário não é calculado: é copiado do Ordo que a capela publica. O
 * que se confere aqui, então, não é regra litúrgica — é que a cópia chegou
 * inteira e na forma que a tela espera. Um dia faltando no meio do ano deixa
 * um buraco na grade; uma cor fora das seis pinta a bolinha de nada.
 *
 * A conferência contra o .ics de origem é outra, e mora em
 * ferramentas/ordo/conferir.py, junto de quem faz a importação.
 */

import { ANOS, ARQUIVOS } from "../data/ordo/indice";
import { penitenciaDe } from "./penitencia";
import { diaLiturgico } from "./precedencia";
import { ANOS_COM_ORDO, carregarOrdo, mesDoOrdo, naMissaDoOrdo, temOrdo } from "./ordo";
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

  for (const ano of ANOS_COM_ORDO) {
    const arquivo = await carregarOrdo(ano);
    if (!arquivo) {
      falhas.push(`${ano}: o índice promete o arquivo e ele não abre`);
      continue;
    }

    conferir(`${ano}: o arquivo diz de que ano é`, arquivo.ano, ano);
    conferir(`${ano}: o ano não tem buracos`,
      Object.keys(arquivo.dias).length, bissexto(ano) ? 366 : 365);

    const semNome: string[] = [];
    const semGrau: string[] = [];
    const corEstranha: string[] = [];
    const foraDoAno: string[] = [];
    for (const [data, dia] of Object.entries(arquivo.dias)) {
      if (!dia.nome?.trim()) semNome.push(data);
      if (!dia.grau?.trim()) semGrau.push(data);
      if (!CORES.includes(dia.cor)) corEstranha.push(`${data}=${dia.cor}`);
      if (!data.startsWith(`${ano}-`)) foraDoAno.push(data);
    }
    conferir(`${ano}: todo dia tem celebração`, semNome, []);
    conferir(`${ano}: todo dia tem grau`, semGrau, []);
    conferir(`${ano}: as cores são as seis litúrgicas`, corEstranha, []);
    conferir(`${ano}: nenhum dia de outro ano no arquivo`, foraDoAno, []);

    // o mês volta com a quantidade certa de dias e com o tempo calculado
    const janeiro = mesDoOrdo(arquivo, ano, 1);
    conferir(`${ano}: janeiro tem 31 dias`, janeiro.length, 31);
    conferir(`${ano}: o tempo vem calculado`, typeof janeiro[0].tempo, "string");
    conferir(`${ano}: a data vem em UTC, sem hora`,
      janeiro[0].data.toISOString(), `${ano}-01-01T00:00:00.000Z`);
    const dezembro = mesDoOrdo(arquivo, ano, 12);
    conferir(`${ano}: dezembro tem 31 dias`, dezembro.length, 31);
    conferir(`${ano}: fevereiro tem o que o ano manda`,
      mesDoOrdo(arquivo, ano, 2).length, bissexto(ano) ? 29 : 28);
  }

  /*
   * Três dias do Ordo de 2026, conferidos contra o que a capela publicou. São
   * a prova de que o importador leu o grau e a cor do lugar certo — e a Sexta
   * Santa está aí porque é o único preto do ano: se a cor vier de outro campo,
   * ela é a primeira a sair errada.
   */
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

  /*
   * A leitura da linha da Missa.
   *
   * Ela é a única parte do pré-55 que interpreta alguma coisa, e por isso é a
   * única que pode errar em silêncio: um "Glória" perdido não quebra nada, só
   * mente. Os casos abaixo são os que já me pegaram — a Glória colada ao
   * nome da Missa depois de dois pontos, o Credo com o motivo entre
   * parênteses, e o "Prefácio e Communicantes", que é uma frase só.
   */
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

  /*
   * O que sobra da linha depois da tabela.
   *
   * Perez pediu para tirar da linha o itinerário que a tabela já mostra, e
   * deixar só o que muda. Dois casos já me pegaram, e os dois são o Ordo
   * colando o primeiro item ao nome da Missa com dois pontos: sem separar
   * ali, o nome da Missa ia embora junto com a Glória ou com a comemoração, e
   * a linha ficava vazia.
   */
  conferir("o nome da Missa sobrevive à Glória colada com dois pontos",
    em("2026-04-15")?.resto, ["Missa Quasi modo do domingo precedente", "oração Concede e Ecclesiæ"]);
  conferir("e à comemoração colada com dois pontos",
    em("2026-12-05")?.resto, ["Missa Ad te levavi do domingo precedente"]);
  conferir("a linha não repete o que a tabela diz",
    em("2026-01-06")?.resto, ["Missa Ecce advenit"]);

  // cobertura: se a leitura regredir, estes números caem
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

  /*
   * Os PDF do próprio da Missa, que o redator anexa ao dia. São os domingos e
   * as festas maiores; o resto ainda está por fazer, e por isso o número é de
   * cobertura, não de contagem fechada — se cair, alguma coisa se perdeu na
   * importação.
   */
  if (de2026) {
    const comAnexo = Object.values(de2026.dias).filter((d) => d.anexos?.length);
    conferir("92 dias trazem o próprio da Missa", comAnexo.length, 92);
    conferir("todo anexo tem nome e endereço",
      comAnexo.flatMap((d) => d.anexos!).filter((a) => !a.nome || !a.url).length, 0);
    conferir("todo anexo aponta para o Drive",
      comAnexo.flatMap((d) => d.anexos!).filter((a) => !a.url.startsWith("https://drive.google.com/")).length, 0);
    conferir("o Natal traz as três Missas", de2026.dias["2026-12-25"]?.anexos?.length, 3);
  }

  /*
   * A abstinência do calendário de 1962, medida contra o Ordo.
   *
   * A regra de `penitencia.ts` não veio do cânon 1252 na forma universal: veio
   * de ler o que o Ordo da capela marca nos 365 dias de 2026. Este bloco é o
   * que prova que ela continua batendo — e é também onde está registrado o
   * único dia em que as duas discordam.
   */
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

  const total = passaram + falhas.length;
  console.log(`\nOrdo pré-55: ${passaram}/${total}`);
  if (falhas.length > 0) {
    for (const f of falhas) console.log(`  ${f}`);
    process.exit(1);
  }
}

rodar();
