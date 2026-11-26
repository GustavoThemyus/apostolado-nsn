import { ListaDeBlocos } from "../components/Bloco";
import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { ProvedorDeNotas } from "../components/Notas";
import { Vazia } from "../components/Vazia";
import { dataPorExtenso, porId } from "../data/postagens";
import { Elo } from "../routes/Elo";
import { usarParametros } from "../routes/usarRota";

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
      {postagem.imagem && (
        <img
          className="postagem__estampa"
          src={postagem.imagem}
          alt=""
          width={postagem.largura ?? 480}
          height={postagem.altura ?? 640}
        />
      )}
      {postagem.rascunho && <Vazia variante="rascunho" />}
      <ProvedorDeNotas notas={postagem.notas}>
        <ListaDeBlocos blocos={postagem.blocos} />
      </ProvedorDeNotas>
    </Moldura>
  );
}
