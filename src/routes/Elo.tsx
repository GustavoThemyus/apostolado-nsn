import type { AnchorHTMLAttributes, ReactNode } from "react";
import { usarRota } from "./usarRota";

export function Elo({
  para,
  children,
  exato = false,
  ...resto
}: {
  para: string;
  children: ReactNode;
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
