import { useState } from "react";
import type { Secao } from "../data/tipos";
import { subsecoesDe } from "../data/subsecoes";
import { Folha } from "./Folha";

interface Propriedades {
  secoes: Secao[];
  secaoAtiva: string | null;
  variante: "embutido" | "flutuante";
  aberto?: boolean;
  aoFechar?: () => void;
}

/** A setinha que abre as subseções. */
function Seta({ aberta }: { aberta: boolean }) {
  return (
    <svg
      className={`sumario__seta${aberta ? " sumario__seta--aberta" : ""}`}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Uma entrada do sumário.
 *
 * O título e a setinha são dois controles separados de propósito: pôr um link
 * dentro de um `<summary>` faz o clique navegar e dobrar ao mesmo tempo, e aí
 * não há como abrir a lista sem sair da página.
 */
function Entrada({
  secao,
  secaoAtiva,
  aoEscolher,
}: {
  secao: Secao;
  secaoAtiva: string | null;
  aoEscolher?: () => void;
}) {
  const subsecoes = subsecoesDe(secao);
  const ativa = secaoAtiva === secao.id;
  // aberta por escolha de quem lê; sem escolha, a que está sendo lida
  const [escolha, definirEscolha] = useState<boolean | null>(null);
  const aberta = escolha ?? ativa;
  const listaId = `sub-${secao.id}`;

  return (
    <li className={subsecoes.length > 0 ? "sumario__ramo" : undefined}>
      <div className="sumario__linha">
        {/* âncora de verdade: o Roteador não intercepta href que começa com # */}
        <a
          className="sumario__link"
          href={`#${secao.id}`}
          aria-current={ativa ? "true" : undefined}
          onClick={aoEscolher}
        >
          {secao.titulo}
        </a>
        {subsecoes.length > 0 && (
          <button
            type="button"
            className="sumario__abrir"
            aria-expanded={aberta}
            aria-controls={listaId}
            aria-label={`${aberta ? "Fechar" : "Abrir"} as partes de ${secao.titulo}`}
            onClick={() => definirEscolha(!aberta)}
          >
            <Seta aberta={aberta} />
          </button>
        )}
      </div>

      {subsecoes.length > 0 && (
        <ul className="sumario__sublista" id={listaId} hidden={!aberta}>
          {subsecoes.map((sub) => (
            <li key={sub.id}>
              <a className="sumario__sublink" href={`#${sub.id}`} onClick={aoEscolher}>
                {sub.titulo}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** A lista de seções, que é o mesmo conteúdo nas duas variantes. */
function Lista({
  secoes,
  secaoAtiva,
  aoEscolher,
}: {
  secoes: Secao[];
  secaoAtiva: string | null;
  aoEscolher?: () => void;
}) {
  return (
    <>
      <p className="sumario__titulo">Nesta página</p>
      <ol className="sumario__lista">
        {secoes.map((secao) => (
          <Entrada
            secao={secao}
            secaoAtiva={secaoAtiva}
            aoEscolher={aoEscolher}
            key={secao.id}
          />
        ))}
      </ol>
    </>
  );
}

export function Sumario({ secoes, secaoAtiva, variante, aberto = true, aoFechar }: Propriedades) {
  if (variante === "flutuante") {
    return (
      <Folha aberto={aberto} aoFechar={aoFechar ?? (() => {})} rotulo="Sumário" lado="direita">
        <Lista secoes={secoes} secaoAtiva={secaoAtiva} aoEscolher={aoFechar} />
      </Folha>
    );
  }

  return (
    <nav className="sumario sumario--embutido" aria-label="Sumário da página" id="sumario">
      <div className="sumario__painel">
        <Lista secoes={secoes} secaoAtiva={secaoAtiva} />
      </div>
    </nav>
  );
}
