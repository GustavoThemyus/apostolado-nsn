import type { CSSProperties } from "react";
import { site } from "../data/site";

/**
 * Os retratos na lateral das páginas: o Soberano Pontífice, o Arcebispo
 * Metropolitano e a Padroeira. Pedido do Perez, só para o computador.
 *
 * Fica fora da página inicial, que já tem os padroeiros no corpo, e some
 * abaixo de 90rem: é ali que a coluna de texto começaria a ser espremida para
 * dar lugar a ela, e as orações lado a lado do Enchiridion deixariam de caber.
 * Quem decide isso é o CSS, e não este componente — sem piscar na primeira
 * pintura.
 */
export function Lateral() {
  const retratos = (site.lateral ?? []).filter((r) => r.imagem);
  if (retratos.length === 0) return null;

  return (
    <aside className="lateral" aria-label="Retratos">
      {/* quantos são decide a altura de cada um: todos têm de caber na janela */}
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
