import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";
import { colecao, dataPorExtenso, publicadas } from "../data/postagens";
import { Elo } from "../routes/Elo";

export default function Postagens() {
  const lista = publicadas();

  return (
    <Moldura titulo={colecao.titulo}>
      <Cabecalho titulo={colecao.titulo} descricao={colecao.descricao} />

      {lista.length === 0 ? (
        <Vazia o_que="Ainda não há postagens publicadas." />
      ) : (
        <ul className="postagens">
          {lista.map((p) => (
            <li key={p.id}>
              <Elo para={`/postagens/${p.id}`} className="postagem-linha">
                <span className="postagem-linha__data">
                  {dataPorExtenso(p.data)}
                </span>
                <span className="postagem-linha__titulo">{p.titulo}</span>
                <span className="postagem-linha__resumo">{p.resumo}</span>
                {p.rascunho && (
                  <span className="cartao__preparo">Rascunho</span>
                )}
              </Elo>
            </li>
          ))}
        </ul>
      )}
    </Moldura>
  );
}
