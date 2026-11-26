import { createContext, useContext, type ReactNode } from "react";
import type { Secao } from "../data/tipos";
import { subsecoesDe } from "../data/subsecoes";

const Contexto = createContext<Secao[]>([]);

export function ProvedorDeSecoes({
  secoes,
  children,
}: {
  secoes: Secao[];
  children: ReactNode;
}) {
  return <Contexto.Provider value={secoes}>{children}</Contexto.Provider>;
}

export function IndiceDoDocumento() {
  const secoes = useContext(Contexto);
  if (secoes.length === 0) return null;

  return (
    <nav className="indice-completo" aria-label="Índice do documento">
      <ol className="indice-completo__lista">
        {secoes.map((secao) => {
          const subsecoes = subsecoesDe(secao);
          return (
            <li key={secao.id}>
              <a className="indice-completo__link" href={`#${secao.id}`}>
                {secao.titulo}
              </a>
              {subsecoes.length > 0 && (
                <ul className="indice-completo__sublista">
                  {subsecoes.map((sub) => (
                    <li key={sub.id}>
                      <a className="indice-completo__sublink" href={`#${sub.id}`}>
                        {sub.titulo}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
