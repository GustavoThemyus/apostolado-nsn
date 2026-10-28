import bruto from "../data/indulgencias-dias.json";
import type { DiaDeIndulgencia } from "../calendario/indulgencias";
import type { Bloco } from "../data/tipos";
import { Elo } from "../routes/Elo";
import { TextoRico } from "./TextoRico";

/**
 * O calendário das indulgências, em quadro, dentro de outra página.
 *
 * O Perez pediu que o calendário fosse "transportado de forma compacta" para
 * a página geral das Indulgências, com o modelo do calendário arquidiocesano
 * — que é quadro corrido, e não grade de mês. Quem chega em Indulgências vê o
 * ano inteiro de uma vez; quem quer o dia de hoje, as transferências e as
 * ressalvas vai ao calendário interativo, a um toque daqui.
 *
 * Derivado de `indulgencias-dias.json`, e não escrito à mão no documento:
 * são os mesmos dias, e escritos duas vezes eles divergem na primeira
 * correção. É a mesma razão do bloco `indice`, que também se deriva.
 */

const colecao = bruto as unknown as { dias: DiaDeIndulgencia[] };

/** O texto corrido de um bloco, para a célula do quadro. */
const ehParagrafo = (b: Bloco): b is Bloco & { tipo: "paragrafo"; texto: string } =>
  b.tipo === "paragrafo";

/**
 * A obra, sem as ressalvas.
 *
 * A ressalva vira o § na coluna da festa. No impresso do Perez ela ocupa a
 * coluna da data inteira — a da Cátedra de São Pedro tem dezoito linhas —, e
 * num quadro que quer caber numa tela isso deixa de ser quadro. O que ela diz
 * não se perde: está no calendário interativo, que o § manda abrir.
 */
function obraDe(entrada: DiaDeIndulgencia): string {
  return entrada.obra.filter(ehParagrafo).map((b) => b.texto).join(" ");
}

const temRessalva = (entrada: DiaDeIndulgencia): boolean =>
  entrada.obra.some((b) => b.tipo === "nota");

export function CalendarioCompacto() {
  const comRessalva = colecao.dias.some(temRessalva);

  return (
    <div className="calendario-compacto">
      <p className="paragrafo">
        As vinte e uma concessões presas a um dia do ano, na ordem do
        calendário.{" "}
        {comRessalva && (
          <>
            O <strong>§</strong> marca a festa que leva ressalva.{" "}
          </>
        )}
        <Elo para="/indulgencias/calendario" className="elo-texto">
          O calendário interativo
        </Elo>{" "}
        traz as ressalvas por extenso, a data de cada uma no ano corrente e as
        que valem em qualquer dia.
      </p>

      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th scope="col">Data</th>
              <th scope="col">Festividade litúrgica</th>
              <th scope="col">Obra indulgenciada prescrita</th>
            </tr>
          </thead>
          <tbody>
            {colecao.dias.map((entrada) => (
              <tr key={entrada.id}>
                <td data-coluna="Data">
                  <TextoRico texto={entrada.quandoPorExtenso} />
                </td>
                <td data-coluna="Festividade litúrgica">
                  {entrada.titulo}
                  {temRessalva(entrada) && (
                    <>
                      {" "}
                      <Elo
                        para="/indulgencias/calendario"
                        className="calendario-compacto__ressalva"
                        aria-label={`Ressalva sobre ${entrada.titulo}, no calendário interativo`}
                      >
                        §
                      </Elo>
                    </>
                  )}
                </td>
                <td data-coluna="Obra indulgenciada prescrita">
                  <TextoRico texto={obraDe(entrada)} />
                  {entrada.fonte && (
                    <span className="calendario-compacto__fonte">
                      <TextoRico texto={entrada.fonte} />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
