import { Elo } from "../routes/Elo";
import { rotaPorPadrao, type Rota } from "../routes/rotas";

/**
 * Migalhas. É o que faz uma subpágina parecer um lugar dentro do site, em vez
 * de um beco sem saída.
 *
 * `atual` existe por causa das rotas com parâmetro: o título de /postagens/:id
 * na tabela é o genérico "Postagem", e a migalha dizia isso em vez do nome da
 * postagem aberta.
 */
export function Trilha({ rota, atual }: { rota: Rota | null; atual?: string }) {
  if (!rota?.pai) return null;
  const mae = rotaPorPadrao(rota.pai);
  if (!mae) return null;

  return (
    <nav className="trilha" aria-label="Você está em">
      <Elo para="/">Início</Elo>
      <span aria-hidden="true">›</span>
      <Elo para={mae.padrao}>{mae.titulo}</Elo>
      <span aria-hidden="true">›</span>
      <span className="trilha__atual">{atual ?? rota.titulo}</span>
    </nav>
  );
}
