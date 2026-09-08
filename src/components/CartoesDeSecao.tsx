import { EM_PREPARACAO, filhasDe } from "../rotas/rotas";
import { Elo } from "../rotas/Elo";
import { Seta } from "./Seta";

/**
 * Os caminhos que saem de uma seção, em cartões.
 *
 * Sem isto, `/missa` prometia no texto \"abaixo, três caminhos\" e não trazia
 * nenhum: o guia só era alcançável pelo Menu, o que o fazia parecer uma
 * página perdida atrás da Missa Tridentina em vez de o destino principal
 * dela. Vale para toda seção com subpáginas, não só para a Missa.
 */
export function CartoesDeSecao({ padrao }: { padrao: string }) {
  const filhas = filhasDe(padrao);
  if (filhas.length === 0) return null;

  return (
    <nav className="cartoes cartoes--secao" aria-label="Nesta seção">
      {filhas.map((rota) => (
        <Elo key={rota.padrao} para={rota.padrao} className="cartao">
          <span className="cartao__titulo">{rota.titulo}</span>
          {rota.descricao && <span className="cartao__texto">{rota.descricao}</span>}
          {EM_PREPARACAO.has(rota.padrao) && (
            <span className="cartao__preparo">Em preparação</span>
          )}
          <span className="cartao__ir">
            Ver
            <Seta className="cartao__seta" />
          </span>
        </Elo>
      ))}
    </nav>
  );
}
