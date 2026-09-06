import { useCallback, useMemo, useState } from "react";
import { Cabecalho } from "../components/Cabecalho";
import { ProvedorDeNumeracao } from "../components/NumeracaoDePassos";
import { Secao } from "../components/Secao";
import { Sumario } from "../components/Sumario";
import { Vazia } from "../components/Vazia";
import type { Conteudo } from "../data/tipos";
import { usarSecaoAtiva } from "../hooks/usarSecaoAtiva";
import { Moldura } from "../components/Moldura";

/**
 * A página de conteúdo genérica: serve o guia, as indulgências, o apostolado
 * e todas as subpáginas de texto. É ela que passa a ser dona do Sumário, o
 * que faz dele um controle *daquela página* em vez do aplicativo inteiro.
 */
export function PaginaDeDocumento({ conteudo }: { conteudo: Conteudo }) {
  const [sumarioAberto, definirSumarioAberto] = useState(false);
  const fecharSumario = useCallback(() => definirSumarioAberto(false), []);

  // o observador re-inscreve quando a identidade da lista muda; memoizar
  const identificadores = useMemo(
    () => conteudo.secoes.map((s) => s.id),
    [conteudo]
  );
  const secaoAtiva = usarSecaoAtiva(identificadores);

  const temSumario = conteudo.secoes.length > 3;
  const temCabecalho = Boolean(conteudo.chamada || conteudo.epigrafe);

  return (
    <ProvedorDeNumeracao secoes={conteudo.secoes}>
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
        {temCabecalho ? (
          <Cabecalho
            chamada={conteudo.chamada ?? ""}
            titulo={conteudo.titulo}
            descricao={conteudo.descricao ?? ""}
            epigrafe={conteudo.epigrafe ?? ""}
          />
        ) : (
          <header className="pagina__topo">
            <h1 className="pagina__titulo">{conteudo.titulo}</h1>
            {conteudo.descricao && <p className="pagina__resumo">{conteudo.descricao}</p>}
          </header>
        )}

        {conteudo.emPreparacao && <Vazia />}

        {temSumario && (
          <Sumario secoes={conteudo.secoes} secaoAtiva={secaoAtiva} variante="embutido" />
        )}

        {conteudo.secoes.map((secao, indice) => (
          <Secao secao={secao} numero={indice + 1} key={secao.id} />
        ))}

        {temSumario && (
          <Sumario
            secoes={conteudo.secoes}
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
