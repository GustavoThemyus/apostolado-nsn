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

  // cobertura: se a leitura regredir, estes números caem
  const comTabela = dias2026.map(naMissaDoOrdo).filter((n) => n !== null);
  const conta = (f: (n: NonNullable<typeof comTabela[number]>) => boolean) =>
    comTabela.filter((n) => f(n!)).length;
  conferir("362 dos 365 dias têm linha de Missa", comTabela.length, 362);
  conferir("todo dia com linha de Missa tem Prefácio", conta((n) => !!n.prefacio), 362);
  conferir("todo dia com linha de Missa tem fecho", conta((n) => !!n.fecho), 362);
  conferir("Glória em 298 dias", conta((n) => n.gloria), 298);
  conferir("Credo em 196 dias", conta((n) => n.credo), 196);

  const total = passaram + falhas.length;
  console.log(`\nOrdo pré-55: ${passaram}/${total}`);
  if (falhas.length > 0) {
    for (const f of falhas) console.log(`  ${f}`);
    process.exit(1);
  }
}

rodar();
