/**
 * Modelo de conteúdo do guia.
 *
 * O texto corrido usa uma marcação mínima, interpretada por <TextoRico>:
 *   [lat]...[/lat]  termo ou citação em latim
 *   [b]...[/b]      destaque forte
 *   [i]...[/i]      itálico comum (títulos de obras, ênfase)
 *   [r]...[/r]      rubrica embutida no meio de outro texto
 */

/** Classificação litúrgica de cada peça da Missa. */
export type Etiqueta = "ordinario" | "proprio" | "variavel" | "comum";

export const NOME_DA_ETIQUETA: Record<Etiqueta, string> = {
  ordinario: "Ordinário",
  proprio: "Próprio",
  variavel: "Variável",
  comum: "Comum",
};

/** Um versículo citado, com o latim e a tradução de trabalho. */
export interface Verso {
  latim?: string;
  portugues?: string;
}

export interface ItemDeLegenda {
  chave: string;
  etiqueta: Etiqueta;
  texto: string;
}

/** Identificador estável de um bloco, usado pelo painel de edição. */
export interface ComId {
  id?: string;
}

export type Bloco = ComId &
  (
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "rubrica"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "lista"; ordenada?: boolean; itens: string[] }
  | { tipo: "oracao"; versos: Verso[] }
  | { tipo: "nota"; titulo: string; paragrafos: string[]; alerta?: boolean }
  | { tipo: "tabela"; colunas: string[]; linhas: string[][] }
  | { tipo: "legenda"; itens: ItemDeLegenda[] }
    | {
        tipo: "passo";
        numero: number;
        etiqueta: Etiqueta;
        titulo: string;
        tituloLatim?: string;
        corpo: Bloco[];
      });

export interface Secao {
  id: string;
  numero: number;
  titulo: string;
  /** Linha em itálico logo abaixo do título. */
  resumo?: string;
  blocos: Bloco[];
}

export interface Guia {
  chamada: string;
  titulo: string;
  descricao: string;
  /** Antífona de abertura, em latim, sob o título. */
  epigrafe: string;
  /** Lema do brasão. */
  lema: string;
  secoes: Secao[];
  rodape: string[];
  /** Assinatura institucional, por extenso, no fim da página. */
  marca: string;
  /** Sigla, para a barra fixa, onde não cabe o nome inteiro. */
  marcaCurta: string;
}
