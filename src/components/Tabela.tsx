import { TextoRico } from "./TextoRico";

/**
 * Em telas estreitas cada linha vira uma ficha empilhada, com o nome da
 * coluna vindo de data-coluna. A partir de 46rem volta a ser tabela.
 *
 * O quadro que compara colunas é outra coisa: em fichas por linha os três
 * lados se misturam. Ali o celular mostra um bloco por coluna.
 */
export function Tabela({
  colunas,
  linhas,
  ancoras,
  porColuna,
}: {
  colunas: string[];
  linhas: string[][];
  ancoras?: string[];
  porColuna?: boolean;
}) {
  return (
    <div className={porColuna ? "tabela tabela--por-coluna" : "tabela"}>
      {porColuna &&
        colunas.map((coluna, i) => (
          <section className="tabela__coluna" key={coluna}>
            <h4 className="tabela__coluna-nome">
              <TextoRico texto={coluna} />
            </h4>
            <ul className="lista">
              {linhas.map((linha, j) => (
                <li key={j}>
                  <TextoRico texto={linha[i]} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      <table>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna} scope="col">
                <TextoRico texto={coluna} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, indiceLinha) => (
            <tr key={indiceLinha} id={ancoras?.[indiceLinha]}>
              {linha.map((celula, indiceCelula) => (
                <td key={indiceCelula} data-coluna={colunas[indiceCelula]}>
                  <TextoRico texto={celula} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
