import { useCallback, useEffect, useState } from "react";

export type Tema = "sistema" | "claro" | "escuro";

const CHAVE = "nsn:tema";

const PADRAO: Tema = "escuro";
const CICLO: Tema[] = ["escuro", "claro", "sistema"];

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
  }
  return PADRAO;
}

export function usarTema() {
  const [tema, definirTema] = useState<Tema>(ler);

  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === "sistema") {
      raiz.removeAttribute("data-theme");
    } else {
      raiz.setAttribute("data-theme", tema === "claro" ? "light" : "dark");
    }
    const claro =
      tema === "claro" ||
      (tema === "sistema" &&
        !window.matchMedia("(prefers-color-scheme: dark)").matches);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", claro ? "#f0ece1" : "#181821");
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
    }
  }, [tema]);

  const alternar = useCallback(() => {
    definirTema((atual) => CICLO[(CICLO.indexOf(atual) + 1) % CICLO.length]);
  }, []);

  return { tema, definirTema, alternar };
}
