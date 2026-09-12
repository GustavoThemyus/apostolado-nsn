import { NOME_DA_PENITENCIA, type Penitencia } from "../calendario/penitencia";

/**
 * A cruz que marca o dia de abstinência na casa do calendário.
 *
 * O dia dispensado não leva marca nenhuma: dispensado é dia comum, e pôr um
 * sinal nele faria o leitor procurar o que não há. Quem diz que houve
 * dispensa é o detalhe do dia, onde cabe a frase inteira.
 */
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

/** A linha que explica as duas cruzes, embaixo da grade. */
export function LegendaDaPenitencia() {
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
    </p>
  );
}
