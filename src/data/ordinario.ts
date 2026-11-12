import { ARQUIVOS, SECOES, type SecaoDoOrdinario } from "./ordinario/indice";
import type { Bloco, Folheto } from "./tipos";

export { SECOES };
export type { SecaoDoOrdinario };

/** Uma seção do Ordinário com o texto dentro, como o arquivo a grava. */
export interface TextoDaSecao {
  id: string;
  titulo: string;
  blocos: Bloco[];
}

/**
 * O texto de uma seção, baixado na primeira vez e guardado.
 *
 * O Ordinário inteiro são 12 871 palavras, e quem está na Missa precisa de
 * uma seção de cada vez. Por isso o índice carrega cada arquivo sob demanda,
 * e por isso o que se guarda aqui é o que já veio: voltar ao Confiteor
 * depois do Canon não baixa nada de novo.
 */
const guardadas = new Map<string, TextoDaSecao>();

export function secaoJaBaixada(id: string): TextoDaSecao | undefined {
  return guardadas.get(id);
}

export async function carregarSecao(id: string): Promise<TextoDaSecao | null> {
  const guardada = guardadas.get(id);
  if (guardada) return guardada;

  const arquivo = ARQUIVOS[id];
  if (!arquivo) return null;

  const { default: bruto } = await arquivo();
  const secao = bruto as TextoDaSecao;
  guardadas.set(id, secao);
  return secao;
}

/** Uma peça do próprio, tirada do folheto do dia. */
export interface PecaDoProprio {
  /** O subtítulo como o folheto o traz, com a referência: "Intróito (Sl XXIV,1-3)". */
  titulo: string;
  blocos: Bloco[];
}

/**
 * O nome da peça, sem a referência que o folheto põe entre parênteses.
 *
 * O folheto escreve "Intróito (Sl XXIV,1-3)" e "Prefácio (galicano)"; o
 * lugar do próprio, no Ordinário, pede só "Intróito" e "Prefácio". A
 * referência é do dia, o nome é da peça, e é pelo nome que os dois se acham.
 */
const semAReferencia = (texto: string): string =>
  texto.replace(/\s*\(.*$/, "").trim().toLowerCase();

/**
 * Como a peça se abre na folha, que é o que decide a capitular.
 *
 *   introito  capitular maior que as outras
 *   leitura   Epístola e Evangelho: a fórmula ("Lectio…") só com a inicial
 *             vermelha, e a capitular no texto que vem depois dela
 *   cantada   Gradual, Aleluia, Tracto, Ofertório e Comunhão: inicial
 *             vermelha, sem capitular
 *   oracao    todo o resto
 *
 * Decidido pelo nome do subtítulo, que o gerador já confere contra o PDF.
 */
export type TipoDaPeca = "introito" | "leitura" | "cantada" | "oracao";

const TIPOS_DA_PECA: Record<string, TipoDaPeca> = {
  "intróito": "introito",
  "epístola": "leitura",
  "evangelho": "leitura",
  "gradual": "cantada",
  "aleluia": "cantada",
  "tracto": "cantada",
  "ofertório": "cantada",
  "comunhão": "cantada",
};

export const tipoDaPeca = (titulo: string): TipoDaPeca =>
  TIPOS_DA_PECA[semAReferencia(titulo)] ?? "oracao";

/**
 * As peças de um folheto de próprio que preenchem um lugar do Ordinário.
 *
 * Uma peça vai do subtítulo que a abre até o subtítulo seguinte, e os
 * subtítulos menores ficam dentro dela: são as comemorações, que no missal
 * se rezam dentro da Oração, da Secreta e da Pós-comunhão, e não depois
 * delas.
 *
 * Quase sempre devolve uma peça só. São duas no lugar do Gradual, porque o
 * impresso junta ali o Gradual, o Aleluia e o Tracto, e o folheto os traz
 * separados — no I Domingo do Advento, Gradual e Aleluia.
 */
export function pecasDoProprio(folheto: Folheto, subtitulos: string[]): PecaDoProprio[] {
  const procurados = new Set(subtitulos.map(semAReferencia));
  const pecas: PecaDoProprio[] = [];
  let atual: PecaDoProprio | null = null;

  for (const bloco of folheto.blocos) {
    if (bloco.tipo === "subtitulo" && !bloco.menor) {
      atual = procurados.has(semAReferencia(bloco.texto))
        ? { titulo: bloco.texto, blocos: [] }
        : null;
      if (atual) pecas.push(atual);
      continue;
    }
    if (atual) atual.blocos.push(bloco);
  }

  return pecas.filter((p) => p.blocos.length > 0);
}

/**
 * Várias seções de uma vez, na ordem pedida.
 *
 * É o que a leitura contínua precisa: a página única baixa as seções em
 * paralelo, cada uma no seu pedaço, e as que já vieram não baixam de novo.
 * Devolve nulo no lugar de uma seção que não existe, e a tela a pula.
 */
export function carregarSecoes(ids: string[]): Promise<(TextoDaSecao | null)[]> {
  return Promise.all(ids.map((id) => carregarSecao(id)));
}

/*
 * O Evangelho do dia dentro do Ordinário.
 *
 * O impresso escreve "Sequéntia (Inítium) sancti Evangélii secúndum N." e
 * remete ao próprio, porque o evangelista e o "sequência" ou "início" mudam
 * todo domingo. O folheto de próprio já traz a fórmula certa na primeira
 * linha do Evangelho, e o texto propriamente dito vem depois dela, a partir
 * do "In illo témpore". Então a fórmula do dia entra no lugar do "N." do
 * Ordinário, e o Evangelho do próprio passa a abrir pelo "In illo témpore".
 */
const FORMULA = /^((?:Sequéntia|Sequência|Seqüência|Inítium|Início)[^.:]*[.:])(?:\s+([\s\S]*))?$/;
const FORMULA_NO_ORDINARIO_LATIM = /Sequéntia \(Inítium\) sancti Evangélii secúndum[\s\S]*$/;
const FORMULA_NO_ORDINARIO_PT = /Seqüência \(Início\) do Santo Evangelho segundo[\s\S]*$/;

export interface AberturaDoEvangelho {
  latim: string;
  portugues: string;
}

type Bilingue = Extract<Bloco, { tipo: "bilingue" }>;

const primeiroBilingue = (blocos: Bloco[]): Bilingue | undefined =>
  blocos.find((b): b is Bilingue => b.tipo === "bilingue");

/** A fórmula do Evangelho do dia, nas duas línguas, tirada do próprio. */
export function aberturaDoEvangelho(folheto: Folheto): AberturaDoEvangelho | undefined {
  const par = primeiroBilingue(pecasDoProprio(folheto, ["Evangelho"])[0]?.blocos ?? []);
  const latim = par?.latim[0]?.tipo === "paragrafo" ? FORMULA.exec(par.latim[0].texto) : null;
  const pt = par?.portugues[0]?.tipo === "paragrafo" ? FORMULA.exec(par.portugues[0].texto) : null;
  if (!latim || !pt) return undefined;
  // a tradução às vezes fecha a fórmula com dois-pontos, e na linha do Ordinário é ponto
  return { latim: latim[1], portugues: pt[1].replace(/:$/, ".") };
}

/**
 * O Evangelho do próprio sem a fórmula de abertura, que já foi para o
 * Ordinário. Aceita os dois jeitos de o folheto trazê-la: num parágrafo à
 * parte, ou no mesmo parágrafo do texto.
 */
export function semAberturaDoEvangelho(blocos: Bloco[]): Bloco[] {
  const par = primeiroBilingue(blocos);
  if (!par) return blocos;
  const lado = (ps: Bloco[]): Bloco[] | null => {
    const p = ps[0];
    const f = p?.tipo === "paragrafo" ? FORMULA.exec(p.texto) : null;
    if (!f) return null;
    return f[2] ? [{ ...p, texto: f[2] } as Bloco, ...ps.slice(1)] : ps.slice(1);
  };
  const latim = lado(par.latim);
  const portugues = lado(par.portugues);
  if (!latim || !portugues) return blocos;
  return blocos.map((b) => (b === par ? { ...par, latim, portugues } : b));
}

/**
 * Põe a fórmula do dia na linha "Sequéntia (Inítium) … N." do Ordinário.
 * Devolve também se achou a linha: sem achá-la, o Evangelho do próprio fica
 * com a sua fórmula, e ela não some de lugar nenhum.
 */
export function comEvangelhoDoDia(
  blocos: Bloco[],
  abertura: AberturaDoEvangelho,
): { blocos: Bloco[]; substituiu: boolean } {
  let substituiu = false;
  const novos = blocos.map((b) => {
    if (b.tipo !== "bilingue" || !b.latim.some((p) => p.tipo === "paragrafo" && FORMULA_NO_ORDINARIO_LATIM.test(p.texto))) {
      return b;
    }
    const troca = (ps: Bloco[], achar: RegExp, por: string): Bloco[] =>
      ps.map((p) => (p.tipo === "paragrafo" && achar.test(p.texto) ? { ...p, texto: p.texto.replace(achar, por) } : p));
    substituiu = true;
    return {
      ...b,
      latim: troca(b.latim, FORMULA_NO_ORDINARIO_LATIM, abertura.latim),
      portugues: troca(b.portugues, FORMULA_NO_ORDINARIO_PT, abertura.portugues),
    };
  });
  return { blocos: novos, substituiu };
}
