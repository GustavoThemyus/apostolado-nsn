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
    | { tipo: "assembleia"; texto: string }
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "lista"; ordenada?: boolean; itens: string[] }
  | { tipo: "oracao"; versos: Verso[] }
  | { tipo: "nota"; titulo: string; paragrafos: string[]; alerta?: boolean }
  | { tipo: "tabela"; colunas: string[]; linhas: string[][] }
  | { tipo: "legenda"; itens: ItemDeLegenda[] }
    | {
        tipo: "passo";
        /** @deprecated Derivado da posição. Continua nos dados antigos, e é ignorado. */
        numero?: number;
        etiqueta: Etiqueta;
        titulo: string;
        tituloLatim?: string;
        corpo: Bloco[];
      });

export interface Secao {
  id: string;
  /** @deprecated Derivado da posição. Continua nos dados antigos, e é ignorado. */
  numero?: number;
  titulo: string;
  /** Linha em itálico logo abaixo do título. */
  resumo?: string;
  blocos: Bloco[];
}

/**
 * A forma comum das páginas de conteúdo. O guia e as indulgências já a
 * satisfaziam, então não houve migração de dados.
 */
export interface Conteudo {
  titulo: string;
  descricao?: string;
  /** @deprecated A chamada é do site inteiro e vive em site.json. */
  chamada?: string;
  /** Antífona em latim sob o título, onde há uma própria. */
  epigrafe?: string;
  /** Marca a página como ainda por escrever, para o aviso aparecer. */
  emPreparacao?: boolean;
  /** Texto provisório, a ser substituído pelo definitivo. */
  rascunho?: boolean;
  secoes: Secao[];
}

/**
 * Uma postagem: vida de santo ou escrito sobre a liturgia.
 *
 * `blocos` são os mesmos dez tipos do guia, então o corpo já sabe renderizar
 * rubrica, citação e latim sem nada novo.
 */
export interface Postagem {
  /** Vai na URL. Imutável depois de publicada, senão os links quebram. */
  id: string;
  titulo: string;
  resumo: string;
  /** ISO, AAAA-MM-DD. Ordena a faixa do início. */
  data: string;
  categoria: "santo" | "liturgia" | "aviso";
  /**
   * A que celebração a postagem se liga, para o calendário poder apontá-la.
   * Por nome, quando a postagem acompanha a festa aonde quer que ela vá; por
   * mês e dia, quando está presa à data.
   */
  festa?: { nome: string } | { mes: number; dia: number };
  /** Caminho em /public. Sem ela a faixa mostra o brasão. */
  imagem?: string;
  /** Falso esconde do site inteiro, para escrever com calma. */
  publicado?: boolean;
  /** Texto provisório: mostra o aviso de rascunho. */
  rascunho?: boolean;
  blocos: Bloco[];
}

export interface ColecaoDePostagens {
  titulo: string;
  descricao?: string;
  postagens: Postagem[];
}

/** O que é do site inteiro, e não de uma página. */
export interface Site {
  /** A linha em versalete dourado acima do título, igual em toda página. */
  chamada: string;
  marca: string;
  marcaCurta: string;
  lema: string;
  rodape: string[];
  agendas: Agenda[];
}

/** Um calendário do Google que o fiel pode vincular ao aparelho dele. */
export interface Agenda {
  id: string;
  nome: string;
  descricao?: string;
  /** Onde ela aparece no site. */
  grupo: "ordo" | "indulgencias";
  /** Identificador do calendário, que só funciona se ele for público. */
  google: string;
}

export interface Guia {
  chamada?: string;
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
