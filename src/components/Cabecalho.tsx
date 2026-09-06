import { site } from "../data/site";
import { Brasao } from "./Brasao";
import { Estrela } from "./Estrela";

/**
 * O cabeçalho de toda página.
 *
 * Há duas alturas, mas uma só identidade: o damasco, o brasão e a chamada em
 * dourado aparecem em todas as páginas. Antes só o guia os tinha, e as outras
 * pareciam de outro site.
 *
 * `capa` é a versão alta, com brasão grande e epígrafe, para o início e para
 * o guia. `pagina` é a mesma coisa reduzida, para as demais.
 */
export function Cabecalho({
  titulo,
  descricao,
  chamada,
  epigrafe,
  variante = "pagina",
}: {
  titulo: string;
  descricao?: string;
  /** Sobre o título, em versalete dourado. O padrão é o nome do apostolado. */
  chamada?: string;
  /** Só na capa: a antífona em latim, ladeada de estrelas. */
  epigrafe?: string;
  variante?: "capa" | "pagina";
}) {
  const capa = variante === "capa";

  return (
    <header className={`cabecalho cabecalho--${variante} damasco`}>
      <Brasao tamanho={capa ? "cabecalho" : "pagina"} />
      <p className="cabecalho__chamada">{chamada ?? site.marca}</p>
      <h1 className="cabecalho__titulo">{titulo}</h1>
      {descricao && <p className="cabecalho__resumo">{descricao}</p>}
      {capa && epigrafe && (
        <p className="cabecalho__lema" lang="la">
          <Estrela />
          {epigrafe}
          <Estrela />
        </p>
      )}
      {!capa && (
        <p className="filete" aria-hidden="true">
          <Estrela />
        </p>
      )}
    </header>
  );
}
