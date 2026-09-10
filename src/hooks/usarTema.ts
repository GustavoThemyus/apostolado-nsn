import { useCallback, useEffect, useState } from "react";

export type Tema = "sistema" | "claro" | "escuro";

const CHAVE = "nsn:tema";

/**
 * O site nasce escuro. É como ele é apresentado.
 *
 * O ciclo começa no escuro pela mesma razão: o primeiro toque no botão tem de
 * sair do padrão, e não voltar a ele.
 */
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
    /* armazenamento indisponível: fica no padrão */
  }
  return PADRAO;
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
    /*
     * A cor da barra do navegador acompanha. Com o padrão escuro, deixá-la
     * atrelada só a `prefers-color-scheme` dava barra creme sobre página
     * escura em quem tem o aparelho no claro.
     */
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
      /* sem persistência nesta sessão */
    }
  }, [tema]);

  const alternar = useCallback(() => {
    definirTema((atual) => CICLO[(CICLO.indexOf(atual) + 1) % CICLO.length]);
  }, []);

  return { tema, definirTema, alternar };
}
