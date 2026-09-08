import { site } from "../data/site";
import { chamadaDaRota, imagemDaRota } from "../routes/rotas";
import { usarRota } from "../routes/usarRota";
import { Brasao } from "./Brasao";
import { Estrela } from "./Estrela";

/**
 * O cabeçalho de toda página, num só formato.
 *
 * Havia duas alturas, e o guia ficava diferente das demais seções. Agora é um
 * modelo só: brasão grande, chamada em versalete dourado, o título em Playfair
 * e uma epígrafe em latim embaixo. Sem epígrafe própria vale o lema do brasão,
 * que é o que a maioria das páginas mostra.
 *
 * A chamada vem da rota, e não de prop nem do JSON: o rito só se anuncia nas
 * páginas que falam da Missa. Anunciá-lo no calendário e nas indulgências
 * dizia a coisa certa no lugar errado.
 */
export function Cabecalho({
  titulo,
  descricao,
  epigrafe,
}: {
  titulo: string;
  descricao?: string;
  /** Antífona própria da página. Na falta dela entra o lema do brasão. */
  epigrafe?: string;
}) {
  const { rota } = usarRota();
  const estampa = imagemDaRota(rota);

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
      <h1 className="cabecalho__titulo">{titulo}</h1>
      {descricao && <p className="cabecalho__resumo">{descricao}</p>}
      <p className="cabecalho__lema" lang="la">
        <Estrela />
        {epigrafe ?? site.lema}
        <Estrela />
      </p>
    </header>
  );
}
