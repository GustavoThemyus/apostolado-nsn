import { eixoDoAno, mais } from "./computo";
import { POSTO } from "./posto";
import type { FestaFixa } from "./santoral";

/**
 * Próprio do Brasil no calendário de 1962.
 *
 * As Festas Próprias de todo o Brasil por concessão da Sagrada Congregação
 * dos Ritos de 12 de dezembro de 1962, na lista que o Perez mandou. Antes
 * delas o motor de 1962 calculava o calendário universal e mais a Titular da
 * capela, e só: Aparecida e Santa Rosa de Lima, que são de I classe no
 * Brasil, saíam como III classe ou não saíam, num site brasileiro.
 *
 * Sobrepõem-se por data, como o próprio da capela, e não se somam: o Brasil
 * substitui o universal do dia. É o que a concessão faz, e cai certo nas sete
 * datas em que havia festa universal — em todas elas o santo que sai é
 * exatamente o que a lista do Perez manda comemorar.
 *
 * A cor não está na lista, e é inferida pela regra de sempre: vermelho para
 * mártires e para a Cruz, branco para o resto. O mesmo vale para o Credo, que
 * segue a categoria da festa.
 */
export const PROPRIO_BRASIL: FestaFixa[] = [
  {
    mes: 2,
    dia: 4,
    nome: "São João de Brito, Mártir",
    classe: 3,
    cor: "vermelho",
    comemoracoes: ["Santo André Corsino, Bispo e Confessor"],
  },
  /* Suprimida do calendário universal em 1960, e mantida aqui pela concessão. */
  {
    mes: 5,
    dia: 3,
    nome: "Invenção da Santa Cruz",
    classe: 2,
    cor: "vermelho",
    credo: true,
    comemoracoes: ["Santos Mártires"],
  },
  {
    mes: 6,
    dia: 13,
    nome: "Santo Antônio de Pádua, Confessor e Doutor da Igreja",
    classe: 2,
    cor: "branco",
    credo: true,
  },
  { mes: 7, dia: 9, nome: "Nossa Senhora Rainha da Paz", classe: 3, cor: "branco", credo: true },
  {
    mes: 7,
    dia: 15,
    nome: "Beato Inácio de Azevedo e Companheiros, Mártires",
    classe: 3,
    cor: "vermelho",
    comemoracoes: ["Santo Henrique, Imperador e Confessor"],
  },
  {
    mes: 7,
    dia: 16,
    nome: "Comemoração da Santíssima Virgem Maria do Monte Carmelo",
    classe: 3,
    cor: "branco",
    credo: true,
  },
  {
    mes: 8,
    dia: 30,
    nome: "Santa Rosa de Lima, Virgem, Padroeira Principal da América Latina",
    classe: 1,
    cor: "branco",
  },
  {
    mes: 10,
    dia: 1,
    nome: "Santíssima Virgem Maria Medianeira de todas as Graças",
    classe: 3,
    cor: "branco",
    credo: true,
    comemoracoes: ["São Remígio, Bispo e Confessor"],
  },
  {
    mes: 10,
    dia: 12,
    nome: "Imaculada Conceição de Maria sob o título de Aparecida, Padroeira Principal do Brasil",
    classe: 1,
    cor: "branco",
    credo: true,
  },
  /*
   * A dedicação da igreja própria, nas igrejas consagradas da diocese, fora
   * as catedrais. Está aqui porque o Perez a marca também no Ordo pré-55, no
   * 1.º de junho que é a data de lá: a capela a celebra.
   */
  {
    mes: 10,
    dia: 22,
    nome: "Dedicação da igreja própria",
    classe: 1,
    cor: "branco",
    credo: true,
  },
  {
    mes: 11,
    dia: 5,
    nome: "Sagradas Relíquias que se conservam nas igrejas",
    classe: 3,
    cor: "vermelho",
  },
  {
    mes: 11,
    dia: 17,
    nome: "Beatos Roque Gonçalves e seus Companheiros, Mártires",
    classe: 3,
    cor: "vermelho",
    comemoracoes: ["São Gregório Taumaturgo, Bispo e Confessor"],
  },
  {
    mes: 12,
    dia: 12,
    nome: "Santíssima Virgem Maria de Guadalupe, Padroeira Principal da América Latina",
    classe: 1,
    cor: "branco",
    credo: true,
  },
];

/**
 * O Coração Eucarístico de Jesus, que é a única destas festas que anda.
 *
 * Quinta-feira depois do Sagrado Coração, isto é, catorze dias depois de
 * Corpus Christi. Não cabe em `PROPRIO_BRASIL`, que é de data fixa, e por
 * isso mora na tabela dos dias móveis, em `proprios.ts`, junto com o Sagrado
 * Coração de que ela depende. É daqui que o nome sai, para os dois lugares o
 * escreverem igual.
 */
export const CORACAO_EUCARISTICO = {
  nome: "Coração Eucarístico de Jesus",
  cor: "branco",
  classe: 3,
  posto: POSTO.festaTerceira,
} as const;

/**
 * O Coração Eucarístico no ano pedido, já com data, para entrar na precedência
 * pela mesma porta das outras.
 *
 * Esteve na tabela dos dias móveis, com o Temporal, e dali ele sumia sem
 * deixar rastro nos doze anos em cinquenta em que outra coisa ocupa a
 * quinta-feira: a Vigília de São João Batista, o Preciosíssimo Sangue, a
 * Visitação. Como festa, ele perde igual às irmãs — e, perdendo para dia de
 * posto melhor, fica comemorado em vez de desaparecer.
 */
export function movelDoBrasil(ano: number): FestaFixa {
  const quinta = mais(eixoDoAno(ano).corpusChristi, 14);
  return {
    ...CORACAO_EUCARISTICO,
    mes: quinta.getUTCMonth() + 1,
    dia: quinta.getUTCDate(),
  };
}

/** Todos os nomes do próprio do Brasil, para a grade saber onde pôr o sinal. */
export const NOMES_DO_BRASIL: string[] = [
  ...PROPRIO_BRASIL.map((f) => f.nome),
  CORACAO_EUCARISTICO.nome,
];

/**
 * O Santoral com o próprio do Brasil sobreposto: uma entrada brasileira
 * substitui a universal do mesmo dia.
 *
 * Mesma forma de `comProprioLocal`, e aplicada antes dele: o universal cede
 * ao Brasil, e o Brasil cede à Titular da capela. Hoje as duas camadas não se
 * tocam — a Titular é 5 de agosto e nenhuma festa brasileira cai lá —, mas a
 * ordem é a que a hierarquia dos calendários manda.
 */
export function comProprioBrasil(santoral: FestaFixa[], ano?: number): FestaFixa[] {
  const doBrasil = new Set(PROPRIO_BRASIL.map((f) => `${f.mes}-${f.dia}`));
  /*
   * A móvel entra sem apagar ninguém, ao contrário das treze de data fixa.
   * Substituir pela data é o que a concessão faz em 4 de fevereiro ou em 13
   * de junho, onde ela nomeia a festa que sai; a quinta-feira do Coração
   * Eucarístico cai onde calha, e em 2028 calharia em São Pedro e São Paulo
   * — apagar o que estivesse ali seria o Brasil engolindo uma festa de I
   * classe do calendário universal por acidente de data.
   */
  /*
   * E entra na frente de todos, porque na precedência o empate fica com quem
   * foi lido primeiro. Sem isso o Coração Eucarístico perdia a quinta-feira
   * para o santo universal de III classe do dia — Santo Efrém, São Barnabé,
   * Santa Juliana —, em trinta dos cinquenta anos seguintes. Festa do Senhor
   * de III classe precede festa de III classe dos santos, e é esse o
   * desempate; o santo que perde fica comemorado, que é o que a regra manda.
   */
  return [
    ...(ano == null ? [] : [movelDoBrasil(ano)]),
    ...santoral.filter((f) => !doBrasil.has(`${f.mes}-${f.dia}`)),
    ...PROPRIO_BRASIL,
  ];
}
