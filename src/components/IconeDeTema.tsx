import type { Tema } from "../hooks/usarTema";

/**
 * Ícones desenhados, no mesmo traço para os três modos: o disco com halo para
 * o claro, a lua minguante para o escuro e o disco meio preenchido para o modo
 * que segue o aparelho.
 */
export function IconeDeTema({ tema }: { tema: Tema }) {
  return (
    <svg className="barra__icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {tema === "claro" && (
        <>
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
      {tema === "escuro" && (
        <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
      )}
      {tema === "sistema" && (
        <>
          <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 3.8a8.2 8.2 0 0 1 0 16.4z" />
        </>
      )}
    </svg>
  );
}
