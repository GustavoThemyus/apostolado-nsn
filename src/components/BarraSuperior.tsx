import type { ReactNode, RefObject } from "react";
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
  /** Ref do elemento da régua. Ausente esconde a régua. */
  progresso?: RefObject<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <div className="barra">
      <div className="moldura barra__interior">
        <Elo para="/" className="barra__marca" aria-label={marca}>
          <Brasao tamanho="barra" />
          <span className="barra__letreiro">{marca}</span>
        </Elo>
        <span className="barra__local">{local}</span>
        <nav className="barra__secoes" aria-label="Menu">
          {children}
        </nav>
      </div>
      {progresso && (
        <div
          className="barra__progresso"
          ref={progresso}
          style={{ transform: "scaleX(0)" }}
          role="progressbar"
          aria-label="Progresso da leitura"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}
    </div>
  );
}
