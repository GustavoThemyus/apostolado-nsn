import { useEffect, useState } from "react";

/** Devolve o id da seção que está sendo lida no momento. */
export function usarSecaoAtiva(ids: string[]): string | null {
  const [ativa, definirAtiva] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const alvos = ids
      .map((id) => document.getElementById(id))
      .filter((elemento): elemento is HTMLElement => elemento !== null);

    if (alvos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visiveis[0]) definirAtiva(visiveis[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    alvos.forEach((alvo) => observador.observe(alvo));
    return () => observador.disconnect();
  }, [ids]);

  return ativa;
}
