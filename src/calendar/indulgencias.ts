import { PROPRIO_LOCAL } from "./proprioLocal";
import { mesLiturgico } from "./precedencia";
import type { DiaLiturgico, Tempo } from "./tipos";
import type { Bloco } from "../data/tipos";

export type Especie = "plenaria" | "parcial";

export type Quando =
  | { tipo: "fixa"; mes: number; dia: number }
  | { tipo: "festa"; nome: string }
  | { tipo: "titular" }
  | { tipo: "intervalo"; de: { mes: number; dia: number }; ate: { mes: number; dia: number } }
  | { tipo: "mensal"; diaDaSemana: number; ocorrencia: number }
  | { tipo: "diaDaSemanaNoTempo"; diaDaSemana: number; tempos: Tempo[] }
  | {
      tipo: "diaDaSemanaEntre";
      diaDaSemana: number;
      de: { mes: number; dia: number };
      ate: { mes: number; dia: number };
    };

export interface DiaDeIndulgencia {
  id: string;
  titulo: string;
  quando: Quando;
  quandoPorExtenso: string;
  especie: Especie;
  fonte?: string;
  obra: Bloco[];
}

export interface ComQuando {
  id: string;
  quando: Quando;
}

export interface Ocorrencia<T extends ComQuando = DiaDeIndulgencia> {
  data: string;
  entrada: T;
  transferidaDe?: string;
}

const chave = (data: Date): string => {
  const m = String(data.getUTCMonth() + 1).padStart(2, "0");
  const d = String(data.getUTCDate()).padStart(2, "0");
  return `${data.getUTCFullYear()}-${m}-${d}`;
};

const nomeDoTitular = (): string | undefined => PROPRIO_LOCAL[0]?.nome;

function mesmaFesta(nomeDoDia: string, procurado: string): boolean {
  const limpar = (s: string) =>
    s.split(",")[0].trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return limpar(nomeDoDia) === limpar(procurado);
}

function casaNoDia(entrada: ComQuando, dia: DiaLiturgico): boolean {
  const q = entrada.quando;
  const mes = dia.data.getUTCMonth() + 1;
  const numero = dia.data.getUTCDate();

  switch (q.tipo) {
    case "fixa":
      return q.mes === mes && q.dia === numero;

    case "festa":
      return (
        mesmaFesta(dia.nome, q.nome) ||
        dia.comemoracoes.some((c) => mesmaFesta(c, q.nome))
      );

    case "titular": {
      const titular = nomeDoTitular();
      return !!titular && mesmaFesta(dia.nome, titular);
    }

    case "intervalo": {
      const atual = mes * 100 + numero;
      const de = q.de.mes * 100 + q.de.dia;
      const ate = q.ate.mes * 100 + q.ate.dia;
      return de <= ate ? atual >= de && atual <= ate : atual >= de || atual <= ate;
    }

    case "mensal": {
      if (dia.data.getUTCDay() !== q.diaDaSemana) return false;
      return Math.floor((numero - 1) / 7) + 1 === q.ocorrencia;
    }

    case "diaDaSemanaNoTempo":
      return dia.data.getUTCDay() === q.diaDaSemana && q.tempos.includes(dia.tempo);

    case "diaDaSemanaEntre": {
      if (dia.data.getUTCDay() !== q.diaDaSemana) return false;
      const atual = mes * 100 + numero;
      return atual >= q.de.mes * 100 + q.de.dia && atual <= q.ate.mes * 100 + q.ate.dia;
    }
  }
}

export function indulgenciasDoMes<T extends ComQuando>(
  entradas: T[],
  ano: number,
  mes: number
): Map<string, Ocorrencia<T>[]> {
  const porDia = new Map<string, Ocorrencia<T>[]>();

  for (const dia of mesLiturgico(ano, mes)) {
    for (const entrada of entradas) {
      if (!casaNoDia(entrada, dia)) continue;
      const k = chave(dia.data);
      const lista = porDia.get(k) ?? [];
      lista.push({
        data: k,
        entrada,
        transferidaDe:
          entrada.quando.tipo === "festa" || entrada.quando.tipo === "titular"
            ? dia.transferidaDe
            : undefined,
      });
      porDia.set(k, lista);
    }
  }

  return porDia;
}

export const temPlenaria = (
  ocorrencias: Ocorrencia<DiaDeIndulgencia>[] | undefined,
): boolean =>
  !!ocorrencias?.some((o) => o.entrada.especie === "plenaria");
