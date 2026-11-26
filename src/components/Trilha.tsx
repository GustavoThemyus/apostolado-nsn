import { Elo } from "../routes/Elo";
import { rotaPorPadrao, type Rota } from "../routes/rotas";

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
