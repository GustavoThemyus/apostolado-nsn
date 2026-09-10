import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A folha que cobre a página: sobe do rodapé no celular e entra pela esquerda
 * no PC, com a mesma marcação e só o CSS mudando no ponto de quebra.
 *
 * No PC ela era uma tira centrada presa embaixo, que numa tela larga fica
 * longe do botão que a abriu e longe da vista. Barra lateral nasce ao lado do
 * próprio botão que a abre, e por isso o lado é prop: o Menu fica à esquerda,
 * o Sumário à direita.
 *
 * Trata o que uma folha modal precisa tratar: fechar no Escape, travar a
 * rolagem de trás, e levar o foco para dentro ao abrir.
 *
 * Ela continua montada enquanto sai. Sem isso a gaveta entrava deslizando e
 * desaparecia de um quadro para o outro, e a saída sem animação faz parecer
 * que alguma coisa quebrou, não que fechou.
 */
export function Folha({
  aberto,
  aoFechar,
  rotulo,
  lado = "esquerda",
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  rotulo: string;
  /** De que borda ela entra no PC. O botão que a abre tem de estar do mesmo. */
  lado?: "esquerda" | "direita";
  children: ReactNode;
}) {
  const painel = useRef<HTMLDivElement>(null);
  // montada cobre a saída: fica de pé até a animação de fechar terminar
  const [montada, definirMontada] = useState(aberto);
  const [saindo, definirSaindo] = useState(false);

  useEffect(() => {
    if (aberto) {
      definirMontada(true);
      definirSaindo(false);
      return;
    }
    if (!montada) return;
    definirSaindo(true);
    /*
     * O desmonte vem do onAnimationEnd; este relógio é a rede para quando o
     * evento não chega: aba em segundo plano, ou movimento reduzido, em que a
     * animação dura 0,01ms e pode terminar antes de o ouvinte existir.
     */
    const relogio = window.setTimeout(() => {
      definirMontada(false);
      definirSaindo(false);
    }, 260);
    return () => window.clearTimeout(relogio);
  }, [aberto, montada]);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.classList.add("sem-rolagem");
    painel.current?.focus();

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.classList.remove("sem-rolagem");
    };
  }, [aberto, aoFechar]);

  if (!montada) return null;

  return (
    <>
      <button
        type="button"
        className={`folha__cortina${saindo ? " folha__cortina--saindo" : ""}`}
        onClick={aoFechar}
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        className={`folha folha--${lado} damasco${saindo ? " folha--saindo" : ""}`}
        ref={painel}
        onAnimationEnd={() => {
          if (!saindo) return;
          definirMontada(false);
          definirSaindo(false);
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
      >
        {/*
          Fechar só clicando fora não é uma função visível: quem abriu a
          gaveta no celular não tem como saber que aquilo fecha, nem onde
          tocar. O botão diz.
        */}
        <button type="button" className="folha__fechar" onClick={aoFechar}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
          <span className="apenas-leitores">{`Fechar ${rotulo.toLowerCase()}`}</span>
        </button>
        <div className="folha__pega" aria-hidden="true" />
        {children}
      </div>
    </>
  );
}
