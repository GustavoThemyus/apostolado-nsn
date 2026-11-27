import { site } from "../data/site";
import { chamadaDaRota, focoDaRota, imagemDaRota, rotaPorPadrao } from "../routes/rotas";
import { usarRota } from "../routes/usarRota";
import { Brasao } from "./Brasao";
import { Estrela } from "./Estrela";

export function Cabecalho({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao?: string;
}) {
  const { rota } = usarRota();
  const estampa = imagemDaRota(rota);
  const secao = rota?.pai ? rotaPorPadrao(rota.pai)?.titulo : undefined;

  return (
    <header
      className={`cabecalho${estampa ? " cabecalho--estampado" : " damasco"}`}
    >
      {estampa && (
        <>
          <img
            className="cabecalho__estampa"
            src={estampa}
            alt=""
            aria-hidden="true"
            style={{ objectPosition: focoDaRota(rota) }}
          />
          <span className="cabecalho__veu" aria-hidden="true" />
        </>
      )}
      <Brasao tamanho="cabecalho" />
      <p className="cabecalho__chamada">
        {chamadaDaRota(rota) ?? site.chamada}
      </p>
      {secao && <p className="cabecalho__secao">{secao}</p>}
      <h1 className="cabecalho__titulo">{titulo}</h1>
      {descricao && <p className="cabecalho__resumo">{descricao}</p>}
      <p className="cabecalho__lema" lang="la">
        <Estrela />
        {site.lema}
        <Estrela />
      </p>
    </header>
  );
}
