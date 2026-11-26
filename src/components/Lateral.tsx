import type { CSSProperties } from "react";
import { site } from "../data/site";

export function Lateral() {
  const retratos = (site.lateral ?? []).filter((r) => r.imagem);
  if (retratos.length === 0) return null;

  return (
    <aside className="lateral" aria-label="Retratos">
      <div
        className="lateral__pilha"
        style={{ "--retratos": Math.max(retratos.length, 3) } as CSSProperties}
      >
        {retratos.map((r) => (
          <figure className="lateral__retrato" key={r.id}>
            <span className="padroeiro__moldura lateral__moldura">
              <img
                className="lateral__imagem"
                src={r.imagem}
                alt={r.nome}
                width={480}
                height={640}
                loading="lazy"
              />
            </span>
            <figcaption className="lateral__legenda">
              <span className="lateral__titulo">{r.titulo}</span>
              <span className="lateral__nome">{r.nome}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </aside>
  );
}
