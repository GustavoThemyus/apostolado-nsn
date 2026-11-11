import type { NaMissaDoDia } from "../calendario/naMissaDoDia";
import { condicaoValeNoDia } from "../calendario/naMissaDoDia";
import type { Bloco, PosturaDoMomento } from "./tipos";

/** O que o fiel escolhe ver: as vozes que quer ler e se quer as rubricas. */
export interface OpcoesDeLeitura {
  /** "altas": só o que se diz em voz alta. "todas": também o silêncio do Canon e as orações submissas. */
  vozes: "altas" | "todas";
  /** Rubricas e explicações: tudo o que o impresso escreve em itálico entre as orações. */
  rubricas: boolean;
}

/** Um item pronto para a tela: um bloco, ou um grupo que se abre e se fecha. */
export type ItemNaTela =
  | { tipo: "bloco"; bloco: Bloco; postura?: PosturaDoMomento }
  | { tipo: "grupo"; id: string; itens: ItemNaTela[] };

export interface SecaoNaTela {
  id: string;
  itens: ItemNaTela[];
}

/**
 * Os blocos que são explicação, e não oração. Quem acrescentar uma
 * explicação nova ao Ordinário a escreve como `nota` ou `assembleia`, e o
 * botão de rubricas já a esconde: não há lista para lembrar de atualizar.
 */
const EXPLICACOES = ["rubrica", "assembleia", "nota"];

/** Um grupo que só existe em certos dias, e não só quando algum bloco dele vale. */
function grupoVale(grupo: string | undefined, dia: NaMissaDoDia): boolean {
  if (grupo === "aspersao") return dia.aspersao !== null;
  return true;
}

const chaveDaPostura = (p: PosturaDoMomento): string =>
  typeof p === "string" ? p : p.rezada === p.cantada ? p.rezada : `${p.rezada}|${p.cantada}`;

/**
 * O Ordinário como a tela o mostra neste dia e com estas opções.
 *
 * Um texto só, filtrado: nada aqui copia oração. Tira o que o dia não tem
 * (Glória no Advento, Credo nos dias de semana, aspersão fora do domingo),
 * o que o fiel pediu para não ver (as orações em silêncio, as rubricas) e os
 * títulos que ficariam sem nada embaixo.
 *
 * A postura merece um parágrafo. Ela vem marcada no bloco em que MUDA, e a
 * tela a mostra no primeiro bloco visível depois da mudança: se o bloco que
 * a trazia foi escondido (o fiel só quer a voz alta, e o Canon está em
 * silêncio), a postura espera o próximo, e o fiel não perde a hora de se
 * ajoelhar. Só conta quem existe no dia: o joelho da aspersão não vale num
 * dia sem aspersão. E dentro de um grupo fechado não se grava o que foi
 * mostrado, porque o fiel pode não ter visto.
 */
export function montarSecoes(
  secoes: { id: string; blocos: Bloco[] }[],
  dia: NaMissaDoDia,
  opcoes: OpcoesDeLeitura,
): SecaoNaTela[] {
  let atual: PosturaDoMomento | undefined;
  let mostrada: string | undefined;

  return secoes.map(({ id, blocos }) => {
    const existentes: { bloco: Bloco; visivel: boolean; antes?: PosturaDoMomento }[] = [];
    for (const b of blocos) {
      const existe = condicaoValeNoDia(b.quando, dia) && grupoVale(b.grupo, dia);
      if (!existe) continue;
      if (b.postura) atual = b.postura;
      const visivel =
        (opcoes.vozes === "todas" || b.voz !== "baixa") &&
        (opcoes.rubricas || !EXPLICACOES.includes(b.tipo));
      existentes.push({ bloco: b, visivel, antes: atual });
    }

    // título sem nada embaixo: sai. Um título seguido de outro também não fica:
    // o que fica é o que tem corpo.
    const visiveis = existentes.filter((e) => e.visivel);
    const comCorpo = visiveis.filter(
      (e, i) =>
        e.bloco.tipo !== "subtitulo" ||
        (i + 1 < visiveis.length && visiveis[i + 1].bloco.tipo !== "subtitulo"),
    );

    const itens: ItemNaTela[] = [];
    let grupo: { id: string; itens: ItemNaTela[]; local?: string } | null = null;

    for (const { bloco, antes } of comCorpo) {
      const g = bloco.grupo;
      if (grupo && grupo.id !== g) {
        itens.push({ tipo: "grupo", id: grupo.id, itens: grupo.itens });
        grupo = null;
      }
      if (g && !grupo) grupo = { id: g, itens: [], local: mostrada };

      let postura: PosturaDoMomento | undefined;
      if (antes) {
        const vista = grupo ? grupo.local : mostrada;
        if (chaveDaPostura(antes) !== vista) {
          postura = antes;
          if (grupo) grupo.local = chaveDaPostura(antes);
          else mostrada = chaveDaPostura(antes);
        }
      }
      (grupo ? grupo.itens : itens).push({ tipo: "bloco", bloco, postura });
    }
    if (grupo) itens.push({ tipo: "grupo", id: grupo.id, itens: grupo.itens });

    return { id, itens };
  });
}
