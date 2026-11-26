import type { NaMissaDoDia } from "../calendario/naMissaDoDia";
import { condicaoValeNoDia } from "../calendario/naMissaDoDia";
import type { Bloco, PosturaDoMomento } from "./tipos";

export interface OpcoesDeLeitura {
  vozes: "altas" | "todas";
  rubricas: boolean;
}

export type ItemNaTela =
  | { tipo: "bloco"; bloco: Bloco; postura?: PosturaDoMomento }
  | { tipo: "grupo"; id: string; itens: ItemNaTela[] };

export interface SecaoNaTela {
  id: string;
  itens: ItemNaTela[];
}

const EXPLICACOES = ["rubrica", "assembleia", "nota"];

function grupoVale(grupo: string | undefined, dia: NaMissaDoDia): boolean {
  if (grupo === "aspersao") return dia.aspersao !== null;
  return true;
}

export function montarSecoes(
  secoes: { id: string; blocos: Bloco[] }[],
  dia: NaMissaDoDia,
  opcoes: OpcoesDeLeitura = { vozes: "todas", rubricas: true },
): SecaoNaTela[] {
  let atual: PosturaDoMomento | undefined;

  return secoes.map(({ id, blocos }) => {
    const visiveis: { bloco: Bloco; antes?: PosturaDoMomento }[] = [];
    for (const b of blocos) {
      const existe = condicaoValeNoDia(b.quando, dia) && grupoVale(b.grupo, dia);
      if (!existe) continue;
      if (b.postura) atual = b.postura;
      const visivel =
        (opcoes.vozes === "todas" || b.voz !== "baixa") &&
        (opcoes.rubricas || !EXPLICACOES.includes(b.tipo));
      if (visivel) visiveis.push({ bloco: b, antes: atual });
    }

    const comCorpo = visiveis.filter(
      (e, i) =>
        e.bloco.tipo !== "subtitulo" ||
        (i + 1 < visiveis.length && visiveis[i + 1].bloco.tipo !== "subtitulo"),
    );

    const itens: ItemNaTela[] = [];
    let grupo: { id: string; itens: ItemNaTela[] } | null = null;

    for (const { bloco, antes } of comCorpo) {
      const g = bloco.grupo;
      if (grupo && grupo.id !== g) {
        itens.push({ tipo: "grupo", id: grupo.id, itens: grupo.itens });
        grupo = null;
      }
      if (g && !grupo) grupo = { id: g, itens: [] };

      (grupo ? grupo.itens : itens).push({ tipo: "bloco", bloco, postura: antes });
    }
    if (grupo) itens.push({ tipo: "grupo", id: grupo.id, itens: grupo.itens });

    return { id, itens };
  });
}
