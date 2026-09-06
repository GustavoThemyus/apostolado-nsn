import { useEffect, useRef, type ReactNode } from "react";

/**
 * A folha que sobe do rodapé. Era a moldura do Sumário; agora o Menu também
 * usa, para não haver dois padrões de sobreposição no site.
 *
 * Trata o que uma folha modal precisa tratar: fechar no Escape, travar a
 * rolagem de trás, e levar o foco para dentro ao abrir.
 */
export function FolhaDeBaixo({
  aberto,
  aoFechar,
  rotulo,
  children,
}: {
  aberto: boolean;
  aoFechar: () => void;
  rotulo: string;
  children: ReactNode;
}) {
  const painel = useRef<HTMLDivElement>(null);

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

  if (!aberto) return null;

  return (
    <>
      <button
        type="button"
        className="folha-baixo__cortina"
        onClick={aoFechar}
        aria-label={`Fechar ${rotulo.toLowerCase()}`}
      />
      <div
        className="folha-baixo damasco"
        ref={painel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
      >
        <div className="folha-baixo__pega" aria-hidden="true" />
        {children}
      </div>
    </>
  );
}
