const LONGE = 3000;

function folgaDoTopo(): number {
  const valor = getComputedStyle(document.documentElement).scrollPaddingTop;
  const n = Number.parseFloat(valor);
  return Number.isFinite(n) ? n : 0;
}

function alturaDe(destino: Element): number {
  const alvo = window.scrollY + destino.getBoundingClientRect().top - folgaDoTopo();
  return Math.max(0, Math.round(alvo));
}

export function rolarAteAncora(destino: Element): void {
  const topo = alturaDe(destino);
  const distancia = Math.abs(topo - window.scrollY);
  window.scrollTo({ top: topo, behavior: distancia > LONGE ? "instant" : "smooth" });
}

const PAUSA = 16;
const TENTATIVAS = 140;
const MEDIDAS_IGUAIS = 5;

export function rolarQuandoAparecer(hash: string, tentativas = TENTATIVAS): () => void {
  let vivo = true;
  let iguais = 0;
  let anterior = -1;
  let relogio = 0;

  const desistir = () => {
    vivo = false;
    window.clearTimeout(relogio);
  };
  const gestos = ["wheel", "touchmove", "keydown"] as const;
  for (const g of gestos) window.addEventListener(g, desistir, { once: true, passive: true });

  const procurar = () => {
    if (!vivo) return;
    const destino = alvoDaAncora(hash);
    if (destino) {
      const topo = alturaDe(destino);
      iguais = topo === anterior ? iguais + 1 : 0;
      anterior = topo;
      window.scrollTo({ top: topo, behavior: "instant" });
      if (iguais >= MEDIDAS_IGUAIS) return desistir();
    }
    if ((tentativas -= 1) > 0) relogio = window.setTimeout(procurar, PAUSA);
  };
  relogio = window.setTimeout(procurar, PAUSA);

  return () => {
    desistir();
    for (const g of gestos) window.removeEventListener(g, desistir);
  };
}

export function alvoDaAncora(hash: string): Element | null {
  if (!hash || hash === "#") return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}
