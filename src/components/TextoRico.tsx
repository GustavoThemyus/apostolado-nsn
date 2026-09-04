import { Fragment, type ReactNode } from "react";

const CORES = ["branco", "vermelho", "verde", "roxo", "preto", "rosa"] as const;

type Cor = (typeof CORES)[number];
type Marca = "lat" | "b" | "i" | "r" | Cor;

/** Instância nova a cada chamada: a busca é recursiva e lastIndex é estado mutável. */
const marcacao = () =>
  /\[(lat|b|i|r|branco|vermelho|verde|roxo|preto|rosa)\]([\s\S]*?)\[\/\1\]/g;

function envolver(marca: Marca, conteudo: ReactNode, chave: string): ReactNode {
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
        ...comQuebras(texto.slice(ultimoFim, ocorrencia.index), `${prefixo}-${ultimoFim}`)
      );
    }
    const chave = `${prefixo}-${ocorrencia[1]}-${ocorrencia.index}`;
    partes.push(envolver(ocorrencia[1] as Marca, interpretar(ocorrencia[2], chave), chave));
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
