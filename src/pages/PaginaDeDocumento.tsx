import { useCallback, useMemo, useState } from "react";
import { Cabecalho } from "../components/Cabecalho";
import { AtalhosDaSecao, CartoesDeSecao } from "../components/CartoesDeSecao";
import { ProvedorDeNumeracao } from "../components/NumeracaoDePassos";
import { Secao } from "../components/Secao";
import { Sumario } from "../components/Sumario";
import { Vazia } from "../components/Vazia";
import type { ReactNode } from "react";
import type { Conteudo } from "../data/tipos";
import { usarRota } from "../routes/usarRota";
import { usarSecaoAtiva } from "../hooks/usarSecaoAtiva";
import { Moldura } from "../components/Moldura";
import { ProvedorDeNotas } from "../components/Notas";
import { ProvedorDeSecoes } from "../components/IndiceDoDocumento";

/**
 * A página de conteúdo genérica: serve o guia, as indulgências, o apostolado
 * e todas as subpáginas de texto. É ela que passa a ser dona do Sumário, o
 * que faz dele um controle *daquela página* em vez do aplicativo inteiro.
 */
export function PaginaDeDocumento({
  conteudo,
  children,
}: {
  conteudo: Conteudo;
  /** Blocos extras depois das seções, como os botões de agenda. */
  children?: ReactNode;
}) {
  const [sumarioAberto, definirSumarioAberto] = useState(false);
  const fecharSumario = useCallback(() => definirSumarioAberto(false), []);
  const { rota } = usarRota();

  // o observador re-inscreve quando a identidade da lista muda; memoizar
  const secoesReais = useMemo(
    () => conteudo.secoes.filter((s) => s.id !== "em-preparacao"),
    [conteudo],
  );
  const identificadores = useMemo(
    () => secoesReais.map((s) => s.id),
    [secoesReais],
  );
  // o que entra no índice e no sumário, e é o que se numera
  const secoesIndexadas = useMemo(
    () => secoesReais.filter((s) => !s.foraDoIndice),
    [secoesReais],
  );
  const secaoAtiva = usarSecaoAtiva(identificadores);

  const temSumario = secoesIndexadas.length > 3;

  // usarSecaoAtiva devolve o id; a barra mostra gente, então mostra o título
  const local = useMemo(
    () => secoesReais.find((s) => s.id === secaoAtiva)?.titulo,
    [secoesReais, secaoAtiva],
  );

  /*
   * O corpo é memoizado porque `secaoAtiva` muda a cada divisa de seção ao
   * rolar. Sem isto, passar de uma seção para a outra re-renderizava as
   * dezesseis seções e os cinquenta e cinco passos do guia inteiro, o que
   * aparecia como um tranco na rolagem em aparelho modesto.
   */
  const corpo = useMemo(() => {
    // o número conta só as seções indexadas: a apresentação abre o documento
    // sem número, como abertura, e o texto oficial começa em 1
    let contador = 0;
    return secoesReais.map((secao) => {
      const numero = secao.foraDoIndice ? undefined : (contador += 1);
      return <Secao secao={secao} numero={numero} key={secao.id} />;
    });
  }, [secoesReais]);

  return (
    <ProvedorDeNotas notas={conteudo.notas}>
    <ProvedorDeSecoes secoes={secoesIndexadas}>
    <ProvedorDeNumeracao secoes={secoesReais}>
      <Moldura
        titulo={conteudo.titulo}
        local={temSumario ? local : undefined}
        sumario={
          temSumario
            ? {
                aberto: sumarioAberto,
                alternar: () => definirSumarioAberto((a) => !a),
              }
            : undefined
        }
        comProgresso={temSumario}
      >
        <Cabecalho
          titulo={conteudo.titulo}
          descricao={conteudo.descricao}
        />

        {conteudo.emPreparacao && <Vazia />}
        {conteudo.rascunho && <Vazia variante="rascunho" />}

        {/*
          A antífona abre o texto, e é por isso que ela fica aqui e não no
          cabeçalho: o cabeçalho é a identidade do apostolado, igual em toda
          página; esta linha é a voz deste documento.
        */}
        {conteudo.epigrafe && (
          <p className="epigrafe" lang="la">
            {conteudo.epigrafe}
          </p>
        )}

        {/* antes do texto: quem chega tem de saber que a seção tem mais */}
        {rota && <AtalhosDaSecao padrao={rota.padrao} />}

        {/*
          Em tela larga o sumário sai de cima do texto e vira coluna à
          esquerda, grudenta. Sem isso a prosa ficava com a medida de leitura
          no meio de uma coluna larga e sobrava meia tela em branco à direita:
          largura que não se usa é largura que não serve.
        */}
        <div
          className={`documento${temSumario ? " documento--com-sumario" : ""}`}
        >
          {temSumario && (
            <Sumario
              secoes={secoesIndexadas}
              secaoAtiva={secaoAtiva}
              variante="embutido"
            />
          )}

          <div className="documento__corpo">
            {corpo}

            {rota && <CartoesDeSecao padrao={rota.padrao} />}

            {children}
          </div>
        </div>

        {temSumario && (
          <Sumario
            secoes={secoesIndexadas}
            secaoAtiva={secaoAtiva}
            variante="flutuante"
            aberto={sumarioAberto}
            aoFechar={fecharSumario}
          />
        )}
      </Moldura>
    </ProvedorDeNumeracao>
    </ProvedorDeSecoes>
    </ProvedorDeNotas>
  );
}
