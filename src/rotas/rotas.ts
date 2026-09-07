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
  /**
   * A linha em versalete acima do título. Sem valor próprio, herda da rota
   * mãe e, na falta dela, usa a do site. O rito só se anuncia onde a página
   * fala da Missa; no calendário e nas indulgências ele seria ruído.
   */
  chamada?: string;
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
    // o título logo abaixo já é o nome do apostolado; aqui vai só o rito
    chamada: "Rito Romano na forma do Missal de São Pio V",
    pagina: () => import("../paginas/Inicio"),
  },

  // ---------------------------------------------------------------- Missa
  {
    padrao: "/missa",
    titulo: "A Missa Tridentina",
    curto: "Missa",
    descricao: "O rito romano na forma do Missal de São Pio V.",
    // as quatro páginas da Missa herdam esta chamada
    chamada:
      "Apostolado Nossa Senhora das Neves - Rito Romano na forma do Missal de São Pio V",
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
    descricao: "Cada parte da Missa em detalhe: origem, sentido e rubricas.",
    pai: "/missa",
    pagina: () => import("../paginas/MissaPartes"),
  },
  {
    padrao: "/missa/situacao-canonica",
    titulo: "A situação canônica da Missa",
    descricao: "A parte jurídica do rito.",
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
    descricao: "As vidas dos santos que o calendário celebra.",
    pai: "/calendario",
    pagina: () => import("../paginas/Santos"),
  },
  {
    padrao: "/calendario/brasil",
    titulo: "O próprio do Brasil",
    descricao: "As festas próprias do calendário brasileiro.",
    pai: "/calendario",
    pagina: () => import("../paginas/CalendarioBrasil"),
  },
  {
    padrao: "/calendario/arquidiocese",
    titulo: "O próprio arquidiocesano",
    descricao: "O calendário próprio da Arquidiocese da Paraíba.",
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
    descricao: "Os dias que carregam indulgência no calendário.",
    pai: "/indulgencias",
    pagina: () => import("../paginas/IndulgenciasCalendario"),
  },
  {
    padrao: "/indulgencias/raccolta",
    titulo: "Raccolta",
    descricao: "A coleção de orações e obras indulgenciadas anterior a 1968.",
    pai: "/indulgencias",
    pagina: () => import("../paginas/IndulgenciasRaccolta"),
  },
  {
    padrao: "/indulgencias/enchiridion",
    titulo: "Enchiridion Indulgentiarum",
    descricao: "A coleção em vigor, de 1968 em diante.",
    pai: "/indulgencias",
    pagina: () => import("../paginas/IndulgenciasEnchiridion"),
  },
  {
    padrao: "/indulgencias/ordens",
    titulo: "Indulgências próprias",
    descricao: "As concedidas a ordens, confrarias e associações de fiéis.",
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

/** As subrotas de uma seção, para o menu, os cartões e as migalhas. */
export const filhasDe = (padrao: string): Rota[] =>
  ROTAS.filter((r) => r.pai === padrao && !r.foraDoMenu);

/** Documentos ainda por escrever: ganham etiqueta em vez de sumirem. */
export const EM_PREPARACAO = new Set([
  "/missa/partes",
  "/missa/situacao-canonica",
  "/calendario/brasil",
  "/calendario/arquidiocese",
  "/indulgencias/raccolta",
  "/indulgencias/enchiridion",
  "/indulgencias/ordens",
  "/apostolado",
]);

/**
 * A chamada da página, subindo pela rota mãe até achar uma.
 *
 * `undefined` significa "use a do site": quem decide o texto padrão é o
 * Cabecalho, não a tabela.
 */
export function chamadaDaRota(rota: Rota | null): string | undefined {
  let atual: Rota | undefined = rota ?? undefined;
  while (atual) {
    if (atual.chamada) return atual.chamada;
    atual = atual.pai ? rotaPorPadrao(atual.pai) : undefined;
  }
  return undefined;
}
