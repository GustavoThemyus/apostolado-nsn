import { site } from "../data/site";
import { chamadaDaRota, imagemDaRota, rotaPorPadrao } from "../routes/rotas";
import { usarRota } from "../routes/usarRota";
import { Brasao } from "./Brasao";
import { Estrela } from "./Estrela";

/**
 * O cabeçalho de toda página, num só formato.
 *
 * A ordem é a de uma folha de rosto: o apostolado, depois a seção, depois o
 * nome da página, e o lema fechando. Numa subpágina a seção aparece em cima,
 * menor; na página da própria seção não aparece, porque ela repetiria o
 * título logo abaixo.
 *
 * O lema é sempre o lema. Antes uma página podia trocá-lo por uma antífona
 * própria, e o resultado foi o "Iter para tutum" sumir justamente das páginas
 * mais compridas: aquela linha é o lugar dele, não um espaço livre.
 *
 * A chamada vem da rota, e não de prop nem do JSON: o rito só se anuncia nas
 * páginas que falam da Missa. Anunciá-lo no calendário e nas indulgências
 * dizia a coisa certa no lugar errado.
 */
export function Cabecalho({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao?: string;
}) {
  const { rota } = usarRota();
  const estampa = imagemDaRota(rota);
  // a seção só se anuncia em cima de uma subpágina dela
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
