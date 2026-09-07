import { useCallback, useMemo, useState } from "react";
import { Cabecalho } from "../components/Cabecalho";
import { ProvedorDeNumeracao } from "../components/NumeracaoDePassos";
import { Secao } from "../components/Secao";
import { Sumario } from "../components/Sumario";
import { Vazia } from "../components/Vazia";
import type { ReactNode } from "react";
import type { Conteudo } from "../data/tipos";
import { usarSecaoAtiva } from "../hooks/usarSecaoAtiva";
import { Moldura } from "../components/Moldura";

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

  // o observador re-inscreve quando a identidade da lista muda; memoizar
  const secoesReais = useMemo(
    () => conteudo.secoes.filter((s) => s.id !== "em-preparacao"),
    [conteudo]
  );
  const identificadores = useMemo(() => secoesReais.map((s) => s.id), [secoesReais]);
  const secaoAtiva = usarSecaoAtiva(identificadores);

  const temSumario = secoesReais.length > 3;

  // usarSecaoAtiva devolve o id; a barra mostra gente, então mostra o título
  const local = useMemo(
    () => secoesReais.find((s) => s.id === secaoAtiva)?.titulo,
    [secoesReais, secaoAtiva]
  );

  /*
   * O corpo é memoizado porque `secaoAtiva` muda a cada divisa de seção ao
   * rolar. Sem isto, passar de uma seção para a outra re-renderizava as
   * dezesseis seções e os cinquenta e cinco passos do guia inteiro, o que
   * aparecia como um tranco na rolagem em aparelho modesto.
   */
  const corpo = useMemo(
    () =>
      secoesReais.map((secao, indice) => (
        <Secao secao={secao} numero={indice + 1} key={secao.id} />
      )),
    [secoesReais]
  );

  return (
    <ProvedorDeNumeracao secoes={secoesReais}>
      <Moldura
        titulo={conteudo.titulo}
        local={temSumario ? local : undefined}
        sumario={
          temSumario
            ? { aberto: sumarioAberto, alternar: () => definirSumarioAberto((a) => !a) }
            : undefined
        }
        comProgresso={temSumario}
      >
        <Cabecalho
          titulo={conteudo.titulo}
          descricao={conteudo.descricao}
          epigrafe={conteudo.epigrafe}
        />

        {conteudo.emPreparacao && <Vazia />}
        {conteudo.rascunho && <Vazia variante="rascunho" />}

        {temSumario && (
          <Sumario secoes={secoesReais} secaoAtiva={secaoAtiva} variante="embutido" />
        )}

        {corpo}

        {children}

        {temSumario && (
          <Sumario
            secoes={secoesReais}
            secaoAtiva={secaoAtiva}
            variante="flutuante"
            aberto={sumarioAberto}
            aoFechar={fecharSumario}
          />
        )}
      </Moldura>
    </ProvedorDeNumeracao>
  );
}
