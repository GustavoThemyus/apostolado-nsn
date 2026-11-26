import type { ComponentType } from "react";
import textos from "../data/paginas.json";
import type { TextoDaPagina } from "../data/tipos";
import type { Padrao } from "./padroes";

interface Estrutura {
  padrao: Padrao;
  pai?: Padrao;
  foraDoMenu?: boolean;
  pagina: () => Promise<{ default: ComponentType }>;
}

export type Rota = Estrutura & TextoDaPagina;

const ESTRUTURA: Estrutura[] = [
  {
    padrao: "/",
    pagina: () => import("../pages/Inicio"),
  },

  {
    padrao: "/missa",
    pagina: () => import("../pages/Missa"),
  },
  {
    padrao: "/missa/ordinario",
    pai: "/missa",
    pagina: () => import("../pages/Ordinario"),
  },
  {
    padrao: "/missa/dia",
    pai: "/missa",
    pagina: () => import("../pages/MissaDoDia"),
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
    padrao: "/indulgencias/enchiridion",
    pai: "/indulgencias",
    pagina: () => import("../pages/IndulgenciasEnchiridion"),
  },
  {
    padrao: "/indulgencias/ordens",
    pai: "/indulgencias",
    pagina: () => import("../pages/IndulgenciasOrdens"),
  },

  {
    padrao: "/apostolado",
    pagina: () => import("../pages/Apostolado"),
  },
  {
    padrao: "/apostolado/brasao",
    pai: "/apostolado",
    pagina: () => import("../pages/ApostoladoBrasao"),
  },

  {
    padrao: "/folhetos",
    pagina: () => import("../pages/Folhetos"),
  },
  {
    padrao: "/folhetos/proprios",
    pai: "/folhetos",
    pagina: () => import("../pages/FolhetosProprios"),
  },
  {
    padrao: "/folhetos/indulgencias",
    pai: "/folhetos",
    pagina: () => import("../pages/FolhetosIndulgencias"),
  },
  {
    padrao: "/folhetos/:id",
    pai: "/folhetos",
    foraDoMenu: true,
    pagina: () => import("../pages/Folheto"),
  },

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

const TEXTOS = textos as Record<string, TextoDaPagina>;

export const ROTAS: Rota[] = ESTRUTURA.map((estrutura) => {
  const texto = TEXTOS[estrutura.padrao];
  return { ...estrutura, ...texto, titulo: texto?.titulo || estrutura.padrao };
});

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

export const filhasDe = (padrao: string): Rota[] =>
  ROTAS.filter((r) => r.pai === padrao && !r.foraDoMenu);

export type EstadoDaRota = "preparacao" | "rascunho";

export const ESTADO_DA_ROTA: Record<string, EstadoDaRota> = {
  "/missa/partes": "preparacao",
  "/missa/situacao-canonica": "preparacao",
  "/calendario/brasil": "preparacao",
  "/calendario/arquidiocese": "preparacao",
  "/apostolado": "preparacao",
};

export const NOME_DO_ESTADO: Record<EstadoDaRota, string> = {
  preparacao: "Em preparação",
  rascunho: "Rascunho",
};
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

export const imagemDaRota = (rota: Rota | null) => herdado(rota, "imagem");
