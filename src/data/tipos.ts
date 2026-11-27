export type Etiqueta = "ordinario" | "proprio" | "variavel" | "comum";

export const NOME_DA_ETIQUETA: Record<Etiqueta, string> = {
  ordinario: "Ordinário",
  proprio: "Próprio",
  variavel: "Variável",
  comum: "Comum",
};

export interface Verso {
  latim?: string;
  portugues?: string;
}

export interface ItemDeLegenda {
  chave: string;
  etiqueta: Etiqueta;
  texto: string;
}

export interface ComId {
  id?: string;
}

export type Postura = "pe" | "sentado" | "joelhos";

export type PosturaDoMomento = Postura | { rezada: Postura; cantada: Postura };

export interface Marcas {
  voz?: "alta" | "baixa";
  postura?: PosturaDoMomento;
  quando?:
    | "asperges" | "vidi-aquam" | "salmo-42" | "gloria" | "credo" | "incenso"
    | "ite" | "benedicamus" | "requiescant";
  grupo?: string;
}

export type Bloco = ComId &
  Marcas &
  (
  | { tipo: "paragrafo"; texto: string; ancora?: string; destaque?: boolean }
  | { tipo: "rubrica"; texto: string }
    | { tipo: "assembleia"; texto: string }
  | { tipo: "subtitulo"; texto: string; ancora?: string; menor?: boolean }
  | { tipo: "separador" }
  | { tipo: "bilingue"; latim: Bloco[]; portugues: Bloco[] }
  | { tipo: "proprio"; nome: string; subtitulos: string[] }
  | { tipo: "indice" }
  | { tipo: "lista"; ordenada?: boolean; itens: string[] }
  | { tipo: "oracao"; versos: Verso[] }
  | { tipo: "nota"; titulo: string; paragrafos: string[]; alerta?: boolean }
  | {
      tipo: "tabela";
      colunas: string[];
      linhas: string[][];
      ancoras?: string[];
      porColuna?: boolean;
    }
  | { tipo: "legenda"; itens: ItemDeLegenda[] }
    | {
        tipo: "passo";
        numero?: number;
        etiqueta: Etiqueta;
        titulo: string;
        tituloLatim?: string;
        corpo: Bloco[];
      });

export interface Secao {
  id: string;
  foraDoIndice?: boolean;
  numero?: number;
  titulo: string;
  resumo?: string;
  blocos: Bloco[];
}

export interface Conteudo {
  titulo: string;
  descricao?: string;
  chamada?: string;
  epigrafe?: string;
  emPreparacao?: boolean;
  rascunho?: boolean;
  notas?: Record<string, string>;
  secoes: Secao[];
}

export interface Postagem {
  id: string;
  titulo: string;
  resumo: string;
  data: string;
  categoria: "santo" | "liturgia" | "aviso";
  festa?: { nome: string | string[] } | { mes: number; dia: number };
  imagem?: string;
  largura?: number;
  altura?: number;
  notas?: Record<string, string>;
  publicado?: boolean;
  rascunho?: boolean;
  blocos: Bloco[];
}

export interface Folheto {
  id: string;
  chapeu?: string;
  titulo: string;
  resumo: string;
  categoria: CategoriaDeFolheto;
  imagem?: string;
  largura?: number;
  altura?: number;
  cabecalho?: { data?: string; nome: string; grau: string; estacao?: string };
  obra?: string;
  concessao?: string;
  condicoes?: boolean;
  arquivo?: string;
  publicado?: boolean;
  rascunho?: boolean;
  blocos: Bloco[];
}

export type CategoriaDeFolheto = "indulgencia" | "proprio" | "canto" | "oficio";

export const NOME_DA_CATEGORIA: Record<CategoriaDeFolheto, string> = {
  indulgencia: "Obras indulgenciadas",
  proprio: "Próprios da Missa",
  canto: "Cantos e procissões",
  oficio: "Ofícios e vésperas",
};

export interface ColecaoDeFolhetos {
  titulo: string;
  descricao?: string;
  condicoes: { titulo: string; blocos: Bloco[] };
  folhetos: Folheto[];
}

export interface ColecaoDePostagens {
  titulo: string;
  descricao?: string;
  postagens: Postagem[];
}

export interface TextoDaPagina {
  titulo: string;
  curto?: string;
  descricao?: string;
  chamada?: string;
  imagem?: string;
  foco?: string;
}

export interface Site {
  email?: string;
  chamada: string;
  marca: string;
  marcaCurta: string;
  lema: string;
  rodape: string[];
  credito?: string;
  agendas: Agenda[];
  lateral?: Retrato[];
}

export interface Retrato {
  id: string;
  titulo: string;
  nome: string;
  imagem: string;
}

export interface ItemDeAgenda {
  data: string;
  titulo: string;
  festa?: string;
  descricao?: string;
  cor?: CorDaAgenda;
}

export type CorDaAgenda =
  | "branco"
  | "vermelho"
  | "verde"
  | "roxo"
  | "preto"
  | "rosa"
  | "ouro";

export interface Agenda {
  id: string;
  nome: string;
  descricao?: string;
  grupo: "ordo" | "indulgencias" | "indulgencias-apostolado";
  google: string;
}
