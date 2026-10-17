import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";
import { colecao, publicados } from "../data/folhetos";
import { NOME_DA_CATEGORIA, type CategoriaDeFolheto } from "../data/tipos";
import { Elo } from "../routes/Elo";

/**
 * O índice dos folhetos, agrupado por gênero.
 *
 * Agrupa porque o Perez listou quatro gêneros de uma vez — obras
 * indulgenciadas, próprios de Missa, cantos de procissão, ofícios de Semana
 * Santa — e uma lista corrida de trinta folhas misturaria o próprio de um
 * domingo com o ofício de Sexta-feira Santa. O grupo vazio não aparece: com
 * um folheto só, a página mostra um título, e não quatro.
 */
const ORDEM: CategoriaDeFolheto[] = ["indulgencia", "proprio", "canto", "oficio"];

export default function Folhetos() {
  const lista = publicados();

  return (
    <Moldura titulo={colecao.titulo}>
      <Cabecalho titulo={colecao.titulo} descricao={colecao.descricao} />

      {lista.length === 0 ? (
        <Vazia o_que="Ainda não há folhetos publicados." />
      ) : (
        ORDEM.filter((cat) => lista.some((f) => f.categoria === cat)).map((cat) => (
          <section key={cat}>
            <h2 className="folhetos__genero">{NOME_DA_CATEGORIA[cat]}</h2>
            <ul className="postagens">
              {lista
                .filter((f) => f.categoria === cat)
                .map((f) => (
                  <li key={f.id}>
                    <Elo para={`/folhetos/${f.id}`} className="postagem-linha">
                      {/* o chapéu não entra aqui: o cabeçalho do grupo já
                          diz "Obras indulgenciadas", e repetir "Obra
                          indulgenciada" uma linha abaixo é eco */}
                      <span className="postagem-linha__titulo">{f.titulo}</span>
                      <span className="postagem-linha__resumo">{f.resumo}</span>
                      {f.rascunho && <span className="cartao__preparo">Rascunho</span>}
                    </Elo>
                  </li>
                ))}
            </ul>
          </section>
        ))
      )}
    </Moldura>
  );
}
