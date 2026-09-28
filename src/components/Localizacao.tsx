import { useState, type ReactNode } from "react";

/**
 * O "conferir a localização" de cada igreja.
 *
 * O Perez pediu que o clique desse a opção de abrir no Maps, no Waze ou no
 * Uber. Um endereço de Google Maps sozinho não faz isso: no telefone ele abre
 * o próprio Maps e pronto. Então as opções são explícitas.
 *
 * O Uber ficou de fora, e não por esquecimento: o elo dele só fixa o destino
 * com latitude e longitude, que não temos — nenhum endereço do documento traz
 * coordenada. Um botão "Uber" que abrisse o aplicativo sem destino prometeria
 * o que não cumpre. No lugar dele vai copiar o endereço, que serve para o
 * Uber e para qualquer outro aplicativo.
 */
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
      /* sem área de transferência: o endereço continua escrito acima */
    }
  };

  /*
   * Tudo aqui é conteúdo de frase — span, button, a. Nada de <details>, que é
   * conteúdo de fluxo e não pode viver dentro de um <p>: esta marcação também
   * aparece em parágrafo, e ali o navegador fecharia o parágrafo antes dela.
   */
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
