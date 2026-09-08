import { SANTORAL } from "./santoral";
import { PROPRIO_LOCAL } from "./proprioLocal";
import type { DiaLiturgico } from "./tipos";
import type { Postagem } from "../data/tipos";

/**
 * Qual postagem fala do que se celebra num dia.
 *
 * Casa em duas regras, nesta ordem: pelo nome da celebração, depois por mês e
 * dia. O ponto de projeto é **casar com a celebração, não com a casa do
 * calendário**: o motor já dá isso de graça, porque `nome` acompanha a festa
 * até a data para onde ela foi transferida.
 *
 * Quando 8 de dezembro cai em domingo do Advento e a Imaculada vai para o dia
 * 9, a postagem dela vai junto, sozinha. A regra por mês e dia é a saída para
 * quem está preso à data, e por isso ela confere `transferidaDe` antes de
 * `data`: a festa transferida guarda ali de onde veio.
 */

const limpar = (s: string) =>
  s.split(",")[0].trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const mesmoNome = (a: string, b: string) => limpar(a) === limpar(b);

export function postagemDoDia(
  postagens: Postagem[],
  dia: DiaLiturgico
): Postagem | undefined {
  const porNome = postagens.find((p) => {
    const f = p.festa;
    if (!f || !("nome" in f)) return false;
    return mesmoNome(dia.nome, f.nome) || dia.comemoracoes.some((c) => mesmoNome(c, f.nome));
  });
  if (porNome) return porNome;

  // a data de origem, quando houve transferência; senão a do próprio dia
  const origem = dia.transferidaDe
    ? new Date(`${dia.transferidaDe}T12:00:00Z`)
    : dia.data;
  const mes = origem.getUTCMonth() + 1;
  const numero = origem.getUTCDate();

  return postagens.find((p) => {
    const f = p.festa;
    return !!f && "mes" in f && f.mes === mes && f.dia === numero;
  });
}

/**
 * Em que dia a festa cai normalmente, para ordenar uma lista de postagens.
 *
 * É só para ordenar: no calendário quem manda é a precedência, e uma festa
 * transferida aparece no dia para onde foi, não neste.
 */
export function diaHabitualDaFesta(
  festa: { nome: string } | { mes: number; dia: number } | undefined
): { mes: number; dia: number } | undefined {
  if (!festa) return undefined;
  if ("mes" in festa) return { mes: festa.mes, dia: festa.dia };
  const achada = [...PROPRIO_LOCAL, ...SANTORAL].find((f) => mesmoNome(f.nome, festa.nome));
  return achada ? { mes: achada.mes, dia: achada.dia } : undefined;
}
