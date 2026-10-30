import { Fragment, type ReactNode } from "react";
import { Localizacao } from "./Localizacao";
import { BalaoDeNota, usarNota, usarNotaEmCurso } from "./Notas";

const CORES = ["branco", "vermelho", "verde", "roxo", "preto", "rosa"] as const;

type Cor = (typeof CORES)[number];
type Marca = "lat" | "b" | "i" | "r" | "nota" | "elo" | "botao" | "mapa" | Cor;

/**
 * Instância nova a cada chamada: a busca é recursiva e lastIndex é estado
 * mutável. O `:parametro` é opcional; usam-no o `elo`, o `botao` e o `mapa`.
 *
 * `botao` vem antes de `b` na alternância de propósito: as duas começam com a
 * mesma letra, e ainda que o retrocesso do motor acabasse acertando, a ordem
 * explícita poupa o leitor de ter que descobrir isso.
 */
const marcacao = () =>
  /\[(lat|botao|b|i|r|nota|elo|mapa|branco|vermelho|verde|roxo|preto|rosa)(?::([^\]]*))?\]([\s\S]*?)\[\/\1\]/g;

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

/**
 * Três destinos, e a diferença importa:
 *   https://...                    outro site, abre em aba nova
 *   /indulgencias/enchiridion#x    outra página daqui, o Roteador intercepta
 *   concessao-14                   ponto desta mesma página
 */
function Elo({
  destino,
  botao,
  children,
}: {
  destino: string;
  /** Elo de destaque: o que leva o leitor adiante, e por isso parece botão. */
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
      // âncora da própria página começa com #, e o Roteador não intercepta essas
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
    case "nota":
      // o corpo é a chave da nota, não texto para interpretar
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
      // o parâmetro é o que se procura no mapa: nome da igreja e endereço
      return (
        <Localizacao consulta={parametro ?? ""} key={chave}>
          {conteudo}
        </Localizacao>
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

/**
 * O fecho que casa com esta abertura, e não o primeiro que aparecer.
 *
 * Sozinha, a busca não-gulosa para no primeiro `[/i]`, e uma marca dentro de
 * outra igual se parte no meio: "[i]Concessão n.º 14 ... da Constituição
 * Apostólica [i]Indulgentiarum Doctrina[/i][/i]" saía com o segundo `[/i]`
 * escrito na tela, em letras, na linha da concessão de São Pedro e São Paulo.
 * Acontecia porque a fonte já vinha em itálico e o nome do documento também.
 *
 * Conta abertura e fecho da mesma marca até zerar. Marcação sem fecho devolve
 * nulo, e aí vale o que o padrão achou: texto quebrado não derruba a página.
 */
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
    // `[elo]` e `[elo:]` têm o mesmo grupo vazio, e só a abertura crua diz
    // qual dos dois é: daí o comprimento sair do parâmetro, e não do achado
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
