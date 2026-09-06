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
  const temCabecalho = Boolean(conteudo.chamada || conteudo.epigrafe);

  return (
    <ProvedorDeNumeracao secoes={secoesReais}>
      <Moldura
        titulo={conteudo.titulo}
        local={temSumario ? secaoAtiva ?? undefined : undefined}
        sumario={
          temSumario
            ? { aberto: sumarioAberto, alternar: () => definirSumarioAberto((a) => !a) }
            : undefined
        }
        comProgresso={temSumario}
      >
        <Cabecalho
          variante={temCabecalho ? "capa" : "pagina"}
          chamada={conteudo.chamada}
          titulo={conteudo.titulo}
          descricao={conteudo.descricao}
          epigrafe={conteudo.epigrafe}
        />

        {conteudo.emPreparacao && <Vazia />}
        {conteudo.rascunho && <Vazia variante="rascunho" />}

        {temSumario && (
          <Sumario secoes={secoesReais} secaoAtiva={secaoAtiva} variante="embutido" />
        )}

        {conteudo.secoes
          .filter((s) => s.id !== "em-preparacao")
          .map((secao, indice) => (
            <Secao secao={secao} numero={indice + 1} key={secao.id} />
          ))}

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
