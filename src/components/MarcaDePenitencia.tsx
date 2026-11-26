import { NOME_DA_PENITENCIA, type Penitencia } from "../calendario/penitencia";
import { NOME_DO_SINAL, Sinal, type Sinal as NomeDeSinal } from "./SinaisDoDia";

export function MarcaDePenitencia({ penitencia }: { penitencia?: Penitencia }) {
  if (!penitencia || penitencia === "dispensada") return null;
  return (
    <span
      className={`calendario__penitencia${
        penitencia === "jejum-e-abstinencia" ? " calendario__penitencia--jejum" : ""
      }`}
      title={NOME_DA_PENITENCIA[penitencia]}
      aria-hidden="true"
    />
  );
}

export function LegendaDaGrade({ sinais = [] }: { sinais?: NomeDeSinal[] }) {
  return (
    <p className="calendario__legenda">
      <span>
        <span className="calendario__penitencia" aria-hidden="true" />
        Abstinência de carne
      </span>
      <span>
        <span className="calendario__penitencia calendario__penitencia--jejum" aria-hidden="true" />
        Jejum e abstinência
      </span>
      <span>
        <span
          className="calendario__ponto calendario__ponto--exemplo calendario__ponto--maior"
          aria-hidden="true"
        />
        Festa de 1ª ou 2ª classe
      </span>
      {sinais.map((s) => (
        <span key={s}>
          <Sinal sinal={s} />
          {NOME_DO_SINAL[s]}
        </span>
      ))}
    </p>
  );
}
