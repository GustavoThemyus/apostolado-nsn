import type { ReactNode } from "react";
import { Brasao } from "./Brasao";

export function BarraSuperior({
  marca,
  local,
  progresso,
  children,
}: {
  marca: string;
  local: string;
  progresso: number;
  children: ReactNode;
}) {
  return (
    <div className="barra">
      <div className="moldura barra__interior">
        <span className="barra__marca">
          <Brasao tamanho="barra" />
          <span className="barra__letreiro">{marca}</span>
        </span>
        <span className="barra__local">{local}</span>
        {children}
      </div>
      <div
        className="barra__progresso"
        style={{ transform: `scaleX(${progresso})` }}
        role="progressbar"
        aria-label="Progresso da leitura"
        aria-valuenow={Math.round(progresso * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
