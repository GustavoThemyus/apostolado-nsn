import { ListaDeBlocos } from "../components/Bloco";
import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";
import { dataPorExtenso, porId } from "../data/postagens";
import { Elo } from "../rotas/Elo";
import { usarParametros } from "../rotas/usarRota";

export default function Postagem() {
  const { id } = usarParametros();
  const postagem = porId(id);

  if (!postagem) {
    return (
      <Moldura titulo="Postagem">
        <Cabecalho titulo="Postagem" />
        <Vazia o_que={`A postagem "${id}" não foi encontrada.`} />
        <p>
          <Elo para="/postagens">Ver todas as postagens</Elo>
        </p>
      </Moldura>
    );
  }

  return (
    <Moldura titulo={postagem.titulo}>
      <Cabecalho titulo={postagem.titulo} descricao={postagem.resumo} />
      <p className="postagem__data">
        <time dateTime={postagem.data}>{dataPorExtenso(postagem.data)}</time>
      </p>
      {postagem.rascunho && <Vazia variante="rascunho" />}
      <ListaDeBlocos blocos={postagem.blocos} />
    </Moldura>
  );
}
