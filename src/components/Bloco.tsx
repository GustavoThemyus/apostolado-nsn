import type { Bloco as TipoBloco } from "../data/tipos";
import { Legenda } from "./Legenda";
import { Nota } from "./Nota";
import { Oracao } from "./Oracao";
import { Passo } from "./Passo";
import { Rubrica } from "./Rubrica";
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
        <Passo
          numero={bloco.numero}
          etiqueta={bloco.etiqueta}
          titulo={bloco.titulo}
          tituloLatim={bloco.tituloLatim}
        >
          <ListaDeBlocos blocos={bloco.corpo} />
        </Passo>
      );
  }
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
