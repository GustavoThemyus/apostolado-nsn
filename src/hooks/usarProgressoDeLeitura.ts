import { useEffect, useRef, type RefObject } from "react";

export function usarProgressoDeLeitura(ativo: boolean): RefObject<HTMLDivElement> {
  const alvo = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ativo) return;

    let percorrivel = 0;
    let pendente = 0;

    const medirAltura = () => {
      percorrivel = document.documentElement.scrollHeight - window.innerHeight;
    };

    const pintar = () => {
      pendente = 0;
      const el = alvo.current;
      if (!el) return;
      const fracao = percorrivel > 0 ? Math.min(1, window.scrollY / percorrivel) : 0;
      el.style.transform = `scaleX(${fracao})`;
      el.setAttribute("aria-valuenow", String(Math.round(fracao * 100)));
    };

    const aoRolar = () => {
      if (pendente === 0) pendente = window.requestAnimationFrame(pintar);
    };

    const aoRedimensionar = () => {
      medirAltura();
      aoRolar();
    };

    medirAltura();
    pintar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRedimensionar);

    const observador = new ResizeObserver(medirAltura);
    observador.observe(document.documentElement);

    return () => {
      if (pendente) window.cancelAnimationFrame(pendente);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRedimensionar);
      observador.disconnect();
    };
  }, [ativo]);

  return alvo;
}
