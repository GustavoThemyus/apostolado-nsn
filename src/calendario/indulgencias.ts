import { PROPRIO_LOCAL } from "./proprioLocal";
import { mesLiturgico } from "./precedencia";
import type { DiaLiturgico } from "./tipos";
import type { Bloco } from "../data/tipos";

/**
 * Em que dias do ano cai cada indulgência.
 *
 * Reusa `mesLiturgico`, e é por isso que existe: uma indulgência presa a uma
 * *festa* acompanha a transferência dela. Quando a festa titular é impedida e
 * anda de dia, a indulgência anda junto, porque é o mesmo motor que resolveu
 * a precedência. Uma segunda máquina de datas aqui divergiria da primeira na
 * primeira exceção.
 */

export type Especie = "plenaria" | "parcial";

/**
 * A distinção entre `fixa` e `festa` é o mecanismo do cânon 922, e é por isso
 * que são dois tipos e não um: Finados é 2 de novembro aconteça o que
 * acontecer, a festa titular anda com a transferência.
 */
export type Quando =
  | { tipo: "fixa"; mes: number; dia: number }
  | { tipo: "festa"; nome: string }
  | { tipo: "titular" }
  | { tipo: "intervalo"; de: { mes: number; dia: number }; ate: { mes: number; dia: number } }
  | { tipo: "mensal"; diaDaSemana: number; ocorrencia: number };

export interface DiaDeIndulgencia {
  id: string;
  titulo: string;
  quando: Quando;
  especie: Especie;
  /** Cânon ou decreto que a concede. */
  fonte?: string;
  /** A obra que se deve fazer. */
  obra: Bloco[];
}

export interface Ocorrencia {
  /** AAAA-MM-DD */
  data: string;
  entrada: DiaDeIndulgencia;
  /** Preenchido quando a festa chegou ao dia por transferência. */
  transferidaDe?: string;
}

const chave = (data: Date): string => {
  const m = String(data.getUTCMonth() + 1).padStart(2, "0");
  const d = String(data.getUTCDate()).padStart(2, "0");
  return `${data.getUTCFullYear()}-${m}-${d}`;
};

/** O nome da festa titular, tirado do próprio local: não se repete aqui. */
const nomeDoTitular = (): string | undefined => PROPRIO_LOCAL[0]?.nome;

/** Compara ignorando a qualificação depois da vírgula e as maiúsculas. */
function mesmaFesta(nomeDoDia: string, procurado: string): boolean {
  const limpar = (s: string) =>
    s.split(",")[0].trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return limpar(nomeDoDia) === limpar(procurado);
}

function casaNoDia(entrada: DiaDeIndulgencia, dia: DiaLiturgico): boolean {
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
      // um intervalo pode virar o ano, como 28 de dezembro a 3 de janeiro
      return de <= ate ? atual >= de && atual <= ate : atual >= de || atual <= ate;
    }

    case "mensal": {
      if (dia.data.getUTCDay() !== q.diaDaSemana) return false;
      // a enésima ocorrência daquele dia da semana no mês
      return Math.floor((numero - 1) / 7) + 1 === q.ocorrencia;
    }
  }
}

/** As indulgências de um mês, na ordem dos dias. */
export function indulgenciasDoMes(
  entradas: DiaDeIndulgencia[],
  ano: number,
  mes: number
): Map<string, Ocorrencia[]> {
  const porDia = new Map<string, Ocorrencia[]>();

  for (const dia of mesLiturgico(ano, mes)) {
    for (const entrada of entradas) {
      if (!casaNoDia(entrada, dia)) continue;
      const k = chave(dia.data);
      const lista = porDia.get(k) ?? [];
      lista.push({
        data: k,
        entrada,
        // só interessa avisar da transferência quando a regra segue a festa
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

/** Se há plenária no dia, o marcador da grade muda. */
export const temPlenaria = (ocorrencias: Ocorrencia[] | undefined): boolean =>
  !!ocorrencias?.some((o) => o.entrada.especie === "plenaria");
