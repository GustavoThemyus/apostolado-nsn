import { useEffect, useState } from "react";

/** Fração já rolada da página, de 0 a 1. */
export function usarProgressoDeLeitura(): number {
  const [progresso, definirProgresso] = useState(0);

  useEffect(() => {
    let pendente = 0;

    const medir = () => {
      pendente = 0;
      const percorrivel = document.documentElement.scrollHeight - window.innerHeight;
      definirProgresso(percorrivel > 0 ? Math.min(1, window.scrollY / percorrivel) : 0);
    };

    const aoRolar = () => {
      if (pendente === 0) pendente = window.requestAnimationFrame(medir);
    };

    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      if (pendente) window.cancelAnimationFrame(pendente);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, []);

  return progresso;
}
