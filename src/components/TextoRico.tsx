import { Fragment, type ReactNode } from "react";
import { Localizacao } from "./Localizacao";
import { BalaoDeNota, usarNota, usarNotaEmCurso } from "./Notas";

const CORES = ["branco", "vermelho", "verde", "roxo", "preto", "rosa"] as const;

type Cor = (typeof CORES)[number];
type Marca = "lat" | "b" | "i" | "r" | "tinta" | "nota" | "elo" | "botao" | "mapa" | Cor;

const marcacao = () =>
  /\[(lat|botao|b|i|r|tinta|nota|elo|mapa|branco|vermelho|verde|roxo|preto|rosa)(?::([^\]]*))?\]([\s\S]*?)\[\/\1\]/g;

function Nota({ chave }: { chave: string }) {
  const texto = usarNota(chave);
  const emCurso = usarNotaEmCurso(chave);
  if (!texto || emCurso) {
    return <sup className="nota-chamada nota-chamada--orfa">{chave}</sup>;
  }
  return (
    <BalaoDeNota chave={chave}>{interpretar(texto, `nota-${chave}`)}</BalaoDeNota>
  );
}

function Elo({
  destino,
  botao,
  children,
}: {
  destino: string;
  botao?: boolean;
  children: ReactNode;
}) {
  const externo = /^(https?:|mailto:)/.test(destino);
  const interno = destino.startsWith("/");
  return (
    <a
      className={
        botao
          ? `elo-botao${externo ? " elo-botao--externo" : ""}`
          : `elo-texto${externo ? " elo-texto--externo" : ""}`
      }
      href={externo || interno ? destino : `#${destino}`}
      {...(externo ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {children}
    </a>
  );
}

function envolver(
  marca: Marca,
  parametro: string | undefined,
  conteudo: ReactNode,
  cru: string,
  chave: string,
): ReactNode {
  switch (marca) {
    case "lat":
      return (
        <em className="lat" lang="la" key={chave}>
          {conteudo}
        </em>
      );
    case "b":
      return <strong key={chave}>{conteudo}</strong>;
    case "i":
      return <em key={chave}>{conteudo}</em>;
    case "r":
      return (
        <span className="rubrica rubrica--embutida" key={chave}>
          {conteudo}
        </span>
      );
    case "tinta":
      return (
        <span className="segunda-tinta" key={chave}>
          {conteudo}
        </span>
      );
    case "nota":
      return <Nota chave={cru.trim()} key={chave} />;
    case "elo":
      return (
        <Elo destino={parametro ?? ""} key={chave}>
          {conteudo}
        </Elo>
      );
    case "botao":
      return (
        <Elo destino={parametro ?? ""} botao key={chave}>
          {conteudo}
        </Elo>
      );
    case "mapa":
      return (
        <Localizacao consulta={parametro ?? ""} key={chave}>
          {conteudo}
        </Localizacao>
      );
    default:
      return (
        <span className={`cor cor--${marca}`} key={chave}>
          {conteudo}
        </span>
      );
  }
}

function ateOFechoQueCasa(
  texto: string,
  marca: string,
  inicio: number,
): { conteudo: string; fim: number } | null {
  const busca = new RegExp(`\\[${marca}(?::[^\\]]*)?\\]|\\[\\/${marca}\\]`, "g");
  busca.lastIndex = inicio;
  let profundidade = 1;
  let achado: RegExpExecArray | null;
  while ((achado = busca.exec(texto)) !== null) {
    profundidade += achado[0][1] === "/" ? -1 : 1;
    if (profundidade === 0) {
      return {
        conteudo: texto.slice(inicio, achado.index),
        fim: achado.index + achado[0].length,
      };
    }
  }
  return null;
}

const SINAIS = /([℣℟]\.?|✠)/g;

function comSinais(linha: string, prefixo: string): ReactNode[] {
  if (!/[℣℟✠]/.test(linha)) return [linha];
  return linha
    .split(SINAIS)
    .filter((p) => p !== "")
    .map((parte, i) =>
      /^[℣℟✠]/.test(parte) ? (
        <span className="sinal-de-verso" key={`${prefixo}-s-${i}`}>
          {parte}
        </span>
      ) : (
        parte
      ),
    );
}

function comQuebras(trecho: string, prefixo: string): ReactNode[] {
  const linhas = trecho.split("\n");
  const saida: ReactNode[] = [];
  linhas.forEach((linha, indice) => {
    if (indice > 0) saida.push(<br key={`${prefixo}-br-${indice}`} />);
    if (linha) saida.push(...comSinais(linha, `${prefixo}-${indice}`));
  });
  return saida;
}

export function interpretar(texto: string, prefixo = "t"): ReactNode[] {
  const partes: ReactNode[] = [];
  const padrao = marcacao();
  let ultimoFim = 0;
  let ocorrencia: RegExpExecArray | null;

  while ((ocorrencia = padrao.exec(texto)) !== null) {
    if (ocorrencia.index > ultimoFim) {
      partes.push(
        ...comQuebras(texto.slice(ultimoFim, ocorrencia.index), `${prefixo}-${ultimoFim}`),
      );
    }
    const marca = ocorrencia[1] as Marca;
    const chave = `${prefixo}-${marca}-${ocorrencia.index}`;
    const abertura =
      ocorrencia.index +
      marca.length +
      (ocorrencia[2] === undefined ? 2 : 3 + ocorrencia[2].length);
    const casado = ateOFechoQueCasa(texto, marca, abertura);
    const conteudo = casado ? casado.conteudo : ocorrencia[3];
    partes.push(
      envolver(
        marca,
        ocorrencia[2],
        marca === "nota" ? null : interpretar(conteudo, chave),
        conteudo,
        chave,
      ),
    );
    ultimoFim = casado ? casado.fim : ocorrencia.index + ocorrencia[0].length;
    padrao.lastIndex = ultimoFim;
  }

  if (ultimoFim < texto.length) {
    partes.push(...comQuebras(texto.slice(ultimoFim), `${prefixo}-${ultimoFim}`));
  }
  return partes;
}

export function TextoRico({ texto }: { texto: string }) {
  return <Fragment>{interpretar(texto)}</Fragment>;
}
