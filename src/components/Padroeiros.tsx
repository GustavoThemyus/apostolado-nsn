import type { ReactNode } from "react";
import { porId } from "../data/postagens";
import { Elo } from "../routes/Elo";

export interface Padroeiro {
  id: string;
  nome: string;
  imagem: string;
  descricao?: string;
  principal?: boolean;
  postagem?: string;
}

export function Padroeiros({ padroeiros }: { padroeiros: Padroeiro[] }) {
  return (
    <section className="padroeiros" aria-labelledby="padroeiros-titulo">
      <h2 className="padroeiros__titulo" id="padroeiros-titulo">
        Os nossos padroeiros
      </h2>
      <ul className="padroeiros__lista">
        {padroeiros.map((p) => {
          const temHistoria = p.postagem !== undefined && porId(p.postagem) !== undefined;

          const corpo: ReactNode = (
            <>
              <span className="padroeiro__moldura">
                {p.imagem ? (
                  <img
                    className="padroeiro__imagem"
                    src={p.imagem}
                    alt={p.nome}
                    width={480}
                    height={640}
                    loading="lazy"
                  />
                ) : (
                  <span className="padroeiro__imagem padroeiro__falta" aria-hidden="true" />
                )}
              </span>
              <span className="padroeiro__nome">{p.nome}</span>
              {p.descricao && <span className="padroeiro__descricao">{p.descricao}</span>}
            </>
          );

          return (
            <li
              className={`padroeiro${p.principal ? " padroeiro--principal" : ""}`}
              key={p.id}
            >
              {temHistoria ? (
                <Elo para={`/postagens/${p.postagem}`} className="padroeiro__elo">
                  {corpo}
                </Elo>
              ) : (
                corpo
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
