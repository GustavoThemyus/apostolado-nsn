import { eixoDoAno } from "./computo";
import { festasDe } from "./santoral";
import { comProprioBrasil } from "./proprioBrasil";
import { comProprioLocal } from "./proprioLocal";
import { SANTORAL } from "./santoral";
import type { DiaLiturgico, Tempo } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const DIA = 86400000;
const PENITENCIAIS: Tempo[] = ["advento", "septuagesima", "quaresma", "paixao"];

export interface Desenvolvimento {
  gloria: boolean;
  credo: boolean;
  cantoInterlecional: string;
  prefacio: string;
  ultimoEvangelho: string;
  oracoes: number;
  leoninas: boolean;
}

export interface RitoProprio {
  nome: string;
  nota: string;
}

export function ritoProprioDe(dia: DiaLiturgico): RitoProprio | null {
  const e = eixoDoAno(dia.data.getUTCFullYear());
  const hoje = soData(dia.data);
  const pascoa = soData(e.pascoa);

  if (hoje === pascoa - 3 * DIA) {
    return {
      nome: "Missa vespertina in Cena Domini",
      nota: "Tem rito próprio, com a procissão ao altar da reposição e a desnudação dos altares.",
    };
  }
  if (hoje === pascoa - 2 * DIA) {
    return {
      nome: "Solene ação litúrgica da Paixão e Morte do Senhor",
      nota: "Não há Missa: há as leituras com a Paixão, as orações solenes, a adoração da Cruz e a comunhão dos pré-santificados.",
    };
  }
  if (hoje === pascoa - DIA) {
    return {
      nome: "Vigília pascal",
      nota: "Tem rito próprio, celebrado à noite, e só depois dele vem a Missa.",
    };
  }
  return null;
}

function ehRequiem(dia: DiaLiturgico): boolean {
  return dia.cor === "preto";
}

function achaFesta(dia: DiaLiturgico) {
  const mes = dia.data.getUTCMonth() + 1;
  const d = dia.data.getUTCDate();
  const locais = comProprioLocal(comProprioBrasil(SANTORAL)).filter((f) => f.mes === mes && f.dia === d);
  return locais.find((f) => f.nome === dia.nome) ?? festasDe(mes, d).find((f) => f.nome === dia.nome);
}

function temGloria(dia: DiaLiturgico): boolean {
  if (ehRequiem(dia)) return false;
  const festa = achaFesta(dia);
  if (festa?.tipo === "vigilia") return false;
  if (dia.origem === "santoral") return dia.classe <= 3;
  if (dia.data.getUTCDay() === 0) return !PENITENCIAIS.includes(dia.tempo);
  return false;
}

function temCredo(dia: DiaLiturgico): boolean {
  if (ehRequiem(dia)) return false;
  if (dia.origem === "santoral") {
    const festa = achaFesta(dia);
    if (festa?.tipo === "vigilia") return false;
    return dia.classe === 1 || Boolean(festa?.credo);
  }
  return dia.data.getUTCDay() === 0;
}

function canto(dia: DiaLiturgico): string {
  if (ehRequiem(dia)) return "Gradual, Trato e a sequência Dies irae";
  const e = eixoDoAno(dia.data.getUTCFullYear());
  const noTempoPascal =
    soData(dia.data) >= soData(e.pascoa) && soData(dia.data) <= soData(e.pentecostes);
  if (noTempoPascal) return "Dois Aleluias, no lugar do Gradual";
  if (PENITENCIAIS.includes(dia.tempo) && dia.tempo !== "advento") return "Gradual e Trato";
  return "Gradual e Aleluia";
}

function prefacio(dia: DiaLiturgico): string {
  if (ehRequiem(dia)) return "dos Defuntos";
  const e = eixoDoAno(dia.data.getUTCFullYear());
  const hoje = soData(dia.data);
  const nome = dia.nome.toLowerCase();

  if (nome.includes("nossa senhora") || nome.includes("assunção") ||
      nome.includes("imaculada") || nome.includes("anunciação") ||
      nome.includes("purificação") || nome.includes("visitação")) return "de Nossa Senhora";
  if (nome.includes("apóstolo") || nome.includes("evangelista")) return "dos Apóstolos";
  if (nome.includes("josé")) return "de São José";
  if (nome.includes("cruz")) return "da Santa Cruz";
  if (nome.includes("sagrado coração")) return "do Sagrado Coração";
  if (nome.includes("cristo rei")) return "de Cristo Rei";
  if (nome.includes("trindade")) return "da Santíssima Trindade";

  if (dia.tempo === "natal") return "do Natal";
  const mes = dia.data.getUTCMonth() + 1;
  const d = dia.data.getUTCDate();
  if (mes === 1 && d >= 6 && d <= 13) return "da Epifania";
  if (dia.tempo === "quaresma" || dia.tempo === "septuagesima") return "da Quaresma";
  if (dia.tempo === "paixao") return "da Santa Cruz";
  if (hoje >= soData(e.pascoa) && hoje < soData(e.ascensao)) return "da Páscoa";
  if (hoje >= soData(e.ascensao) && hoje < soData(e.pentecostes)) return "da Ascensão";
  if (hoje >= soData(e.pentecostes) && hoje <= soData(e.pentecostes) + 6 * 86400000)
    return "do Espírito Santo";

  return dia.data.getUTCDay() === 0 ? "da Santíssima Trindade" : "Comum";
}

function ultimoEvangelho(dia: DiaLiturgico): string {
  if (ehRequiem(dia)) return "omitido";
  const e = eixoDoAno(dia.data.getUTCFullYear());
  const hoje = soData(dia.data);
  if (hoje >= soData(e.ramos) && hoje < soData(e.pascoa)) return "omitido na Semana Santa";
  if (dia.nome.includes("Ramos")) return "próprio do dia";
  return "prólogo de São João";
}

export function desenvolvimentoDe(dia: DiaLiturgico): Desenvolvimento | null {
  if (ritoProprioDe(dia)) return null;
  return {
    gloria: temGloria(dia),
    credo: temCredo(dia),
    cantoInterlecional: canto(dia),
    prefacio: prefacio(dia),
    ultimoEvangelho: ultimoEvangelho(dia),
    oracoes: 1 + dia.comemoracoes.length,
    leoninas: !ehRequiem(dia),
  };
}
