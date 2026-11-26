import { SANTORAL } from "./santoral";
import { PROPRIO_LOCAL } from "./proprioLocal";
import type { Postagem } from "../data/tipos";

export interface DiaParaVinculo {
  nome: string;
  data: Date;
  comemoracoes?: string[];
  transferidaDe?: string;
}

const normalizar = (s: string) =>
  s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const mesmoNome = (nomeDoDia: string, daFesta: string) =>
  normalizar(nomeDoDia).includes(normalizar(daFesta));

const nomesDa = (festa: { nome: string | string[] }): string[] =>
  Array.isArray(festa.nome) ? festa.nome : [festa.nome];

export function postagemDaFesta(
  postagens: Postagem[],
  dia: DiaParaVinculo
): Postagem | undefined {
  return postagens.find((p) => {
    const f = p.festa;
    if (!f || !("nome" in f)) return false;
    return nomesDa(f).some(
      (nome) =>
        mesmoNome(dia.nome, nome) ||
        (dia.comemoracoes ?? []).some((c) => mesmoNome(c, nome)),
    );
  });
}

export function postagemDoDia(
  postagens: Postagem[],
  dia: DiaParaVinculo
): Postagem | undefined {
  const porNome = postagemDaFesta(postagens, dia);
  if (porNome) return porNome;

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

export function diaHabitualDaFesta(
  festa: { nome: string | string[] } | { mes: number; dia: number } | undefined
): { mes: number; dia: number } | undefined {
  if (!festa) return undefined;
  if ("mes" in festa) return { mes: festa.mes, dia: festa.dia };
  const nomes = nomesDa(festa);
  const achada = [...PROPRIO_LOCAL, ...SANTORAL].find((f) =>
    nomes.some((nome) => mesmoNome(f.nome, nome)),
  );
  return achada ? { mes: achada.mes, dia: achada.dia } : undefined;
}
