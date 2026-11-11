import type { Postura, PosturaDoMomento } from "../data/tipos";

const NOME: Record<Postura, string> = {
  pe: "De pé",
  sentado: "Sentados",
  joelhos: "De joelhos",
};

/**
 * Três figuras de traço, no mesmo desenho do resto do site: linha da cor do
 * texto, sem preenchimento. Cabeça, tronco e o que muda de uma postura para
 * outra: as pernas.
 */
function Figura({ postura }: { postura: Postura }) {
  return (
    <svg
      className="postura__figura"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {postura === "pe" && (
        <>
          <circle cx="12" cy="4.5" r="2" />
          <path d="M12 7v8M8 10h8M12 15l-3 7M12 15l3 7" />
        </>
      )}
      {postura === "sentado" && (
        <>
          <circle cx="9" cy="4.5" r="2" />
          <path d="M9 7v8M9 10l4 2M9 15h8M17 15v6" />
        </>
      )}
      {postura === "joelhos" && (
        <>
          <circle cx="11" cy="4.5" r="2" />
          <path d="M11 7v8M11 10l4 2M11 15v6M11 21H5" />
        </>
      )}
    </svg>
  );
}

/**
 * A postura do fiel, no ponto da Missa em que ela muda.
 *
 * Aparece junto da parte a que se refere, e não numa legenda geral: quem
 * acompanha a Missa precisa saber o que fazer agora, e não o que se faz em
 * geral. Quando a Missa rezada e a cantada divergem, dá as duas.
 */
export function PosturaDoFiel({ postura }: { postura: PosturaDoMomento }) {
  const pares: { rotulo?: string; postura: Postura }[] =
    typeof postura === "string"
      ? [{ postura }]
      : postura.rezada === postura.cantada
        ? [{ postura: postura.rezada }]
        : [
            { rotulo: "Missa rezada", postura: postura.rezada },
            { rotulo: "Missa cantada", postura: postura.cantada },
          ];

  return (
    <p className="postura">
      {pares.map(({ rotulo, postura: p }) => (
        <span className={`postura__momento postura__momento--${p}`} key={`${rotulo}${p}`}>
          <Figura postura={p} />
          <span>
            {rotulo && <span className="postura__rotulo">{rotulo}: </span>}
            {NOME[p]}
          </span>
        </span>
      ))}
    </p>
  );
}
