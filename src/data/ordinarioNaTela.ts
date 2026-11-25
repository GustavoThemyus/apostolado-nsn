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

/**
 * O Ordinário como a tela o mostra neste dia e com estas opções.
 *
 * Um texto só, filtrado: nada aqui copia oração. Tira o que o dia não tem
 * (Glória no Advento, Credo nos dias de semana, aspersão fora do domingo) e
 * os títulos que ficariam sem nada embaixo.
 *
 * A postura merece um parágrafo. Ela vem marcada no bloco em que MUDA, e
 * daqui sai em cada bloco a que vale nele, para a tela poder cercar o trecho
 * inteiro. Só conta quem existe no dia: o joelho da aspersão não vale num dia
 * sem aspersão.
 */
export function montarSecoes(
  secoes: { id: string; blocos: Bloco[] }[],
  dia: NaMissaDoDia,
  /** Sem opções, aparece tudo: é o caso do Ordinário. */
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

    // título sem nada embaixo: sai. Um título seguido de outro também não fica:
    // o que fica é o que tem corpo.
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
