import type { ReactNode } from "react";
import { Elo } from "../rotas/Elo";
import { Brasao } from "./Brasao";

/**
 * A barra fixa. O progresso só aparece em documento longo: régua marcando
 * 100% numa página de dois parágrafos é ruído.
 */
export function BarraSuperior({
  marca,
  local,
  progresso,
  children,
}: {
  marca: string;
  local: string;
  progresso?: number;
  children: ReactNode;
}) {
  return (
    <div className="barra">
      <div className="moldura barra__interior">
        <Elo para="/" className="barra__marca" aria-label="Início">
          <Brasao tamanho="barra" />
          <span className="barra__letreiro">{marca}</span>
        </Elo>
        <span className="barra__local">{local}</span>
        <nav className="barra__secoes" aria-label="Menu">
          {children}
        </nav>
      </div>
      {progresso !== undefined && (
        <div
          className="barra__progresso"
          style={{ transform: `scaleX(${progresso})` }}
          role="progressbar"
          aria-label="Progresso da leitura"
          aria-valuenow={Math.round(progresso * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}
    </div>
  );
}
