import { useState, type ReactNode } from "react";

const paraMaps = (consulta: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;

const paraWaze = (consulta: string) =>
  `https://waze.com/ul?q=${encodeURIComponent(consulta)}&navigate=yes`;

export function Localizacao({
  consulta,
  children,
}: {
  consulta: string;
  children: ReactNode;
}) {
  const [aberto, definirAberto] = useState(false);
  const [copiado, definirCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(consulta);
      definirCopiado(true);
    } catch {
    }
  };

  return (
    <span className="local">
      <button
        type="button"
        className="local__gatilho"
        aria-expanded={aberto}
        onClick={() => definirAberto((a) => !a)}
      >
        {children}
      </button>
      {aberto && (
        <span className="local__opcoes">
          <a
            className="local__opcao"
            href={paraMaps(consulta)}
            target="_blank"
            rel="noreferrer noopener"
          >
            Google Maps
          </a>
          <a
            className="local__opcao"
            href={paraWaze(consulta)}
            target="_blank"
            rel="noreferrer noopener"
          >
            Waze
          </a>
          <button type="button" className="local__opcao" onClick={copiar}>
            {copiado ? "Endereço copiado" : "Copiar o endereço"}
          </button>
        </span>
      )}
    </span>
  );
}
