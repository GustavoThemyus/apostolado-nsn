import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Bloco, Secao } from "../data/tipos";

/**
 * Numeração dos passos da Missa.
 *
 * Os números correm de 1 a 55 **continuamente através das seções**, então não
 * dá para cada seção contar sozinha. E guardar o número no dado, como era
 * antes, fazia inserir um passo no meio exigir reescrever todos os seguintes
 * à mão. Aqui ele é derivado da posição, uma vez por documento.
 */

const Contexto = createContext<Map<string, number>>(new Map());

/** Percorre o documento em ordem e numera cada passo encontrado. */
export function numerarPassos(secoes: Secao[]): Map<string, number> {
  const numeros = new Map<string, number>();
  let n = 0;

  const andar = (blocos: Bloco[]) => {
    for (const b of blocos) {
      if (b.tipo === "passo") {
        n += 1;
        if (b.id) numeros.set(b.id, n);
        andar(b.corpo);
      }
    }
  };

  for (const s of secoes) andar(s.blocos);
  return numeros;
}

export function ProvedorDeNumeracao({
  secoes,
  children,
}: {
  secoes: Secao[];
  children: ReactNode;
}) {
  const numeros = useMemo(() => numerarPassos(secoes), [secoes]);
  return <Contexto.Provider value={numeros}>{children}</Contexto.Provider>;
}

export function usarNumeroDoPasso(id: string | undefined): number | undefined {
  const numeros = useContext(Contexto);
  return id ? numeros.get(id) : undefined;
}
