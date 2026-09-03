import { useEffect, useRef } from "react";
import type { Secao } from "../data/tipos";

interface Propriedades {
  secoes: Secao[];
  secaoAtiva: string | null;
  variante: "embutido" | "flutuante";
  aberto?: boolean;
  aoFechar?: () => void;
}

export function Sumario({ secoes, secaoAtiva, variante, aberto = true, aoFechar }: Propriedades) {
  const flutuante = variante === "flutuante";
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flutuante || !aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar?.();
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.classList.add("sem-rolagem");
    painel.current?.focus();

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.classList.remove("sem-rolagem");
    };
  }, [flutuante, aberto, aoFechar]);

  if (flutuante && !aberto) return null;

  return (
    <>
      {flutuante && (
        <button
          type="button"
          className="sumario__cortina"
          onClick={aoFechar}
          aria-label="Fechar o sumário"
        />
      )}
      <nav
        className={`sumario sumario--${variante}`}
        aria-label="Sumário do guia"
        id={flutuante ? undefined : "sumario"}
      >
        <div
          className={flutuante ? "sumario__painel damasco" : "sumario__painel"}
          ref={painel}
          tabIndex={flutuante ? -1 : undefined}
          role={flutuante ? "dialog" : undefined}
          aria-modal={flutuante ? true : undefined}
          aria-label={flutuante ? "Sumário do guia" : undefined}
        >
          {flutuante && <div className="sumario__pega" aria-hidden="true" />}
          <p className="sumario__titulo">Neste guia</p>
          <ol className="sumario__lista">
            {secoes.map((secao) => (
              <li key={secao.id}>
                <a
                  className="sumario__link"
                  href={`#${secao.id}`}
                  aria-current={secaoAtiva === secao.id ? "true" : undefined}
                  onClick={aoFechar}
                >
                  {secao.titulo}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
