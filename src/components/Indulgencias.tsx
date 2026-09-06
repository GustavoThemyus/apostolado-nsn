import { useEffect } from "react";
import bruto from "../data/indulgencias.json";
import type { Secao } from "../data/tipos";
import { ListaDeBlocos } from "./Bloco";

interface Folheto {
  titulo: string;
  descricao: string;
  secoes: Secao[];
}

const folheto = bruto as unknown as Folheto;

/** Seção das indulgências, em tela cheia, como o calendário. */
export function Indulgencias({ aoFechar }: { aoFechar: () => void }) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.classList.add("sem-rolagem");
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.classList.remove("sem-rolagem");
    };
  }, [aoFechar]);

  return (
    <div className="folha" role="dialog" aria-modal="true" aria-label={folheto.titulo}>
      <div className="folha__barra">
        <p className="folha__titulo">{folheto.titulo}</p>
        <button type="button" className="barra__botao" onClick={aoFechar}>
          Fechar
        </button>
      </div>
      <div className="folha__corpo">
        <p className="folha__descricao">{folheto.descricao}</p>
        {folheto.secoes.map((s, indice) => (
          <section className="secao" key={s.id}>
            <h2 className="secao__titulo">
              <span className="secao__numero" aria-hidden="true">{indice + 1}</span>
              {s.titulo}
            </h2>
            {s.resumo && <p className="secao__resumo">{s.resumo}</p>}
            <ListaDeBlocos blocos={s.blocos} />
          </section>
        ))}
      </div>
    </div>
  );
}
