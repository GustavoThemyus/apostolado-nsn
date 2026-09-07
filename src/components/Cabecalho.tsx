import { site } from "../data/site";
import { chamadaDaRota } from "../rotas/rotas";
import { usarRota } from "../rotas/usarRota";
import { Brasao } from "./Brasao";
import { Estrela } from "./Estrela";

/**
 * O cabeçalho de toda página, num só formato.
 *
 * Havia duas alturas, e o guia ficava diferente das demais seções. Agora é um
 * modelo só: brasão grande, chamada em versalete dourado, o título em Playfair
 * e um remate embaixo. Onde há epígrafe em latim, ela ocupa o remate; onde não
 * há, entra a estrela entre filetes.
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
  /** Antífona em latim, ladeada de estrelas, no lugar do remate. */
  epigrafe?: string;
}) {
  const { rota } = usarRota();

  return (
    <header className="cabecalho damasco">
      <Brasao tamanho="cabecalho" />
      <p className="cabecalho__chamada">{chamadaDaRota(rota) ?? site.chamada}</p>
      <h1 className="cabecalho__titulo">{titulo}</h1>
      {descricao && <p className="cabecalho__resumo">{descricao}</p>}
      {epigrafe ? (
        <p className="cabecalho__lema" lang="la">
          <Estrela />
          {epigrafe}
          <Estrela />
        </p>
      ) : (
        <p className="filete" aria-hidden="true">
          <Estrela />
        </p>
      )}
    </header>
  );
}
