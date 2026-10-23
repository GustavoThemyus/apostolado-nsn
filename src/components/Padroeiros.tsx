import type { ReactNode } from "react";
import { porId } from "../data/postagens";
import { Elo } from "../routes/Elo";

export interface Padroeiro {
  id: string;
  nome: string;
  /** Vazio enquanto a imagem não chega. */
  imagem: string;
  /** O que o santo é para o Apostolado: "Co-Padroeira secundária". */
  descricao?: string;
  /** A Titular: a estampa dela é um pouco maior que as dos lados. */
  principal?: boolean;
  /**
   * A postagem com a história do santo, pelo id dela.
   *
   * Confere-se contra a coleção antes de virar link: postagem despublicada
   * ou renomeada deixaria o quadro clicável levando a um 404 — e, como é a
   * estampa inteira que clica, nada na tela avisaria que o destino sumiu.
   * Sem postagem viva, o quadro fica como era, sem link.
   */
  postagem?: string;
}

/**
 * Os três padroeiros, na página inicial.
 *
 * O quadro inteiro é o alvo do clique, e não só o nome: num celular o nome
 * tem dois dedos de largura, e a estampa é o que a pessoa de fato toca.
 */
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
              {/* a moldura é elemento próprio: é ela que leva o filete dourado
                  e a margem de papel, e a estampa fica dentro, sem raio */}
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
