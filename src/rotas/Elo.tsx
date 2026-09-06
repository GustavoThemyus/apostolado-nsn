import type { AnchorHTMLAttributes, ReactNode } from "react";
import { usarRota } from "./usarRota";

/**
 * Link interno. O clique é capturado pelo Roteador, que ouve o documento
 * inteiro; aqui só marcamos a página atual para o leitor de tela.
 */
export function Elo({
  para,
  children,
  exato = false,
  ...resto
}: {
  para: string;
  children: ReactNode;
  /** Marca como atual só no endereço exato, e não nas subpáginas. */
  exato?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const { caminho } = usarRota();
  const atual = exato
    ? caminho === para
    : caminho === para || (para !== "/" && caminho.startsWith(`${para}/`));

  return (
    <a href={para} aria-current={atual ? "page" : undefined} {...resto}>
      {children}
    </a>
  );
}
