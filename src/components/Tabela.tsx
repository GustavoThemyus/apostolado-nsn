import { TextoRico } from "./TextoRico";

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
