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
