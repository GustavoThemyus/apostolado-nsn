import { desenvolvimentoDe } from "../calendario/desenvolvimento";
import type { DiaLiturgico } from "../calendario/tipos";

const Sim = ({ v }: { v: boolean }) => (
  <span className={v ? "sinal sinal--sim" : "sinal sinal--nao"}>{v ? "sim" : "não"}</span>
);

/** O que acontece na Missa do dia, deduzido das rubricas gerais. */
export function Desenvolvimento({ dia }: { dia: DiaLiturgico }) {
  const d = desenvolvimentoDe(dia);
  return (
    <div className="desenv">
      <p className="desenv__titulo">Na Missa deste dia</p>
      <dl className="desenv__lista">
        <div><dt>Glória</dt><dd><Sim v={d.gloria} /></dd></div>
        <div><dt>Credo</dt><dd><Sim v={d.credo} /></dd></div>
        <div><dt>Orações</dt><dd>{d.oracoes}</dd></div>
        <div><dt>Entre as leituras</dt><dd>{d.cantoInterlecional}</dd></div>
        <div><dt>Prefácio</dt><dd>{d.prefacio}</dd></div>
        <div><dt>Último Evangelho</dt><dd>{d.ultimoEvangelho}</dd></div>
      </dl>
    </div>
  );
}
