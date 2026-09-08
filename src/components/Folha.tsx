import { useEffect, useRef, type ReactNode } from "react";

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
        className="folha__cortina"
        onClick={aoFechar}
        aria-label={`Fechar ${rotulo.toLowerCase()}`}
      />
      <div
        className={`folha folha--${lado} damasco`}
        ref={painel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={rotulo}
      >
        <div className="folha__pega" aria-hidden="true" />
        {children}
      </div>
    </>
  );
}
