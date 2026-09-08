import { useEffect, useRef, useState } from "react";
import { dataPorExtenso, publicadas } from "../data/postagens";
import { Elo } from "../rotas/Elo";
import { Seta } from "./Seta";

/** O PDF pede as cinco mais recentes. */
const QUANTAS = 5;
/** Quanto cada slide fica parado antes de o próximo entrar. */
const INTERVALO = 6000;

/**
 * A faixa das últimas postagens na página inicial.
 *
 * O Perez pediu slides passando sozinhos. Passam, mas com freio: param sob o
 * cursor, param quando o foco entra na faixa, param quando o dedo a arrasta e
 * param com a aba em segundo plano. Quem pede movimento reduzido no sistema
 * não vê nada se mexer. Não há botão de pausa: quem quiser parar para ler
 * encosta na faixa, e é isso que o freio de ponteiro e de foco cobre.
 *
 * A rolagem é do próprio navegador, com scroll-snap: funciona no dedo e no
 * teclado, e não depende do JavaScript para ser navegável.
 */
export function UltimasPostagens() {
  const postagens = publicadas().slice(0, QUANTAS);
  const faixa = useRef<HTMLUListElement | null>(null);
  const [atual, definirAtual] = useState(0);
  const [pausado, definirPausado] = useState(false);

  /*
   * Qual cartão está à frente, medido da posição da rolagem.
   *
   * Um IntersectionObserver não serve aqui: ele entrega só as entradas que
   * *mudaram*, e em tela larga cabem dois cartões e meio, então o cartão do
   * meio continua visível de um passo para o outro e nunca aparece no lote.
   * O ponto aceso pulava um.
   */
  useEffect(() => {
    const alvo = faixa.current;
    if (!alvo) return;
    let pendente = 0;

    const medir = () => {
      pendente = 0;
      let melhor = 0;
      let menor = Infinity;
      for (let i = 0; i < alvo.children.length; i++) {
        const item = alvo.children[i] as HTMLElement;
        const distancia = Math.abs(item.offsetLeft - alvo.offsetLeft - alvo.scrollLeft);
        if (distancia < menor) {
          menor = distancia;
          melhor = i;
        }
      }
      definirAtual(melhor);
    };

    const aoRolar = () => {
      if (pendente === 0) pendente = window.requestAnimationFrame(medir);
    };

    medir();
    alvo.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      if (pendente) window.cancelAnimationFrame(pendente);
      alvo.removeEventListener("scroll", aoRolar);
    };
  }, [postagens.length]);

  const irPara = (i: number) => {
    const alvo = faixa.current;
    const item = alvo?.children[i] as HTMLElement | undefined;
    if (!alvo || !item) return;
    alvo.scrollTo({ left: item.offsetLeft - alvo.offsetLeft, behavior: "smooth" });
  };

  // o avanço automático
  useEffect(() => {
    if (postagens.length < 2 || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const relogio = window.setInterval(() => {
      if (document.hidden) return;
      const alvo = faixa.current;
      const item = alvo?.children[(atual + 1) % postagens.length] as HTMLElement | undefined;
      if (!alvo || !item) return;

      /*
       * Em tela larga cabem quase todos os cartões, então a faixa tem pouco
       * curso e os últimos destinos caem todos no mesmo fim. Quando o próximo
       * destino não anda, a volta é ao começo: senão a faixa parava encostada
       * na direita e nunca dava a volta.
       */
      const fim = alvo.scrollWidth - alvo.clientWidth;
      const destino = Math.min(item.offsetLeft - alvo.offsetLeft, fim);
      alvo.scrollTo({
        left: destino <= alvo.scrollLeft + 1 ? 0 : destino,
        behavior: "smooth",
      });
    }, INTERVALO);
    return () => window.clearInterval(relogio);
  }, [atual, pausado, postagens.length]);

  if (postagens.length === 0) return null;

  return (
    <section
      className="faixa"
      aria-labelledby="faixa-titulo"
      aria-roledescription="carrossel"
      onMouseEnter={() => definirPausado(true)}
      onMouseLeave={() => definirPausado(false)}
      onFocusCapture={() => definirPausado(true)}
      onBlurCapture={() => definirPausado(false)}
      onPointerDown={() => definirPausado(true)}
    >
      <div className="faixa__topo">
        <h2 className="faixa__titulo" id="faixa-titulo">
          Últimas postagens
        </h2>
        <Elo para="/postagens" className="faixa__todas">
          Ver todas
        </Elo>
      </div>

      <ul className="faixa__trilho" ref={faixa}>
        {postagens.map((p, i) => (
          <li
            className="faixa__item"
            key={p.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${postagens.length}`}
          >
            <Elo para={`/postagens/${p.id}`} className="postagem-cartao">
              {p.imagem ? (
                <img
                  className="postagem-cartao__imagem"
                  src={p.imagem}
                  alt=""
                  width={480}
                  height={640}
                  loading="lazy"
                />
              ) : (
                <span className="postagem-cartao__imagem postagem-cartao__imagem--falta" />
              )}
              <span className="postagem-cartao__corpo">
                <span className="postagem-cartao__data">{dataPorExtenso(p.data)}</span>
                <span className="postagem-cartao__titulo">{p.titulo}</span>
                <span className="postagem-cartao__resumo">{p.resumo}</span>
                {p.rascunho && <span className="cartao__preparo">Rascunho</span>}
                <span className="cartao__ir">
                  Ler
                  <Seta className="cartao__seta" />
                </span>
              </span>
            </Elo>
          </li>
        ))}
      </ul>

      {postagens.length > 1 && (
        <div className="faixa__controles">
          <ul className="faixa__pontos">
            {postagens.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`faixa__ponto${i === atual ? " faixa__ponto--atual" : ""}`}
                  onClick={() => irPara(i)}
                  aria-label={`Ir para ${p.titulo}`}
                  aria-current={i === atual ? "true" : undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
