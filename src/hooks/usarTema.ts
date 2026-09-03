import { useCallback, useEffect, useState } from "react";

export type Tema = "sistema" | "claro" | "escuro";

const CHAVE = "nsn:tema";
const CICLO: Tema[] = ["sistema", "claro", "escuro"];

export const ROTULO_DO_TEMA: Record<Tema, string> = {
  sistema: "Sistema",
  claro: "Claro",
  escuro: "Escuro",
};

function ler(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === "claro" || salvo === "escuro" || salvo === "sistema") return salvo;
  } catch {
    /* armazenamento indisponível: fica no padrão do sistema */
  }
  return "sistema";
}

/** Tema de leitura, lembrado entre visitas. */
export function usarTema() {
  const [tema, definirTema] = useState<Tema>(ler);

  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === "sistema") {
      raiz.removeAttribute("data-theme");
    } else {
      raiz.setAttribute("data-theme", tema === "claro" ? "light" : "dark");
    }
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
      /* sem persistência nesta sessão */
    }
  }, [tema]);

  const alternar = useCallback(() => {
    definirTema((atual) => CICLO[(CICLO.indexOf(atual) + 1) % CICLO.length]);
  }, []);

  return { tema, definirTema, alternar };
}
