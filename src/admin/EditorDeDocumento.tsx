import { useState } from "react";
import type { Bloco, Conteudo, Secao } from "../data/tipos";
import { Botao, Campo, Linha, Texto } from "./Campos";
import { EditorDeBloco } from "./EditorDeBloco";
import { mover } from "./mover";
import { Paleta } from "./Paleta";
import { novoId } from "./tiposDeBloco";

/**
 * O editor das páginas de texto: título, descrição e as seções.
 *
 * Serve os onze documentos de forma `documento`, do guia da Missa ao
 * calendário arquidiocesano. Antes era o painel inteiro, preso ao guia por um
 * `documento=guia` escrito à mão no meio do componente.
 *
 * Trabalha sempre sobre o objeto carregado, com espalhamento, e nunca o
 * reconstrói campo a campo: documento com chave que o editor não conhece —
 * `notas`, `epigrafe`, `emPreparacao` — tem de atravessar a edição inteiro.
 * Montar um objeto novo com os campos conhecidos apagaria as 49 notas do
 * calendário arquidiocesano no primeiro salvamento.
 */
export function EditorDeDocumento({
  conteudo,
  aoMudar,
}: {
  conteudo: Conteudo;
  aoMudar: (c: Conteudo) => void;
}) {
  const [aberta, definirAberta] = useState<string | null>(null);
  const secao = conteudo.secoes.find((s) => s.id === aberta) ?? null;

  const trocarSecoes = (secoes: Secao[]) => aoMudar({ ...conteudo, secoes });

  if (secao) {
    return (
      <EditorDeSecao
        secao={secao}
        aoMudar={(nova) =>
          trocarSecoes(conteudo.secoes.map((s) => (s.id === nova.id ? nova : s)))
        }
        aoVoltar={() => definirAberta(null)}
        aoRemover={() => {
          trocarSecoes(conteudo.secoes.filter((s) => s.id !== secao.id));
          definirAberta(null);
        }}
      />
    );
  }

  return (
    <>
      <Campo rotulo="Título da página">
        <Linha valor={conteudo.titulo} aoMudar={(titulo) => aoMudar({ ...conteudo, titulo })} />
      </Campo>
      <Campo rotulo="Descrição" dica="Uma linha. Aparece abaixo do título e na prévia ao compartilhar.">
        <Texto
          valor={conteudo.descricao ?? ""}
          linhas={2}
          marcacao={false}
          aoMudar={(descricao) => aoMudar({ ...conteudo, descricao })}
        />
      </Campo>

      <h2 className="admin__h2">Seções</h2>
      <p className="admin__ajuda">
        Cada seção vira um título numerado na página e uma entrada no sumário.
        Toque numa para editar os blocos dela.
      </p>
      <ol className="admin__secoes">
        {conteudo.secoes.map((s, i) => (
          <li key={s.id}>
            <button type="button" className="admin__secao" onClick={() => definirAberta(s.id)}>
              <span className="admin__secao-num">{i + 1}</span>
              <span className="admin__secao-nome">{s.titulo}</span>
              <span className="admin__secao-conta">
                {s.blocos.length} {s.blocos.length === 1 ? "bloco" : "blocos"}
              </span>
            </button>
            <div className="admin__secao-acoes">
              <Botao aoClicar={() => trocarSecoes(mover(conteudo.secoes, i, -1))} titulo="Subir">↑</Botao>
              <Botao aoClicar={() => trocarSecoes(mover(conteudo.secoes, i, 1))} titulo="Descer">↓</Botao>
            </div>
          </li>
        ))}
      </ol>
      <Botao
        variante="forte"
        aoClicar={() => {
          const id = novoId("secao");
          trocarSecoes([...conteudo.secoes, { id, titulo: "Nova seção", blocos: [] }]);
          definirAberta(id);
        }}
      >
        + nova seção
      </Botao>
    </>
  );
}

function EditorDeSecao({
  secao,
  aoMudar,
  aoVoltar,
  aoRemover,
}: {
  secao: Secao;
  aoMudar: (s: Secao) => void;
  aoVoltar: () => void;
  aoRemover: () => void;
}) {
  const trocarBlocos = (blocos: Bloco[]) => aoMudar({ ...secao, blocos });

  return (
    <>
      <button type="button" className="admin__voltar admin__voltar--corpo" onClick={aoVoltar}>
        ← todas as seções
      </button>

      <Campo rotulo="Título da seção">
        <Linha valor={secao.titulo} aoMudar={(titulo) => aoMudar({ ...secao, titulo })} />
      </Campo>
      <Campo rotulo="Resumo" dica="Linha em itálico logo abaixo do título. Pode ficar vazia.">
        <Texto
          valor={secao.resumo ?? ""}
          linhas={2}
          aoMudar={(resumo) => aoMudar({ ...secao, resumo })}
        />
      </Campo>
      <label className="campo campo--inline">
        <input
          type="checkbox"
          checked={Boolean(secao.foraDoIndice)}
          onChange={(e) => aoMudar({ ...secao, foraDoIndice: e.target.checked })}
        />
        <span>Fora do sumário e sem número (abertura, legenda, conclusão)</span>
      </label>

      <h2 className="admin__h2">Blocos</h2>
      <ListaDeBlocos blocos={secao.blocos} aoMudar={trocarBlocos} />

      <div className="admin__perigo">
        <Botao aoClicar={aoRemover} variante="risco">
          Remover esta seção inteira
        </Botao>
      </div>
    </>
  );
}

/** Os blocos de uma seção, ou de dentro de um passo. */
export function ListaDeBlocos({
  blocos,
  aoMudar,
  dentroDePasso = false,
}: {
  blocos: Bloco[];
  aoMudar: (b: Bloco[]) => void;
  dentroDePasso?: boolean;
}) {
  const [criando, definirCriando] = useState(false);

  return (
    <>
      {blocos.map((b, i) => (
        <EditorDeBloco
          key={b.id ?? i}
          bloco={b}
          aoMudar={(novo) => aoMudar(blocos.map((x, k) => (k === i ? novo : x)))}
          aoRemover={() => aoMudar(blocos.filter((_, k) => k !== i))}
          aoMover={(passo) => aoMudar(mover(blocos, i, passo))}
        >
          {b.tipo === "passo" && (
            <div className="aninhado">
              <span className="campo__rotulo">Corpo do passo</span>
              <ListaDeBlocos
                blocos={b.corpo}
                dentroDePasso
                aoMudar={(corpo) => aoMudar(blocos.map((x, k) => (k === i ? { ...b, corpo } : x)))}
              />
            </div>
          )}
        </EditorDeBloco>
      ))}

      {criando ? (
        <Paleta
          /* passo dentro de passo não existe na página, então não se oferece */
          excluir={dentroDePasso ? ["passo"] : []}
          aoEscolher={(bloco) => {
            aoMudar([...blocos, bloco]);
            definirCriando(false);
          }}
          aoCancelar={() => definirCriando(false)}
        />
      ) : (
        <Botao aoClicar={() => definirCriando(true)} variante="forte">
          + novo bloco
        </Botao>
      )}
    </>
  );
}
