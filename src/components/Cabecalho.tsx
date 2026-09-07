import { site } from "../data/site";
import { Brasao } from "./Brasao";
import { Estrela } from "./Estrela";

/**
 * O cabeçalho de toda página, num só formato.
 *
 * Havia duas alturas, e o guia ficava diferente das demais seções. Agora é um
 * modelo só: brasão grande, a chamada do site em versalete dourado, o título em
 * Playfair e um remate embaixo. Onde há epígrafe em latim, ela ocupa o remate;
 * onde não há, entra a estrela entre filetes.
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
  return (
    <header className="cabecalho damasco">
      <Brasao tamanho="cabecalho" />
      <p className="cabecalho__chamada">{site.chamada}</p>
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
