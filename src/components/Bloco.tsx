import type { CSSProperties, ReactNode } from "react";
import type { Bloco as TipoBloco, Etiqueta } from "../data/tipos";
import { IndiceDoDocumento } from "./IndiceDoDocumento";
import { Legenda } from "./Legenda";
import { usarNumeroDoPasso } from "./NumeracaoDePassos";
import { Nota } from "./Nota";
import { Oracao } from "./Oracao";
import { Passo } from "./Passo";
import { LugarDoProprio } from "./ProprioDoDia";
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

export function Bloco({ bloco }: { bloco: TipoBloco }) {
  switch (bloco.tipo) {
    case "paragrafo": {
      const resposta = /^\[b\]℟\.\s*([\s\S]*)$/.exec(bloco.texto);
      if (resposta) {
        return (
          <p className="paragrafo paragrafo--resposta" id={bloco.ancora}>
            <span className="resposta__sinal">
              <TextoRico texto="[b]℟.[/b]" />
            </span>{" "}
            <span className="resposta__texto">
              <TextoRico texto={`[b]${resposta[1]}`} />
            </span>
          </p>
        );
      }
      return (
        <p
          className={bloco.destaque ? "paragrafo paragrafo--destaque" : "paragrafo"}
          id={bloco.ancora}
        >
          <TextoRico texto={bloco.texto} />
        </p>
      );
    }
    case "rubrica":
      return <Rubrica texto={bloco.texto} />;
    case "assembleia":
      return <RubricaDaAssembleia texto={bloco.texto} />;
    case "subtitulo":
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
      return (
        <Tabela
          colunas={bloco.colunas}
          linhas={bloco.linhas}
          ancoras={bloco.ancoras}
          porColuna={bloco.porColuna}
        />
      );
    case "separador":
      return <hr className="separador" />;
    case "bilingue": {
      const linhas = Math.max(bloco.latim.length, bloco.portugues.length);
      return (
        <div className="bilingue" style={{ "--linhas": linhas } as CSSProperties}>
          <div className="bilingue__lado bilingue__lado--latim" lang="la">
            <ListaDeBlocos blocos={bloco.latim} />
          </div>
          <div className="bilingue__lado bilingue__lado--traducao">
            <ListaDeBlocos blocos={bloco.portugues} />
          </div>
        </div>
      );
    }
    case "proprio":
      return <LugarDoProprio nome={bloco.nome} subtitulos={bloco.subtitulos} />;
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
