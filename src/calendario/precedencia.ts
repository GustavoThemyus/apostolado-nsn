import { eixoDoAno } from "./computo";
import { POSTO, livreParaTransferencia } from "./posto";
import { diaProprio } from "./proprios";
import { SANTORAL, type FestaFixa } from "./santoral";
import { corDe, tempoDe } from "./tempo";
import type { Classe, Cor, DiaLiturgico, Tempo } from "./tipos";

const DIA_MS = 86400000;
const chave = (d: Date) => d.toISOString().slice(0, 10);
const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

const DOMINGO_DE_PRIMEIRA: Tempo[] = ["advento", "quaresma", "paixao"];

/** Posto de uma festa fixa, deduzido da classe quando ela não traz o seu. */
function postoDaFesta(f: FestaFixa): number {
  if (f.posto != null) return f.posto;
  if (f.tipo === "vigilia") return f.classe === 1 ? POSTO.vigiliaPrimeira : POSTO.vigiliaSegunda;
  switch (f.classe) {
    case 1: return POSTO.festaPrimeira;
    case 2: return POSTO.festaSegunda;
    case 3: return POSTO.festaTerceira;
    default: return POSTO.feriaQuarta;
  }
}

/** Classe e posto do dia do Temporal quando ele não tem nome próprio. */
function temporalSimples(data: Date, tempo: Tempo): { classe: Classe; posto: number } {
  const domingo = data.getUTCDay() === 0;
  if (domingo) {
    return DOMINGO_DE_PRIMEIRA.includes(tempo)
      ? { classe: 1, posto: POSTO.domingoPrimeira }
      : { classe: 2, posto: POSTO.domingoSegunda };
  }
  // ferias da Semana Santa têm precedência sobre festa de I classe
  const e = eixoDoAno(data.getUTCFullYear());
  const naSemanaSanta = soData(data) > soData(e.ramos) && soData(data) < soData(e.pascoa);
  if (naSemanaSanta) return { classe: 1, posto: POSTO.feriaPrivilegiada };

  if (tempo === "quaresma" || tempo === "paixao" || tempo === "advento") {
    return { classe: 3, posto: POSTO.feriaTerceira };
  }
  return { classe: 4, posto: POSTO.feriaQuarta };
}

interface Ocupante {
  nome: string;
  classe: Classe;
  cor: Cor;
  posto: number;
  origem: "temporal" | "santoral";
  comemoracoes: string[];
  /** Data de origem, quando a festa chegou aqui por transferência. */
  transferidaDe?: string;
}

const cacheDeAnos = new Map<number, Map<string, Ocupante>>();

/**
 * Resolve o ano inteiro, aplicando ocorrência e transferência.
 *
 * Regra do Código de Rubricas de 1960: festa de I classe impedida por dia de
 * posto melhor transfere-se para o primeiro dia seguinte que não esteja
 * ocupado por ofício de I ou II classe. Festa de II classe ou inferior não se
 * transfere: é comemorada, ou omitida.
 */
function resolverAno(ano: number): Map<string, Ocupante> {
  const emCache = cacheDeAnos.get(ano);
  if (emCache) return emCache;

  const dias = new Map<string, Ocupante>();
  const ordem: Date[] = [];
  for (let m = 0; m < 12; m++) {
    const ultimo = new Date(Date.UTC(ano, m + 1, 0)).getUTCDate();
    for (let d = 1; d <= ultimo; d++) ordem.push(new Date(Date.UTC(ano, m, d)));
  }

  // 1) o Temporal ocupa cada dia
  for (const data of ordem) {
    const { tempo } = tempoDe(data);
    const proprio = diaProprio(data);
    const simples = temporalSimples(data, tempo);
    dias.set(chave(data), {
      nome: proprio?.nome ?? nomeDoTemporal(data, tempo),
      classe: proprio?.classe ?? simples.classe,
      cor: proprio?.cor ?? corDe(data, tempo),
      posto: proprio?.posto ?? simples.posto,
      origem: "temporal",
      comemoracoes: [],
    });
  }

  // 2) ocorrência com o Santoral; o que for de I classe e perder entra na fila
  const aTransferir: FestaFixa[] = [];
  for (const festa of SANTORAL) {
    const data = new Date(Date.UTC(ano, festa.mes - 1, festa.dia));
    if (data.getUTCMonth() !== festa.mes - 1) continue; // 29/2 em ano comum
    const k = chave(data);
    const atual = dias.get(k);
    if (!atual) continue;
    const posto = postoDaFesta(festa);

    if (posto < atual.posto) {
      // a festa vence; o Temporal de I ou II classe fica em comemoração
      dias.set(k, {
        nome: festa.nome,
        classe: festa.classe,
        cor: festa.cor,
        posto,
        origem: "santoral",
        comemoracoes: atual.classe <= 2 ? [atual.nome, ...atual.comemoracoes] : atual.comemoracoes,
      });
    } else if (festa.classe === 1) {
      aTransferir.push(festa);
    } else if (festa.classe <= 3) {
      atual.comemoracoes.push(festa.nome);
    }
  }

  // 3) transferência: primeiro dia seguinte livre de ofício de I ou II classe
  for (const festa of aTransferir) {
    const origem = new Date(Date.UTC(ano, festa.mes - 1, festa.dia));
    let alvo: string | undefined;
    for (let passo = 1; passo <= 60; passo++) {
      const candidata = new Date(origem.getTime() + passo * DIA_MS);
      if (candidata.getUTCFullYear() !== ano) break;
      const ocupante = dias.get(chave(candidata));
      if (ocupante && livreParaTransferencia(ocupante.posto)) {
        alvo = chave(candidata);
        break;
      }
    }
    if (!alvo) continue; // sem lugar no ano: fica omitida

    const deslocado = dias.get(alvo)!;
    dias.set(alvo, {
      nome: festa.nome,
      classe: festa.classe,
      cor: festa.cor,
      posto: postoDaFesta(festa),
      origem: "santoral",
      transferidaDe: chave(origem),
      comemoracoes: deslocado.classe <= 3 && deslocado.origem === "santoral"
        ? [deslocado.nome, ...deslocado.comemoracoes]
        : deslocado.comemoracoes,
    });
    // no dia de origem, a festa transferida vira menção
    const naOrigem = dias.get(chave(origem));
    if (naOrigem) naOrigem.comemoracoes = naOrigem.comemoracoes.filter((c) => c !== festa.nome);
  }

  cacheDeAnos.set(ano, dias);
  return dias;
}

/** O que se celebra numa data, com ocorrência e transferência já resolvidas. */
export function diaLiturgico(data: Date): DiaLiturgico {
  const { tempo, semana } = tempoDe(data);
  const o = resolverAno(data.getUTCFullYear()).get(chave(data));
  if (!o) {
    return {
      data, tempo, semana,
      nome: nomeDoTemporal(data, tempo),
      classe: 4, cor: corDe(data, tempo),
      comemoracoes: [], origem: "temporal",
    };
  }
  return {
    data, tempo, semana,
    nome: o.nome,
    classe: o.classe,
    cor: o.cor,
    comemoracoes: o.comemoracoes,
    origem: o.origem,
    transferidaDe: o.transferidaDe,
  };
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

const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
  "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII"];
const SEM = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado"];

/** Nome do dia do Temporal quando ele não tem nome próprio. */
function nomeDoTemporal(data: Date, tempo: Tempo): string {
  const { semana } = tempoDe(data);
  const n = semana ? ROMANOS[semana] ?? String(semana) : "";
  if (data.getUTCDay() === 0) {
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
