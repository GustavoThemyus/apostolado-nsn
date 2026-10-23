import type { ComponentType } from "react";
import textos from "../data/paginas.json";
import type { TextoDaPagina } from "../data/tipos";
import type { Padrao } from "./padroes";

/**
 * Tabela de rotas do site.
 *
 * Divide-se em duas metades, e a divisão é o ponto: **a estrutura é código e
 * os textos são conteúdo.**
 *
 * Aqui ficam o caminho, de quem a página é filha, se ela aparece no menu e
 * qual componente a desenha. Nada disso o Apostolado edita, e nada disso faria
 * sentido editar: caminho novo exige página nova, que exige código.
 *
 * O que o leitor lê — título, rótulo curto, descrição, chamada e estampa —
 * mora em `src/data/paginas.json` e se edita pelo painel. Antes vivia aqui, e
 * por isso o Perez conseguia escrever o corpo de uma página mas não o
 * cabeçalho dela, nem os cartões que a seção mostra das filhas.
 *
 * `pagina` usa import dinâmico com caminho literal, que é o que permite ao
 * Vite emitir um pedaço por rota. O JSON de cada página viaja no pedaço dela,
 * então quem abre o início não baixa os 17 KB do guia.
 */

/** A metade que é código: caminho, hierarquia e componente. */
interface Estrutura {
  /** Tipado pela lista de `padroes.ts`: rota com caminho de fora não compila. */
  padrao: Padrao;
  /** Rota mãe, para as migalhas e para o menu. */
  pai?: Padrao;
  /** Fora do menu: páginas de detalhe e o painel. */
  foraDoMenu?: boolean;
  pagina: () => Promise<{ default: ComponentType }>;
}

/** A rota pronta: a estrutura com os textos do `paginas.json` em cima. */
export type Rota = Estrutura & TextoDaPagina;

const ESTRUTURA: Estrutura[] = [
  {
    padrao: "/",
    pagina: () => import("../pages/Inicio"),
  },

  // ---------------------------------------------------------------- Missa
  {
    padrao: "/missa",
    pagina: () => import("../pages/Missa"),
  },
  {
    padrao: "/missa/guia",
    pai: "/missa",
    pagina: () => import("../pages/GuiaDaMissa"),
  },
  {
    padrao: "/missa/partes",
    pai: "/missa",
    pagina: () => import("../pages/MissaPartes"),
  },
  {
    padrao: "/missa/situacao-canonica",
    pai: "/missa",
    pagina: () => import("../pages/MissaSituacaoCanonica"),
  },

  // ----------------------------------------------------------- Calendário
  {
    padrao: "/calendario",
    pagina: () => import("../pages/Calendario"),
  },
  {
    padrao: "/calendario/santos",
    pai: "/calendario",
    pagina: () => import("../pages/Santos"),
  },
  {
    padrao: "/calendario/brasil",
    pai: "/calendario",
    pagina: () => import("../pages/CalendarioBrasil"),
  },
  {
    padrao: "/calendario/arquidiocese",
    pai: "/calendario",
    pagina: () => import("../pages/CalendarioArquidiocese"),
  },

  // ---------------------------------------------------------- Indulgências
  {
    padrao: "/indulgencias",
    pagina: () => import("../pages/Indulgencias"),
  },
  {
    padrao: "/indulgencias/calendario",
    pai: "/indulgencias",
    pagina: () => import("../pages/IndulgenciasCalendario"),
  },
  {
    padrao: "/indulgencias/arquidiocese",
    pai: "/indulgencias",
    pagina: () => import("../pages/IndulgenciasArquidiocese"),
  },
  {
    padrao: "/indulgencias/raccolta",
    pai: "/indulgencias",
    pagina: () => import("../pages/IndulgenciasRaccolta"),
  },
  {
    padrao: "/indulgencias/enchiridion",
    pai: "/indulgencias",
    pagina: () => import("../pages/IndulgenciasEnchiridion"),
  },
  {
    padrao: "/indulgencias/ordens",
    pai: "/indulgencias",
    pagina: () => import("../pages/IndulgenciasOrdens"),
  },

  // ------------------------------------------------------------ Apostolado
  {
    padrao: "/apostolado",
    pagina: () => import("../pages/Apostolado"),
  },
  {
    padrao: "/apostolado/brasao",
    pai: "/apostolado",
    pagina: () => import("../pages/ApostoladoBrasao"),
  },

  // -------------------------------------------------------------- Folhetos
  {
    padrao: "/folhetos",
    pagina: () => import("../pages/Folhetos"),
  },
  {
    padrao: "/folhetos/:id",
    pai: "/folhetos",
    foraDoMenu: true,
    pagina: () => import("../pages/Folheto"),
  },

  // ------------------------------------------------------------- Postagens
  {
    padrao: "/postagens",
    pagina: () => import("../pages/Postagens"),
  },
  {
    padrao: "/postagens/:id",
    pai: "/postagens",
    foraDoMenu: true,
    pagina: () => import("../pages/Postagem"),
  },

  // ---------------------------------------------------------------- painel
  {
    padrao: "/admin",
    foraDoMenu: true,
    pagina: () => import("../admin/Admin").then((m) => ({ default: m.Admin })),
  },
  {
    padrao: "/admin/:documento",
    pai: "/admin",
    foraDoMenu: true,
    pagina: () => import("../admin/Admin").then((m) => ({ default: m.Admin })),
  },
];

/*
 * Os textos entram aqui, e não em cada componente que os lê.
 *
 * Página sem texto no JSON ficaria sem título, e um título vazio some do
 * menu, das migalhas e da aba do navegador sem erro nenhum — a página
 * continua abrindo, só que anônima. Por isso o título cai no caminho quando
 * falta: é feio, e ser feio é o aviso. `paginas.teste.ts` confere que não
 * falta nenhum, para que ninguém dependa desse último recurso.
 */
const TEXTOS = textos as Record<string, TextoDaPagina>;

export const ROTAS: Rota[] = ESTRUTURA.map((estrutura) => {
  const texto = TEXTOS[estrutura.padrao];
  return { ...estrutura, ...texto, titulo: texto?.titulo || estrutura.padrao };
});

/** As seções de topo, na ordem em que aparecem no menu. */
export const SECOES_DO_MENU = [
  "/",
  "/missa",
  "/calendario",
  "/indulgencias",
  "/folhetos",
  "/apostolado",
  "/postagens",
] as const;

export const rotaPorPadrao = (padrao: string): Rota | undefined =>
  ROTAS.find((r) => r.padrao === padrao);

/** As subrotas de uma seção, para o menu, os cartões e as migalhas. */
export const filhasDe = (padrao: string): Rota[] =>
  ROTAS.filter((r) => r.pai === padrao && !r.foraDoMenu);

/** Documentos ainda por escrever: ganham etiqueta em vez de sumirem. */
/**
 * O estado de cada página que ainda não está pronta.
 *
 *   "preparacao"  não há texto nenhum
 *   "rascunho"    há texto, porém provisório
 *
 * É uma lista à mão porque a tabela de rotas não pode importar os JSON: cada
 * um viaja no pedaço da sua rota, e importá-los aqui traria todos para o
 * pacote inicial. Lista à mão apodrece, e esta já tinha apodrecido, dizendo
 * "em preparação" de um documento de catorze seções publicadas. Quem a
 * mantém honesta agora é `src/data/conteudo.teste.ts`, que a confere contra
 * o que cada JSON diz de si.
 */
export type EstadoDaRota = "preparacao" | "rascunho";

export const ESTADO_DA_ROTA: Record<string, EstadoDaRota> = {
  "/missa/situacao-canonica": "preparacao",
  "/indulgencias/raccolta": "rascunho",
  "/indulgencias/ordens": "rascunho",
  "/apostolado": "preparacao",
};

export const NOME_DO_ESTADO: Record<EstadoDaRota, string> = {
  preparacao: "Em preparação",
  rascunho: "Rascunho",
};
/**
 * A chamada da página, subindo pela rota mãe até achar uma.
 *
 * `undefined` significa "use a do site": quem decide o texto padrão é o
 * Cabecalho, não a tabela.
 */
function herdado(
  rota: Rota | null,
  campo: "chamada" | "imagem",
): string | undefined {
  let atual: Rota | undefined = rota ?? undefined;
  while (atual) {
    const valor = atual[campo];
    if (valor) return valor;
    atual = atual.pai ? rotaPorPadrao(atual.pai) : undefined;
  }
  return undefined;
}

export const chamadaDaRota = (rota: Rota | null) => herdado(rota, "chamada");

/** A estampa da seção a que a rota pertence. */
export const imagemDaRota = (rota: Rota | null) => herdado(rota, "imagem");
