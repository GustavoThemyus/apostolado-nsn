import type { ReactNode } from "react";
import type { Bloco as TipoBloco, Etiqueta } from "../data/tipos";
import { Legenda } from "./Legenda";
import { usarNumeroDoPasso } from "./NumeracaoDePassos";
import { Nota } from "./Nota";
import { Oracao } from "./Oracao";
import { Passo } from "./Passo";
import { Rubrica } from "./Rubrica";
import { RubricaDaAssembleia } from "./RubricaDaAssembleia";
import { Tabela } from "./Tabela";
import { TextoRico } from "./TextoRico";

function Lista({ ordenada, itens }: { ordenada?: boolean; itens: string[] }) {
  const Etiqueta = ordenada ? "ol" : "ul";
  return (
    <Etiqueta className="lista">
      {itens.map((item, indice) => (
        <li key={indice}>
          <TextoRico texto={item} />
        </li>
      ))}
    </Etiqueta>
  );
}

/** Escolhe o componente certo para cada bloco do conteúdo. */
export function Bloco({ bloco }: { bloco: TipoBloco }) {
  switch (bloco.tipo) {
    case "paragrafo":
      return (
        <p className="paragrafo">
          <TextoRico texto={bloco.texto} />
        </p>
      );
    case "rubrica":
      return <Rubrica texto={bloco.texto} />;
    case "assembleia":
      return <RubricaDaAssembleia texto={bloco.texto} />;
    case "subtitulo":
      return <h3 className="subtitulo">{bloco.texto}</h3>;
    case "lista":
      return <Lista ordenada={bloco.ordenada} itens={bloco.itens} />;
    case "oracao":
      return <Oracao versos={bloco.versos} />;
    case "nota":
      return <Nota titulo={bloco.titulo} paragrafos={bloco.paragrafos} alerta={bloco.alerta} />;
    case "tabela":
      return <Tabela colunas={bloco.colunas} linhas={bloco.linhas} />;
    case "legenda":
      return <Legenda itens={bloco.itens} />;
    case "passo":
      return (
        <PassoNumerado
          id={bloco.id}
          etiqueta={bloco.etiqueta}
          titulo={bloco.titulo}
          tituloLatim={bloco.tituloLatim}
        >
          <ListaDeBlocos blocos={bloco.corpo} />
        </PassoNumerado>
      );
  }
}

/** O número vem da posição no documento, não do dado. */
function PassoNumerado({
  id,
  etiqueta,
  titulo,
  tituloLatim,
  children,
}: {
  id?: string;
  etiqueta: Etiqueta;
  titulo: string;
  tituloLatim?: string;
  children: ReactNode;
}) {
  const numero = usarNumeroDoPasso(id);
  return (
    <Passo numero={numero ?? 0} etiqueta={etiqueta} titulo={titulo} tituloLatim={tituloLatim}>
      {children}
    </Passo>
  );
}

export function ListaDeBlocos({ blocos }: { blocos: TipoBloco[] }) {
  return (
    <>
      {blocos.map((bloco, indice) => (
        <Bloco bloco={bloco} key={indice} />
      ))}
    </>
  );
}
