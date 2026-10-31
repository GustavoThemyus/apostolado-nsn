import { NOME_DA_PENITENCIA, type Penitencia } from "../calendario/penitencia";
import { NOME_DO_SINAL, Sinal, type Sinal as NomeDeSinal } from "./SinaisDoDia";

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

/**
 * A linha que explica os sinais da grade, embaixo dela.
 *
 * Mora neste arquivo porque as primeiras entradas são as cruzes daqui. Depois
 * vem a bolinha maior das festas de 1ª e 2ª classe, que a grade desenha
 * sozinha, e por fim os sinais do canto. Nenhum deles ninguém adivinharia sem
 * esta linha, e é por isso que ela cresce junto com eles.
 *
 * `sinais` é o que aquela grade sabe marcar, e não a lista inteira: o próprio
 * do Brasil só existe no Ordo, e prometê-lo na legenda do calendário de 1962
 * mandaria o leitor procurar o que lá não há.
 */
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
