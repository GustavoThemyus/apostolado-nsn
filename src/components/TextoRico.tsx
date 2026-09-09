import { Fragment, type ReactNode } from "react";
import { BalaoDeNota, usarNota, usarNotaEmCurso } from "./Notas";

const CORES = ["branco", "vermelho", "verde", "roxo", "preto", "rosa"] as const;

type Cor = (typeof CORES)[number];
type Marca = "lat" | "b" | "i" | "r" | "nota" | "elo" | Cor;

/**
 * Instância nova a cada chamada: a busca é recursiva e lastIndex é estado
 * mutável. O `:parametro` é opcional e só o `elo` o usa hoje.
 */
const marcacao = () =>
  /\[(lat|b|i|r|nota|elo|branco|vermelho|verde|roxo|preto|rosa)(?::([^\]]*))?\]([\s\S]*?)\[\/\1\]/g;

/** A chamada de nota: componente porque precisa de contexto. */
function Nota({ chave }: { chave: string }) {
  const texto = usarNota(chave);
  // nota que se cita dentro de si mesma pararia aqui de qualquer jeito; sem
  // esta guarda ela pararia estourando a memória do navegador
  const emCurso = usarNotaEmCurso(chave);
  // nota que não está no mapa vira só o número: não prometer o que não há
  if (!texto || emCurso) {
    return <sup className="nota-chamada nota-chamada--orfa">{chave}</sup>;
  }
  return (
    <BalaoDeNota chave={chave}>{interpretar(texto, `nota-${chave}`)}</BalaoDeNota>
  );
}

function Elo({ destino, children }: { destino: string; children: ReactNode }) {
  const externo = /^https?:/.test(destino);
  return (
    <a
      className={`elo-texto${externo ? " elo-texto--externo" : ""}`}
      // âncora interna começa com #, e o Roteador não intercepta essas
      href={externo ? destino : `#${destino}`}
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
    case "nota":
      // o corpo é a chave da nota, não texto para interpretar
      return <Nota chave={cru.trim()} key={chave} />;
    case "elo":
      return (
        <Elo destino={parametro ?? ""} key={chave}>
          {conteudo}
        </Elo>
      );
    default:
      // nome de cor litúrgica: a palavra é escrita na própria cor
      return (
        <span className={`cor cor--${marca}`} key={chave}>
          {conteudo}
        </span>
      );
  }
}

/** Quebra de linha explícita dentro de uma célula ou parágrafo. */
function comQuebras(trecho: string, prefixo: string): ReactNode[] {
  const linhas = trecho.split("\n");
  const saida: ReactNode[] = [];
  linhas.forEach((linha, indice) => {
    if (indice > 0) saida.push(<br key={`${prefixo}-br-${indice}`} />);
    if (linha) saida.push(linha);
  });
  return saida;
}

/**
 * Converte a marcação mínima do conteúdo em elementos React.
 * Nada de HTML cru: o texto vira sempre nó de texto ou elemento conhecido.
 */
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
    partes.push(
      envolver(
        marca,
        ocorrencia[2],
        marca === "nota" ? null : interpretar(ocorrencia[3], chave),
        ocorrencia[3],
        chave,
      ),
    );
    ultimoFim = ocorrencia.index + ocorrencia[0].length;
  }

  if (ultimoFim < texto.length) {
    partes.push(...comQuebras(texto.slice(ultimoFim), `${prefixo}-${ultimoFim}`));
  }
  return partes;
}

export function TextoRico({ texto }: { texto: string }) {
  return <Fragment>{interpretar(texto)}</Fragment>;
}
