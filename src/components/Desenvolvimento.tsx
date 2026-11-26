import { desenvolvimentoDe, ritoProprioDe } from "../calendario/desenvolvimento";
import type { DiaLiturgico } from "../calendario/tipos";

const Sim = ({ v }: { v: boolean }) => (
  <span className={v ? "sinal sinal--sim" : "sinal sinal--nao"}>{v ? "sim" : "não"}</span>
);

export function Desenvolvimento({ dia }: { dia: DiaLiturgico }) {
  const proprio = ritoProprioDe(dia);
  if (proprio) {
    return (
      <div className="desenv">
        <p className="desenv__titulo">O rito deste dia</p>
        <p className="desenv__proprio">{proprio.nome}</p>
        <p className="desenv__proprio-nota">
          {proprio.nota} Para celebrar, siga o Missal.
        </p>
      </div>
    );
  }

  const d = desenvolvimentoDe(dia);
  if (!d) return null;
  return (
    <div className="desenv">
      <p className="desenv__titulo">Na Missa deste dia</p>
      <dl className="desenv__lista">
        <div><dt>Glória</dt><dd><Sim v={d.gloria} /></dd></div>
        <div><dt>Orações</dt><dd>{d.oracoes}</dd></div>
        <div><dt>Entre as leituras</dt><dd>{d.cantoInterlecional}</dd></div>
        <div><dt>Credo</dt><dd><Sim v={d.credo} /></dd></div>
        <div><dt>Prefácio</dt><dd>{d.prefacio}</dd></div>
        <div><dt>Último Evangelho</dt><dd>{d.ultimoEvangelho}</dd></div>
      </dl>
    </div>
  );
}
