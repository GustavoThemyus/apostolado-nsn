import { Elo } from "../rotas/Elo";
import { rotaPorPadrao, type Rota } from "../rotas/rotas";

/**
 * Migalhas. É o que faz uma subpágina parecer um lugar dentro do site, em vez
 * de um beco sem saída.
 */
export function Trilha({ rota }: { rota: Rota | null }) {
  if (!rota?.pai) return null;
  const mae = rotaPorPadrao(rota.pai);
  if (!mae) return null;

  return (
    <nav className="trilha" aria-label="Você está em">
      <Elo para="/">Início</Elo>
      <span aria-hidden="true">›</span>
      <Elo para={mae.padrao}>{mae.titulo}</Elo>
      <span aria-hidden="true">›</span>
      <span className="trilha__atual">{rota.titulo}</span>
    </nav>
  );
}
