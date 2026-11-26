import { eixoDoAno, mais } from "./computo";
import { POSTO } from "./posto";
import type { FestaFixa } from "./santoral";

export const PROPRIO_BRASIL: FestaFixa[] = [
  {
    mes: 2,
    dia: 4,
    nome: "São João de Brito, Mártir",
    classe: 3,
    cor: "vermelho",
    comemoracoes: ["Santo André Corsino, Bispo e Confessor"],
  },
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

export const CORACAO_EUCARISTICO = {
  nome: "Coração Eucarístico de Jesus",
  cor: "branco",
  classe: 3,
  posto: POSTO.festaTerceira,
} as const;

export function movelDoBrasil(ano: number): FestaFixa {
  const quinta = mais(eixoDoAno(ano).corpusChristi, 14);
  return {
    ...CORACAO_EUCARISTICO,
    mes: quinta.getUTCMonth() + 1,
    dia: quinta.getUTCDate(),
  };
}

export const NOMES_DO_BRASIL: string[] = [
  ...PROPRIO_BRASIL.map((f) => f.nome),
  CORACAO_EUCARISTICO.nome,
];

export function comProprioBrasil(santoral: FestaFixa[], ano?: number): FestaFixa[] {
  const doBrasil = new Set(PROPRIO_BRASIL.map((f) => `${f.mes}-${f.dia}`));
  return [
    ...(ano == null ? [] : [movelDoBrasil(ano)]),
    ...santoral.filter((f) => !doBrasil.has(`${f.mes}-${f.dia}`)),
    ...PROPRIO_BRASIL,
  ];
}
