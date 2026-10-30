import { useMemo } from "react";
import { indulgenciasDoMes, type Ocorrencia } from "../calendario/indulgencias";
import { indulgencias } from "../data/indulgenciasDias";
import { Elo } from "../routes/Elo";
import { porExtensoCurto } from "./DiaDeHoje";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Dias seguidos com exatamente as mesmas indulgências: uma linha só. */
interface Faixa {
  de: string;
  ate: string;
  titulos: string[];
}

const diaSeguinte = (iso: string): string => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/**
 * A lista do mês, agrupada.
 *
 * Agrupa porque a Oitava das almas do Purgatório é um intervalo de oito dias
 * com o mesmo título, e sem isto a página inicial trazia, em novembro, nove
 * linhas quase idênticas uma debaixo da outra. Agrupado, novembro de 2026 dá
 * quatro linhas: "1 de novembro", "2 de novembro", que tem Finados por cima e
 * por isso não entra na faixa, "3 a 8 de novembro" e "9 de novembro".
 */
function emFaixas(porDia: Map<string, Ocorrencia[]>): Faixa[] {
  const faixas: Faixa[] = [];

  for (const data of [...porDia.keys()].sort()) {
    const titulos = [
      ...new Set((porDia.get(data) ?? []).map((o) => o.entrada.titulo)),
    ];
    const ultima = faixas[faixas.length - 1];
    if (
      ultima &&
      diaSeguinte(ultima.ate) === data &&
      ultima.titulos.join("\u0000") === titulos.join("\u0000")
    ) {
      ultima.ate = data;
    } else {
      faixas.push({ de: data, ate: data, titulos });
    }
  }

  return faixas;
}

/** "1 a 8 de novembro" numa faixa; "2 de novembro" num dia só. */
function quando(faixa: Faixa): string {
  if (faixa.de === faixa.ate) return porExtensoCurto(faixa.de);
  return `${Number(faixa.de.slice(8))} a ${porExtensoCurto(faixa.ate)}`;
}

/**
 * Os dias do mês que têm indulgência, na página inicial.
 *
 * "Adicione na página inicial um preview das indulgências do mês, apenas
 * falando os dias que tem e levando para a página de Indulgências para
 * consultar no calendário", pediu o Perez — e é por isso que aqui não está a
 * obra, nem as condições, nem o cânon: cada linha diz o dia e a festa, e leva
 * ao dia certo da grade, onde está o resto.
 *
 * Do mesmo motor da grade, e não de uma lista escrita à mão: o que acompanha
 * a transferência de uma festa lá acompanha aqui também.
 */
export function IndulgenciasDoMes({ data }: { data?: Date }) {
  const hoje = useMemo(() => {
    if (data) return data;
    const agora = new Date();
    return new Date(
      Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()),
    );
  }, [data]);

  const mes = hoje.getUTCMonth() + 1;
  const faixas = useMemo(
    () => emFaixas(indulgenciasDoMes(indulgencias.dias, hoje.getUTCFullYear(), mes)),
    [hoje, mes],
  );

  /*
   * Mês sem nenhuma, a caixa não aparece. Acontece: conferidos 2026 e 2027,
   * julho e setembro não têm nenhuma indulgência presa a dia nenhum nos dois
   * anos.
   */
  if (faixas.length === 0) return null;

  return (
    <aside className="indulgencias-mes" aria-labelledby="indulgencias-mes-titulo">
      <h2 className="indulgencias-mes__titulo" id="indulgencias-mes-titulo">
        Indulgências de {MESES[mes - 1]}
      </h2>
      <ul className="indulgencias-mes__lista">
        {faixas.map((faixa) => (
          <li key={faixa.de}>
            <Elo para={`/indulgencias?dia=${faixa.de}`} className="indulgencias-mes__item">
              <span className="indulgencias-mes__data">{quando(faixa)}</span>
              <span className="indulgencias-mes__nome">
                {faixa.titulos.join("; ")}
              </span>
            </Elo>
          </li>
        ))}
      </ul>
      <Elo para="/indulgencias" className="dia__link">
        Ver no calendário das indulgências
      </Elo>
    </aside>
  );
}
