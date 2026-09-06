import { eixoDoAno } from "./computo";
import { diaProprio } from "./proprios";
import { festasDe } from "./santoral";
import { corDe, tempoDe } from "./tempo";
import type { Classe, DiaLiturgico, Tempo } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/** Tempos em que o domingo é de I classe e não cede a festa nenhuma. */
const DOMINGO_DE_PRIMEIRA: Tempo[] = ["advento", "quaresma", "paixao"];

/** Classe do dia do Temporal, quando ele não tem nome próprio. */
function classeDoTemporal(data: Date, tempo: Tempo): Classe {
  const domingo = data.getUTCDay() === 0;
  if (domingo) return DOMINGO_DE_PRIMEIRA.includes(tempo) ? 1 : 2;
  // ferias de Quaresma e da Paixão são de III classe; as demais, de IV
  if (tempo === "quaresma" || tempo === "paixao") return 3;
  if (tempo === "advento") return 3;
  return 4;
}

/** O Tríduo e os dias que não cedem a nada. */
function intocavel(data: Date): boolean {
  const e = eixoDoAno(data.getUTCFullYear());
  const alvos = [
    soData(new Date(e.pascoa.getTime() - 3 * 86400000)),
    soData(new Date(e.pascoa.getTime() - 2 * 86400000)),
    soData(new Date(e.pascoa.getTime() - 1 * 86400000)),
    soData(e.pascoa),
    soData(e.pentecostes),
    soData(e.ramos),
  ];
  return alvos.includes(soData(data));
}

/**
 * Resolve o que se celebra num dia, entre o Temporal e o Santoral.
 *
 * Aplica uma leitura simplificada do Código de Rubricas de 1960:
 *  - o Tríduo, a Páscoa, Pentecostes e Ramos não cedem a nada;
 *  - domingo de I classe (Advento, Quaresma, Paixão) vence qualquer festa;
 *  - festa de I classe vence os demais dias;
 *  - domingo de II classe vence festa de II classe, que fica em comemoração;
 *  - festa de classe melhor que a feria vence a feria;
 *  - o vencido de I ou II classe sobrevive como comemoração.
 *
 * Não trata transferência de festas impedidas nem oitavas privilegiadas.
 */
export function diaLiturgico(data: Date): DiaLiturgico {
  const { tempo, semana } = tempoDe(data);
  const proprio = diaProprio(data);
  const festas = festasDe(data.getUTCMonth() + 1, data.getUTCDate());

  const nomeTemporal = proprio?.nome ?? nomeSimples(data, tempo, semana);
  const classeTemporal: Classe = proprio?.classe ?? classeDoTemporal(data, tempo);

  const base: DiaLiturgico = {
    data,
    tempo,
    semana,
    nome: nomeTemporal,
    classe: classeTemporal,
    cor: proprio?.cor ?? corDe(data, tempo),
    comemoracoes: [],
    origem: "temporal",
  };

  if (festas.length === 0 || intocavel(data)) {
    if (festas.length > 0) base.comemoracoes = festas.map((f) => f.nome);
    return base;
  }

  // a melhor festa do dia disputa com o Temporal
  const festa = [...festas].sort((a, b) => a.classe - b.classe)[0];
  const outras = festas.filter((f) => f !== festa).map((f) => f.nome);
  const domingo = data.getUTCDay() === 0;
  const domingoDeI = domingo && DOMINGO_DE_PRIMEIRA.includes(tempo);

  const temporalVence =
    domingoDeI ||
    classeTemporal < festa.classe ||
    (domingo && classeTemporal === festa.classe);

  if (temporalVence) {
    base.comemoracoes = [festa.nome, ...outras];
    return base;
  }

  return {
    data,
    tempo,
    semana,
    nome: festa.nome,
    classe: festa.classe,
    cor: festa.cor,
    comemoracoes: [...outras, ...(classeTemporal <= 2 ? [nomeTemporal] : [])],
    origem: "santoral",
  };
}

/** Nome do dia do Temporal sem consultar dias próprios (evita recursão). */
function nomeSimples(data: Date, tempo: Tempo, semana?: number): string {
  const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
    "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII"];
  const SEM = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"];
  const n = semana ? ROMANOS[semana] ?? String(semana) : "";
  const domingo = data.getUTCDay() === 0;
  if (domingo) {
    switch (tempo) {
      case "advento": return `Domingo ${n} do Advento`;
      case "depoisDaEpifania": return `Domingo ${n} depois da Epifania`;
      case "quaresma": return `Domingo ${n} da Quaresma`;
      case "pascoa": return `Domingo ${ROMANOS[Math.max(1, (semana ?? 2) - 1)]} depois da Páscoa`;
      case "depoisDePentecostes": return `Domingo ${n} depois de Pentecostes`;
      default: return "Domingo";
    }
  }
  const feria = SEM[data.getUTCDay()];
  switch (tempo) {
    case "advento": return `${feria} da ${n} semana do Advento`;
    case "quaresma": return `${feria} da ${n} semana da Quaresma`;
    case "paixao": return `${feria} da Semana da Paixão`;
    case "depoisDePentecostes": return `${feria} da ${n} semana depois de Pentecostes`;
    case "natal": return `${feria} do Tempo do Natal`;
    default: return feria;
  }
}

/** Todos os dias de um mês, já resolvidos. */
export function mesLiturgico(ano: number, mes: number): DiaLiturgico[] {
  const dias: DiaLiturgico[] = [];
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  for (let d = 1; d <= ultimo; d++) {
    dias.push(diaLiturgico(new Date(Date.UTC(ano, mes - 1, d))));
  }
  return dias;
}
