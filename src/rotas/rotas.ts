import type { ComponentType } from "react";

/**
 * Tabela de rotas do site.
 *
 * `pagina` usa import dinâmico com caminho literal, que é o que permite ao
 * Vite emitir um pedaço por rota. O JSON de cada página viaja no pedaço dela,
 * então quem abre o início não baixa os 17 KB do guia.
 */

export interface Rota {
  padrao: string;
  /** Vai para o <title> e para as migalhas. */
  titulo: string;
  /** Rótulo curto para a barra, onde o título inteiro não cabe. */
  curto?: string;
  descricao?: string;
  /** Rota mãe, para as migalhas e para o menu. */
  pai?: string;
  /** Fora do menu: páginas de detalhe e o painel. */
  foraDoMenu?: boolean;
  pagina: () => Promise<{ default: ComponentType }>;
}

export const ROTAS: Rota[] = [
  {
    padrao: "/",
    titulo: "Início",
    descricao:
      "Apostolado Nossa Senhora das Neves: avisos, calendário litúrgico e publicações.",
    pagina: () => import("../paginas/Inicio"),
  },

  // ---------------------------------------------------------------- Missa
  {
    padrao: "/missa",
    titulo: "A Missa Tridentina",
    curto: "Missa",
    descricao: "O rito romano na forma do Missal de São Pio V.",
    pagina: () => import("../paginas/Missa"),
  },
  {
    padrao: "/missa/guia",
    titulo: "Guia prático da Missa",
    descricao:
      "Cada peça da Missa em ordem: o que é dito, quem diz e o que muda conforme o dia.",
    pai: "/missa",
    pagina: () => import("../paginas/GuiaDaMissa"),
  },
  {
    padrao: "/missa/partes",
    titulo: "Da Missa e suas partes",
    pai: "/missa",
    pagina: () => import("../paginas/MissaPartes"),
  },
  {
    padrao: "/missa/situacao-canonica",
    titulo: "A situação canônica da Missa",
    pai: "/missa",
    pagina: () => import("../paginas/MissaSituacaoCanonica"),
  },

  // ----------------------------------------------------------- Calendário
  {
    padrao: "/calendario",
    titulo: "Calendário Romano Tradicional",
    curto: "Calendário",
    descricao: "O calendário de 1962, calculado para qualquer ano.",
    pagina: () => import("../paginas/Calendario"),
  },
  {
    padrao: "/calendario/santos",
    titulo: "As festas do calendário",
    pai: "/calendario",
    pagina: () => import("../paginas/Santos"),
  },
  {
    padrao: "/calendario/brasil",
    titulo: "O próprio do Brasil",
    pai: "/calendario",
    pagina: () => import("../paginas/CalendarioBrasil"),
  },
  {
    padrao: "/calendario/arquidiocese",
    titulo: "O próprio arquidiocesano",
    pai: "/calendario",
    pagina: () => import("../paginas/CalendarioArquidiocese"),
  },

  // ---------------------------------------------------------- Indulgências
  {
    padrao: "/indulgencias",
    titulo: "Indulgências",
    curto: "Indulgências",
    descricao: "O que são, como se obtêm e de onde vêm, segundo o Código de 1917.",
    pagina: () => import("../paginas/Indulgencias"),
  },
  {
    padrao: "/indulgencias/calendario",
    titulo: "Dias de indulgência plenária",
    pai: "/indulgencias",
    pagina: () => import("../paginas/IndulgenciasCalendario"),
  },
  {
    padrao: "/indulgencias/raccolta",
    titulo: "Raccolta",
    pai: "/indulgencias",
    pagina: () => import("../paginas/IndulgenciasRaccolta"),
  },
  {
    padrao: "/indulgencias/enchiridion",
    titulo: "Enchiridion Indulgentiarum",
    pai: "/indulgencias",
    pagina: () => import("../paginas/IndulgenciasEnchiridion"),
  },
  {
    padrao: "/indulgencias/ordens",
    titulo: "Indulgências próprias",
    pai: "/indulgencias",
    pagina: () => import("../paginas/IndulgenciasOrdens"),
  },

  // ------------------------------------------------------------ Apostolado
  {
    padrao: "/apostolado",
    titulo: "Sobre o Apostolado",
    curto: "Apostolado",
    descricao: "Nossa posição, situação canônica, história e o brasão.",
    pagina: () => import("../paginas/Apostolado"),
  },

  // ------------------------------------------------------------- Postagens
  {
    padrao: "/postagens",
    titulo: "Postagens",
    curto: "Postagens",
    descricao: "Vidas de santos e escritos sobre a liturgia.",
    pagina: () => import("../paginas/Postagens"),
  },
  {
    padrao: "/postagens/:id",
    titulo: "Postagem",
    pai: "/postagens",
    foraDoMenu: true,
    pagina: () => import("../paginas/Postagem"),
  },

  // ---------------------------------------------------------------- painel
  {
    padrao: "/admin",
    titulo: "Administração",
    foraDoMenu: true,
    pagina: () => import("../admin/Admin").then((m) => ({ default: m.Admin })),
  },
  {
    padrao: "/admin/:documento",
    titulo: "Administração",
    pai: "/admin",
    foraDoMenu: true,
    pagina: () => import("../admin/Admin").then((m) => ({ default: m.Admin })),
  },
];

/** As seções de topo, na ordem em que aparecem no menu. */
export const SECOES_DO_MENU = [
  "/",
  "/missa",
  "/calendario",
  "/indulgencias",
  "/apostolado",
  "/postagens",
] as const;

export const rotaPorPadrao = (padrao: string): Rota | undefined =>
  ROTAS.find((r) => r.padrao === padrao);

/** As subrotas de uma seção, para o menu e as migalhas. */
export const filhasDe = (padrao: string): Rota[] =>
  ROTAS.filter((r) => r.pai === padrao && !r.foraDoMenu);
