import { ARQUIVOS, SECOES, type SecaoDoOrdinario } from "./ordinario/indice";
import type { Bloco, Folheto } from "./tipos";

export { SECOES };
export type { SecaoDoOrdinario };

export interface TextoDaSecao {
  id: string;
  titulo: string;
  blocos: Bloco[];
}

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

export interface PecaDoProprio {
  titulo: string;
  blocos: Bloco[];
}

const semAReferencia = (texto: string): string =>
  texto.replace(/\s*\(.*$/, "").trim().toLowerCase();

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

export function carregarSecoes(ids: string[]): Promise<(TextoDaSecao | null)[]> {
  return Promise.all(ids.map((id) => carregarSecao(id)));
}

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

export function aberturaDoEvangelho(folheto: Folheto): AberturaDoEvangelho | undefined {
  const par = primeiroBilingue(pecasDoProprio(folheto, ["Evangelho"])[0]?.blocos ?? []);
  const latim = par?.latim[0]?.tipo === "paragrafo" ? FORMULA.exec(par.latim[0].texto) : null;
  const pt = par?.portugues[0]?.tipo === "paragrafo" ? FORMULA.exec(par.portugues[0].texto) : null;
  if (!latim || !pt) return undefined;
  return { latim: latim[1], portugues: pt[1].replace(/:$/, ".") };
}

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

const LAUS = /Laus\s+tibi,?\s+Christe/i;

export function semLausDoOrdinario(blocos: Bloco[], folheto: Folheto): Bloco[] {
  if (!LAUS.test(JSON.stringify(pecasDoProprio(folheto, ["Evangelho"])))) return blocos;
  const eLaus = (b: Bloco | undefined) =>
    b?.tipo === "bilingue" && b.latim.length === 1 &&
    b.latim[0].tipo === "paragrafo" && LAUS.test(b.latim[0].texto);
  return blocos.filter(
    (b, i) => !eLaus(b) && !(b.tipo === "rubrica" && eLaus(blocos[i + 1])),
  );
}

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
