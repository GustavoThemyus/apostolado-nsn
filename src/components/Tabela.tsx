import { TextoRico } from "./TextoRico";

/**
 * Em telas estreitas cada linha vira uma ficha empilhada, com o nome da
 * coluna vindo de data-coluna. A partir de 46rem volta a ser tabela.
 */
export function Tabela({ colunas, linhas }: { colunas: string[]; linhas: string[][] }) {
  return (
    <div className="tabela">
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
            <tr key={indiceLinha}>
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
