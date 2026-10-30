import { PROPRIO_LOCAL } from "./proprioLocal";
import { mesLiturgico } from "./precedencia";
import type { DiaLiturgico, Tempo } from "./tipos";
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
  | { tipo: "mensal"; diaDaSemana: number; ocorrencia: number }
  /**
   * Um dia da semana dentro de um ou mais tempos litúrgicos: as sextas-feiras
   * da Quaresma, por exemplo.
   *
   * Leva lista de tempos, e não um só, porque o calendário de 1962 separa a
   * Quaresma do Tempo da Paixão, enquanto o Enchiridion, escrito depois da
   * reforma, chama de Quaresma o conjunto dos dois. Pedir só "quaresma" aqui
   * deixaria de fora justamente as últimas sextas-feiras, que são as que mais
   * importam.
   */
  | { tipo: "diaDaSemanaNoTempo"; diaDaSemana: number; tempos: Tempo[] }
  /**
   * Um dia da semana dentro de um intervalo de datas fixas: o domingo entre 7
   * e 13 de janeiro, por exemplo.
   *
   * Existe por causa da Sagrada Família, que é titular de duas paróquias da
   * Arquidiocese. A festa cai no domingo dentro da Oitava da Epifania, e isso
   * não é nenhum dos outros tipos: não é data fixa, não é o enésimo domingo
   * do mês — quando 7 de janeiro é domingo, ele é o *primeiro* de janeiro, e
   * não o segundo —, e `festa` não serve porque o motor de 1962 daqui ainda
   * não dá nome próprio a esse domingo.
   */
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
  /**
   * A mesma data em palavras: "2 de agosto", "Último domingo de outubro".
   *
   * Não se deriva de `quando`, e é por isso que está escrita. A coluna da
   * data é prosa: "22 de fevereiro" e "29 de junho" são `festa` no motor,
   * porque acompanham a transferência, mas quem lê quer ler o dia; e
   * "Variável, conforme a Páscoa" é a única resposta honesta para a
   * Quinta-feira Santa num quadro que não é de um ano só.
   */
  quandoPorExtenso: string;
  especie: Especie;
  /** Cânon ou decreto que a concede. */
  fonte?: string;
  /** A obra que se deve fazer. */
  obra: Bloco[];
}

/**
 * O mínimo para ter data: um id e a regra de quando cai.
 *
 * O motor não precisa saber o que a indulgência concede, e é o que permite
 * passar por aqui também as festas titulares das igrejas da Arquidiocese, que
 * não trazem obra nem espécie, sem inventar para elas campos vazios.
 */
export interface ComQuando {
  id: string;
  quando: Quando;
}

export interface Ocorrencia<T extends ComQuando = DiaDeIndulgencia> {
  /** AAAA-MM-DD */
  data: string;
  entrada: T;
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
      // um intervalo pode virar o ano, como 28 de dezembro a 3 de janeiro
      return de <= ate ? atual >= de && atual <= ate : atual >= de || atual <= ate;
    }

    case "mensal": {
      if (dia.data.getUTCDay() !== q.diaDaSemana) return false;
      // a enésima ocorrência daquele dia da semana no mês
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

/** As indulgências de um mês, na ordem dos dias. */
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
export const temPlenaria = (
  ocorrencias: Ocorrencia<DiaDeIndulgencia>[] | undefined,
): boolean =>
  !!ocorrencias?.some((o) => o.entrada.especie === "plenaria");
