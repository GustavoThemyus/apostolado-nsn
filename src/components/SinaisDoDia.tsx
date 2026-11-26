import { celebracoesDoOrdo, type DiaDoOrdo } from "../calendar/ordo";
import { NOMES_DO_BRASIL } from "../calendar/proprioBrasil";
import type { DiaLiturgico } from "../calendar/tipos";

export type Sinal = "primeiraQuinta" | "primeiraSexta" | "brasil" | "temporas";

export const NOME_DO_SINAL: Record<Sinal, string> = {
  primeiraQuinta: "Primeira quinta-feira do mês",
  primeiraSexta: "Primeira sexta-feira do mês",
  brasil: "Próprio do Brasil",
  temporas: "Têmporas",
};

function Desenho({ sinal }: { sinal: Sinal }) {
  if (sinal === "primeiraQuinta") {
    return <circle cx="5" cy="5" r="3.7" fill="currentColor" />;
  }
  if (sinal === "primeiraSexta") {
    return (
      <path
        d="M5 9C1.4 6.4 0.6 4.4 1.6 2.7 2.5 1.2 4.2 1.3 5 2.6 5.8 1.3 7.5 1.2 8.4 2.7 9.4 4.4 8.6 6.4 5 9Z"
        fill="currentColor"
      />
    );
  }
  if (sinal === "brasil") {
    return (
      <path d="M5 0.6 9.4 5 5 9.4 0.6 5Z" fill="currentColor" />
    );
  }
  return (
    <>
      <circle cx="2.6" cy="2.6" r="1.5" fill="currentColor" />
      <circle cx="7.4" cy="2.6" r="1.5" fill="currentColor" />
      <circle cx="2.6" cy="7.4" r="1.5" fill="currentColor" />
      <circle cx="7.4" cy="7.4" r="1.5" fill="currentColor" />
    </>
  );
}

export function Sinal({ sinal }: { sinal: Sinal }) {
  return (
    <svg
      className={`calendario__sinal calendario__sinal--${sinal}`}
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
    >
      <Desenho sinal={sinal} />
    </svg>
  );
}

export function SinaisDoDia({ sinais }: { sinais: Sinal[] }) {
  if (sinais.length === 0) return null;
  return (
    <span className="calendario__sinais" aria-hidden="true">
      {sinais.map((s) => (
        <Sinal sinal={s} key={s} />
      ))}
    </span>
  );
}

function primeirasDoMes(data: Date): Sinal[] {
  if (data.getUTCDate() > 7) return [];
  if (data.getUTCDay() === 4) return ["primeiraQuinta"];
  if (data.getUTCDay() === 5) return ["primeiraSexta"];
  return [];
}

export function sinaisDe1962(dia: DiaLiturgico): Sinal[] {
  const sinais = primeirasDoMes(dia.data);
  const naOitavaDePentecostes = /da Oitava de Pentecostes$/.test(dia.nome);
  const diaDeTempora = [3, 5, 6].includes(dia.data.getUTCDay());
  const ehTempora = (n: string) => /das Têmporas/.test(n);
  if (
    ehTempora(dia.nome) ||
    dia.comemoracoes.some(ehTempora) ||
    (naOitavaDePentecostes && diaDeTempora)
  ) {
    sinais.push("temporas");
  }
  const doBrasil = (n: string) => NOMES_DO_BRASIL.includes(n);
  if (doBrasil(dia.nome) || dia.comemoracoes.some(doBrasil)) sinais.push("brasil");
  return sinais;
}

export function sinaisDoOrdo(dia: DiaDoOrdo): Sinal[] {
  const sinais = primeirasDoMes(dia.data);
  const proprios = celebracoesDoOrdo(dia)
    .map((c) => c.proprio)
    .filter((p): p is string => !!p);
  if (proprios.some((p) => /^Próprio do Brasil/.test(p))) sinais.push("brasil");
  if (proprios.some((p) => /Têmporas/.test(p))) sinais.push("temporas");
  return sinais;
}
