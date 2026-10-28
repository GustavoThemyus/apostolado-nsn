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
import {
  ANOS_COM_ORDO,
  analisarMissa,
  carregarOrdo,
  celebracoesDoOrdo,
  type DiaDoOrdo,
  ehFestaMaiorDoOrdo,
  mesDoOrdo,
  naMissaDoOrdo,
  temOrdo,
} from "./ordo";
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
    em("2026-04-15")?.resto, ["Missa Quasi modo do domingo precedente"]);
  conferir("e à comemoração colada com dois pontos",
    em("2026-12-05")?.resto, ["Missa Ad te levavi do domingo precedente"]);
  conferir("a linha não repete o que a tabela diz",
    em("2026-01-06")?.resto, ["Missa Ecce advenit"]);

  /*
   * As orações que se acrescentam à do dia, na casa delas.
   *
   * Pedido do Perez. Antes caíam no `resto` e eram lidas como parte do nome
   * da Missa: "Missa Ecce advenit da festa; oração Deus, qui salutis e
   * Ecclesiæ" aparecia inteiro na casa "Missa".
   *
   * O caso que obriga a cortar dentro do segmento é o terceiro: o Ordo gruda
   * a oração na comemoração com um " e ", e sem o corte o nome do santo
   * comemorado saía com a oração pendurada.
   */
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

  /*
   * Nenhuma oração pode ficar presa no `resto`.
   *
   * É a conferência que vale mais do que as de cima, porque é a que percorre
   * os 365 dias: o Ordo escreve estas frases de dezenas de maneiras, e uma
   * forma nova não dá erro nenhum — ela só volta a aparecer na casa "Missa",
   * calada, como estava antes deste campo existir.
   */
  conferir("nenhuma oração sobra na casa da Missa",
    dias2026.flatMap((d) => naMissaDoOrdo(d)?.resto ?? [])
      .filter((r) => /\boraç(ão|ões)\b/i.test(r)), []);

  /*
   * As comemorações não podem sumir numa reimportação.
   *
   * O Perez avisou que mudou a forma no calendário — tirou o "comemoração
   * de" antes do nome do primeiro santo. Quem as reconhece aqui é a palavra
   * "comemoração" no segmento; sem ela, elas caem no `resto` e a casa
   * Comemoração fica vazia, sem erro nenhum. Em 2026 são 179 dias dos 362
   * que têm tabela; o piso é generoso de propósito, para pegar o colapso e
   * não a variação de um ano para o outro.
   */
  conferir("as comemorações continuam sendo reconhecidas",
    dias2026.filter((d) => (naMissaDoOrdo(d)?.comemoracoes.length ?? 0) > 0).length > 120, true);

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

  {
    /*
     * A bolinha maior da grade sai daqui, e o risco é a palavra vizinha: o
     * Ordo escreve "féria maior de 2ª ordem" e "Oitava privilegiada de 1ª
     * ordem", que não são classe nenhuma. Se a busca afrouxar para o número
     * sozinho, 51 dias comuns viram festa maior e a marca perde o sentido.
     */
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
    /*
     * As celebrações do dia.
     *
     * A primeira conferência é a que vale: **nada se perde e nada se
     * repete.** O separador olha a forma das linhas do Perez, e forma é
     * coisa que varia — um dia escreve "No Brasil:" e outro "No Brasil", um
     * anuncia a celebração por rótulo e outro só pelo posto. Se um dia
     * dessas linhas mudar, o pior desfecho não é a estrutura sair errada: é
     * uma linha sumir da tela sem ninguém ver sumir.
     */
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
        ...(c.missa ? [c.missa] : []),
        ...c.notas,
        ...c.permitidas,
      ]);
      const ordenar = (lista: string[]) => [...lista].sort();
      if (JSON.stringify(ordenar(recolhidas)) !== JSON.stringify(ordenar(dia.partes))) {
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

    conferir("31 celebrações rotuladas em 2026", comRotulo, 31);
    conferir("em 35 dias o dia tem mais de uma celebração", comSegunda, 35);
    conferir("os três rótulos do Ordo, com as contagens dele",
      [...porRotulo.entries()].sort((a, b) => a[0].localeCompare(b[0])),
      [["Na Igreja Catedral", 1],
       ["Na Igreja Catedral da Arquidiocese da Paraíba", 2],
       ["No Brasil", 2],
       ["No Calendário Universal", 26]]);

    // 27 de abril: a Missa da capela e a do Calendário Universal, inteiras
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

    /*
     * O Tríduo: a primeira linha não começa em "Missa", e começa em "Rito:",
     * porque ali o que se faz é a ação litúrgica do dia. Ela tem de seguir
     * em destaque — exigir a palavra "Missa" a jogava na lista de notas, no
     * meio das rubricas sobre velas e toalhas de altar.
     */
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

    /*
     * A Vigília de Pentecostes escreve, debaixo de "Nas Missas privadas",
     * uma Missa que não é a do dia. Promovê-la mostraria como Missa
     * principal o que é exceção.
     */
    const pentecostes = celebracoesDoOrdo({
      ...de2026.dias["2026-05-23"],
      data: new Date("2026-05-23T00:00:00Z"),
      tempo: "pascoa",
    } as DiaDoOrdo);
    conferir("a Missa privada da Vigília fica com a rubrica dela",
      pentecostes[0].notas.some((n) => /^Missa Cum sanctificatus/.test(n)), true);

    /*
     * 3 de maio é o caso que não pode regredir: o Ordo diz "Missa como
     * acima, exceto…" em vez de repeti-la. A celebração fica sem Missa de
     * propósito, e a rubrica é que carrega o recado.
     */
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
    /*
     * O formato combinado com o Perez para o Ordo de 2027: as Missas que a
     * capela pode dizer no lugar da principal vêm debaixo de uma linha só, e
     * são coisa diferente do mesmo dia noutro calendário.
     *
     * Em 2026 não há nenhum dia assim, porque a convenção é nova. Este dia é
     * construído, e é justamente por isso que ele existe: sem ele eu estaria
     * prometendo ao Perez um formato que ninguém leu.
     */
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
