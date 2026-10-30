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

/** Em que altura da página o destino fica no lugar certo, sob a folga do topo. */
function alturaDe(destino: Element): number {
  const alvo = window.scrollY + destino.getBoundingClientRect().top - folgaDoTopo();
  return Math.max(0, Math.round(alvo));
}

export function rolarAteAncora(destino: Element): void {
  const topo = alturaDe(destino);
  const distancia = Math.abs(topo - window.scrollY);
  window.scrollTo({ top: topo, behavior: distancia > LONGE ? "instant" : "smooth" });
}

/**
 * A âncora de quem chega de fora, que ainda não está na tela.
 *
 * Numa carga fria — link colado, aba nova, recarregar — o endereço traz a
 * âncora, mas a página é carregada sob demanda e o parágrafo só entra no
 * documento alguns quadros depois. O navegador procura antes, não acha, e
 * fica no alto; o Roteador também. Quem clicava de dentro do site caía no
 * lugar certo, e quem abria o mesmo link do zero caía no começo do
 * Enchiridion, com cem mil pixels pela frente.
 *
 * Esperar o parágrafo aparecer não bastava: ele entra, a tela rola, e então as
 * fontes acabam de carregar e o texto acima reflui. Medido na concessão 33,
 * §1, 5.º, a rolagem caía 983px adiante do alvo; na norma 17 da
 * Indulgentiarum doctrina, 749px atrás. Por isso se corrige de tempos em
 * tempos até a altura parar de mudar, e só então se dá por feito.
 *
 * Sempre instantânea: animar de novo a cada correção seria uma briga entre a
 * animação e a conta, e o leitor veria a página tremer.
 *
 * Por relógio, e não por quadro de desenho: numa aba de fundo o navegador não
 * desenha quadro nenhum, e a espera por `requestAnimationFrame` não começava
 * sequer uma vez — quem abrisse o link numa aba atrás e voltasse depois
 * encontrava a página no alto. Daí também a conta ser de tentativas, e não de
 * relógio: numa aba de fundo o navegador espaça os tempos, e um prazo em
 * milissegundos venceria antes da primeira medida.
 *
 * Esgotadas as tentativas, desiste calado. Um gesto do leitor também encerra a
 * espera — ele já decidiu para onde quer ir, e puxá-lo de volta seria pior do
 * que não rolar.
 */

/** Perto de um quadro de desenho, numa tela à vista. */
const PAUSA = 16;
/** Pouco mais de dois segundos de página visível. */
const TENTATIVAS = 140;
/** Medidas iguais seguidas: a página parou de reflui­r e o alvo é este mesmo. */
const MEDIDAS_IGUAIS = 5;

export function rolarQuandoAparecer(hash: string, tentativas = TENTATIVAS): () => void {
  let vivo = true;
  let iguais = 0;
  // a altura medida da vez anterior, e não a rolagem de fato: num destino
  // perto do fim da página a rolagem para antes do alvo e nunca o alcança
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
