import type { ReactNode } from "react";
import type { Etiqueta as TipoEtiqueta } from "../data/tipos";
import { Etiqueta } from "./Etiqueta";
import { TextoRico } from "./TextoRico";

/** Uma peça da Missa, numerada na ordem em que acontece. */
export function Passo({
  numero,
  etiqueta,
  titulo,
  tituloLatim,
  children,
}: {
  numero: number;
  etiqueta: TipoEtiqueta;
  titulo: string;
  tituloLatim?: string;
  children: ReactNode;
}) {
  return (
    <article className="passo">
      <div className="passo__trilho">
        <span className="passo__numero" aria-hidden="true">
          {numero}
        </span>
        <Etiqueta valor={etiqueta} />
      </div>
      <div className="passo__corpo">
        <h4 className="passo__titulo">
          <span className="apenas-leitores">{`Passo ${numero}. `}</span>
          <TextoRico texto={titulo} />
          {tituloLatim && (
            <>
              {" "}
              <span className="lat" lang="la">
                {tituloLatim}
              </span>
            </>
          )}
        </h4>
        {children}
      </div>
    </article>
  );
}
