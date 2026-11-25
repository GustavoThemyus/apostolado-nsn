import { publicados } from "../data/folhetos";
import type { CategoriaDeFolheto } from "../data/tipos";
import { Elo } from "../routes/Elo";
import { Vazia } from "./Vazia";

/** As folhas de um gênero, uma linha para cada. */
export function ListaDeFolhetos({ categoria }: { categoria: CategoriaDeFolheto }) {
  const lista = publicados().filter((f) => f.categoria === categoria);
  if (lista.length === 0) return <Vazia o_que="Ainda não há folhetos publicados." />;
  return (
    <ul className="postagens">
      {lista.map((f) => (
        <li key={f.id}>
          <Elo para={`/folhetos/${f.id}`} className="postagem-linha">
            {/* o chapéu não entra aqui: o título da página já diz o gênero */}
            <span className="postagem-linha__titulo">{f.titulo}</span>
            <span className="postagem-linha__resumo">{f.resumo}</span>
            {f.rascunho && <span className="cartao__preparo">Rascunho</span>}
          </Elo>
        </li>
      ))}
    </ul>
  );
}
