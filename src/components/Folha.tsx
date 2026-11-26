import { useEffect, useRef, useState, type ReactNode } from "react";

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
  lado?: "esquerda" | "direita";
  children: ReactNode;
}) {
  const painel = useRef<HTMLDivElement>(null);
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
