import { useEffect, useRef, useState } from "react";
import { dataPorExtenso, publicadas } from "../data/postagens";
import { Elo } from "../routes/Elo";
import { Seta } from "./Seta";

const QUANTAS = 5;
const INTERVALO = 6000;

export function UltimasPostagens() {
  const postagens = publicadas().slice(0, QUANTAS);
  const faixa = useRef<HTMLUListElement | null>(null);
  const [atual, definirAtual] = useState(0);
  const [pausado, definirPausado] = useState(false);

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
        const distancia = Math.abs(
          item.offsetLeft - alvo.offsetLeft - alvo.scrollLeft,
        );
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
    alvo.scrollTo({
      left: item.offsetLeft - alvo.offsetLeft,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (postagens.length < 2 || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const relogio = window.setInterval(() => {
      if (document.hidden) return;
      const alvo = faixa.current;
      const item = alvo?.children[(atual + 1) % postagens.length] as
        | HTMLElement
        | undefined;
      if (!alvo || !item) return;

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
                <span className="postagem-cartao__data">
                  {dataPorExtenso(p.data)}
                </span>
                <span className="postagem-cartao__titulo">{p.titulo}</span>
                <span className="postagem-cartao__resumo">{p.resumo}</span>
                {p.rascunho && (
                  <span className="cartao__preparo">Rascunho</span>
                )}
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
