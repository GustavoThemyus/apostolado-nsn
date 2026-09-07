import { useEffect, useRef, type RefObject } from "react";

/**
 * Progresso de leitura, escrito direto no elemento.
 *
 * Não devolve estado de propósito. Guardar a fração em `useState` fazia a
 * página inteira re-renderizar a cada quadro do rolar, e ler `scrollHeight`
 * a cada quadro força o navegador a recalcular layout. Os dois juntos
 * travavam a rolagem.
 *
 * Aqui a altura percorrível é medida uma vez por redimensionamento, e o
 * rolar só escreve um `transform` no elemento apontado pela ref.
 */
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

    // a altura da página muda quando um pedaço de rota termina de carregar
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
