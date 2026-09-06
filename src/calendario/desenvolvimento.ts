import { eixoDoAno } from "./computo";
import { festasDe } from "./santoral";
import { comProprioLocal } from "./proprioLocal";
import { SANTORAL } from "./santoral";
import type { DiaLiturgico, Tempo } from "./tipos";

const soData = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const PENITENCIAIS: Tempo[] = ["advento", "septuagesima", "quaresma", "paixao"];

export interface Desenvolvimento {
  gloria: boolean;
  credo: boolean;
  /** Gradual e Aleluia, Gradual e Trato, dois Aleluias, ou o de Requiem. */
  cantoInterlecional: string;
  prefacio: string;
  ultimoEvangelho: string;
  /** Quantas orações se dizem na Colecta, na Secreta e na Pós-comunhão. */
  oracoes: number;
  leoninas: boolean;
}

function ehRequiem(dia: DiaLiturgico): boolean {
  return dia.cor === "preto";
}

function achaFesta(dia: DiaLiturgico) {
  const mes = dia.data.getUTCMonth() + 1;
  const d = dia.data.getUTCDate();
  const locais = comProprioLocal(SANTORAL).filter((f) => f.mes === mes && f.dia === d);
  return locais.find((f) => f.nome === dia.nome) ?? festasDe(mes, d).find((f) => f.nome === dia.nome);
}

/** Glória: nas festas e nos domingos fora dos tempos penitenciais. */
function temGloria(dia: DiaLiturgico): boolean {
  if (ehRequiem(dia)) return false;
  const festa = achaFesta(dia);
  if (festa?.tipo === "vigilia") return false;
  if (dia.origem === "santoral") return dia.classe <= 3;
  if (dia.data.getUTCDay() === 0) return !PENITENCIAIS.includes(dia.tempo);
  return false;
}

/** Credo: domingos, festas de I classe e as categorias que o pedem. */
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

  // prefácio próprio da festa
  if (nome.includes("nossa senhora") || nome.includes("assunção") ||
      nome.includes("imaculada") || nome.includes("anunciação") ||
      nome.includes("purificação") || nome.includes("visitação")) return "de Nossa Senhora";
  if (nome.includes("apóstolo") || nome.includes("evangelista")) return "dos Apóstolos";
  if (nome.includes("josé")) return "de São José";
  if (nome.includes("cruz")) return "da Santa Cruz";
  if (nome.includes("sagrado coração")) return "do Sagrado Coração";
  if (nome.includes("cristo rei")) return "de Cristo Rei";
  if (nome.includes("trindade")) return "da Santíssima Trindade";

  // prefácio próprio do tempo
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

  // sem prefácio próprio: Trindade nos domingos, Comum nos demais dias
  return dia.data.getUTCDay() === 0 ? "da Santíssima Trindade" : "Comum";
}

function ultimoEvangelho(dia: DiaLiturgico): string {
  if (ehRequiem(dia)) return "omitido";
  const e = eixoDoAno(dia.data.getUTCFullYear());
  const hoje = soData(dia.data);
  if (hoje >= soData(e.ramos) && hoje <= soData(e.pascoa)) return "omitido na Semana Santa";
  if (dia.nome.includes("Ramos")) return "próprio do dia";
  return "prólogo de São João";
}

/**
 * O que acontece na Missa deste dia, deduzido do tempo, da classe e da festa.
 *
 * É dedução a partir das rubricas gerais, não transcrição de um Ordo: serve
 * para se orientar, e não dispensa a conferência quando o dia é incomum.
 */
export function desenvolvimentoDe(dia: DiaLiturgico): Desenvolvimento {
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
