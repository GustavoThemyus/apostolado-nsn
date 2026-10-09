import { useState } from "react";
import type { ColecaoDePostagens, Postagem } from "../data/tipos";
import { Botao, Campo, Linha, Texto } from "./Campos";
import { ListaDeBlocos } from "./EditorDeDocumento";
import { mover } from "./mover";

/**
 * As postagens: vidas de santos e escritos sobre a liturgia.
 *
 * O corpo usa a mesma lista de blocos das páginas de texto, com a mesma
 * paleta: uma postagem não tem motivo para ter formatação própria.
 */
const CATEGORIAS: Postagem["categoria"][] = ["santo", "liturgia", "aviso"];
const NOME_DA_CATEGORIA: Record<Postagem["categoria"], string> = {
  santo: "Vida de santo",
  liturgia: "Liturgia",
  aviso: "Aviso",
};

/** Endereço da postagem: sem acento, sem espaço, estável depois de publicada. */
const comoEndereco = (titulo: string) =>
  titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const hoje = () => new Date().toISOString().slice(0, 10);

export function EditorDePostagens({
  conteudo,
  aoMudar,
}: {
  conteudo: ColecaoDePostagens;
  aoMudar: (c: ColecaoDePostagens) => void;
}) {
  const [aberta, definirAberta] = useState<string | null>(null);
  const postagem = conteudo.postagens.find((p) => p.id === aberta) ?? null;

  const trocar = (postagens: Postagem[]) => aoMudar({ ...conteudo, postagens });

  if (postagem) {
    return (
      <EditorDePostagem
        postagem={postagem}
        aoMudar={(nova) =>
          trocar(conteudo.postagens.map((p) => (p.id === postagem.id ? nova : p)))
        }
        aoVoltar={() => definirAberta(null)}
        aoRemover={() => {
          trocar(conteudo.postagens.filter((p) => p.id !== postagem.id));
          definirAberta(null);
        }}
      />
    );
  }

  return (
    <>
      <h2 className="admin__h2">Postagens</h2>
      <p className="admin__ajuda">
        A ordem aqui não importa para o site: a lista e a faixa do início
        ordenam pela data. O que importa é a data de cada uma.
      </p>
      <ol className="admin__secoes">
        {conteudo.postagens.map((p, i) => (
          <li key={p.id}>
            <button type="button" className="admin__secao" onClick={() => definirAberta(p.id)}>
              <span className="admin__secao-num">{p.data.slice(8, 10)}/{p.data.slice(5, 7)}</span>
              <span className="admin__secao-nome">
                {p.titulo}
                {p.rascunho && <span className="escolha__falta">rascunho</span>}
                {p.publicado === false && <span className="escolha__falta">escondida</span>}
              </span>
              <span className="admin__secao-conta">
                {p.blocos.length} {p.blocos.length === 1 ? "bloco" : "blocos"}
              </span>
            </button>
            <div className="admin__secao-acoes">
              <Botao aoClicar={() => trocar(mover(conteudo.postagens, i, -1))} titulo="Subir">↑</Botao>
              <Botao aoClicar={() => trocar(mover(conteudo.postagens, i, 1))} titulo="Descer">↓</Botao>
            </div>
          </li>
        ))}
      </ol>
      <Botao
        variante="forte"
        aoClicar={() => {
          const id = `postagem-${Date.now().toString(36)}`;
          trocar([
            {
              id,
              titulo: "Nova postagem",
              resumo: "",
              data: hoje(),
              categoria: "liturgia",
              rascunho: true,
              publicado: false,
              blocos: [],
            },
            ...conteudo.postagens,
          ]);
          definirAberta(id);
        }}
      >
        + nova postagem
      </Botao>
    </>
  );
}

function EditorDePostagem({
  postagem,
  aoMudar,
  aoVoltar,
  aoRemover,
}: {
  postagem: Postagem;
  aoMudar: (p: Postagem) => void;
  aoVoltar: () => void;
  aoRemover: () => void;
}) {
  const troca = (parte: Partial<Postagem>) => aoMudar({ ...postagem, ...parte });
  const nova = postagem.blocos.length === 0 && postagem.publicado === false;

  return (
    <>
      <button type="button" className="admin__voltar admin__voltar--corpo" onClick={aoVoltar}>
        ← todas as postagens
      </button>

      <Campo rotulo="Título">
        <Linha valor={postagem.titulo} aoMudar={(titulo) => troca({ titulo })} />
      </Campo>

      <Campo
        rotulo="Endereço"
        dica={
          nova
            ? "Vai na URL. Depois de publicada, mudar isto quebra os links já compartilhados."
            : "ATENÇÃO: esta postagem já tem endereço. Mudá-lo quebra os links já compartilhados."
        }
      >
        <Linha valor={postagem.id} aoMudar={(id) => troca({ id })} />
      </Campo>
      {nova && postagem.id.startsWith("postagem-") && postagem.titulo !== "Nova postagem" && (
        <Botao aoClicar={() => troca({ id: comoEndereco(postagem.titulo) })}>
          usar “{comoEndereco(postagem.titulo)}”
        </Botao>
      )}

      <Campo rotulo="Resumo" dica="Uma ou duas linhas. Aparece na lista e no cartão da faixa do início.">
        <Texto valor={postagem.resumo} linhas={2} aoMudar={(resumo) => troca({ resumo })} />
      </Campo>

      <div className="dupla">
        <Campo rotulo="Data">
          <input
            className="campo__linha"
            type="date"
            value={postagem.data}
            onChange={(e) => troca({ data: e.target.value })}
          />
        </Campo>
        <Campo rotulo="Categoria">
          <select
            className="campo__linha"
            value={postagem.categoria}
            onChange={(e) => troca({ categoria: e.target.value as Postagem["categoria"] })}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {NOME_DA_CATEGORIA[c]}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo
        rotulo="Estampa"
        dica="Caminho de um arquivo em /public, como /padroeiros/neves-d5e531fa.webp. Sem ela a faixa mostra um quadro vazio."
      >
        <Linha valor={postagem.imagem ?? ""} aoMudar={(imagem) => troca({ imagem })} />
      </Campo>

      <label className="campo campo--inline">
        <input
          type="checkbox"
          checked={postagem.publicado !== false}
          onChange={(e) => troca({ publicado: e.target.checked })}
        />
        <span>Publicada (desmarcada, some do site inteiro)</span>
      </label>
      <label className="campo campo--inline">
        <input
          type="checkbox"
          checked={Boolean(postagem.rascunho)}
          onChange={(e) => troca({ rascunho: e.target.checked })}
        />
        <span>Texto provisório (mostra o aviso de rascunho)</span>
      </label>

      <h2 className="admin__h2">Corpo</h2>
      <ListaDeBlocos blocos={postagem.blocos} aoMudar={(blocos) => troca({ blocos })} />

      <div className="admin__perigo">
        <Botao aoClicar={aoRemover} variante="risco">
          Remover esta postagem
        </Botao>
      </div>
    </>
  );
}
