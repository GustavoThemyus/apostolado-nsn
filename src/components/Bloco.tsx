import type { ReactNode } from "react";
import type { Bloco as TipoBloco, Etiqueta } from "../data/tipos";
import { IndiceDoDocumento } from "./IndiceDoDocumento";
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
      // a âncora é o que deixa o sumário e o índice analítico apontarem para
      // uma concessão, e não só para a seção inteira
      // o menor é o cabeçalho de uma oração dentro de uma concessão: ganha
      // âncora para o índice analítico, mas fica fora do sumário
      return bloco.menor ? (
        <h4 className="subtitulo subtitulo--menor" id={bloco.ancora}>
          <TextoRico texto={bloco.texto} />
        </h4>
      ) : (
        <h3 className="subtitulo" id={bloco.ancora}>
          <TextoRico texto={bloco.texto} />
        </h3>
      );
    case "lista":
      return <Lista ordenada={bloco.ordenada} itens={bloco.itens} />;
    case "oracao":
      return <Oracao versos={bloco.versos} />;
    case "nota":
      return <Nota titulo={bloco.titulo} paragrafos={bloco.paragrafos} alerta={bloco.alerta} />;
    case "tabela":
      return <Tabela colunas={bloco.colunas} linhas={bloco.linhas} />;
    case "separador":
      return <hr className="separador" />;
    case "bilingue":
      return (
        <div className="bilingue">
          {/* lang="la" para o leitor de tela não pronunciar latim em português */}
          <div className="bilingue__lado bilingue__lado--latim" lang="la">
            <ListaDeBlocos blocos={bloco.latim} />
          </div>
          <div className="bilingue__lado">
            <ListaDeBlocos blocos={bloco.portugues} />
          </div>
        </div>
      );
    case "indice":
      return <IndiceDoDocumento />;
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
