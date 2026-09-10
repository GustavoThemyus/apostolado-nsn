/**
 * Levar a tela até uma âncora, com precisão.
 *
 * O site tem `scroll-behavior: smooth` no `html`, e isso é bom num salto
 * curto. Num salto longo, não: medido num celular de 390px, o Enchiridion tem
 * 104 000px de altura, e o salto do índice analítico até a concessão parava
 * **810px antes do alvo** e ficava lá. Com rolagem instantânea o mesmo salto
 * caía no lugar exato, com erro zero.
 *
 * Por isso a decisão é por distância: perto, animado; longe, direto. É a mesma
 * escolha que o Roteador já fazia ao trocar de página, e pelo mesmo motivo.
 */

/** Acima disto a animação erra o alvo, além de não deixar ler nada no caminho. */
const LONGE = 3000;

/** A folga do topo vem do CSS, para não haver dois números discordando. */
function folgaDoTopo(): number {
  const valor = getComputedStyle(document.documentElement).scrollPaddingTop;
  const n = Number.parseFloat(valor);
  return Number.isFinite(n) ? n : 0;
}

export function rolarAteAncora(destino: Element): void {
  const alvo = window.scrollY + destino.getBoundingClientRect().top - folgaDoTopo();
  const topo = Math.max(0, Math.round(alvo));
  const distancia = Math.abs(topo - window.scrollY);
  window.scrollTo({ top: topo, behavior: distancia > LONGE ? "instant" : "smooth" });
}

/** O elemento de uma âncora `#id`, quando ela existe nesta página. */
export function alvoDaAncora(hash: string): Element | null {
  if (!hash || hash === "#") return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    // hash malformado no endereço: não é motivo para derrubar a navegação
    return null;
  }
}
