import { useCallback, useEffect, useMemo, useState } from "react";
import { guia as guiaEmbutido } from "../data/guia";
import type { Bloco, Guia, Secao } from "../data/tipos";
import { Botao, Campo, Linha, Texto } from "./Campos";
import { EditorDeBloco } from "./EditorDeBloco";
import { TIPOS, blocoVazio, novoId, type NomeDeTipo } from "./tiposDeBloco";
import "../styles/admin.css";

type Estado = "lendo" | "pronto" | "salvando" | "salvo" | "erro";

function mover<T>(lista: T[], i: number, passo: number): T[] {
  const j = i + passo;
  if (j < 0 || j >= lista.length) return lista;
  const c = [...lista];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
}

export function Admin() {
  const [guia, definirGuia] = useState<Guia>(guiaEmbutido);
  const [secaoAberta, definirSecaoAberta] = useState<string | null>(null);
  const [estado, definirEstado] = useState<Estado>("lendo");
  const [recado, definirRecado] = useState("");
  const [quem, definirQuem] = useState<string>("");
  const [sujo, definirSujo] = useState(false);
  /**
   * Sha do arquivo como ele estava quando abrimos. É o que permite detectar
   * que outra pessoa salvou no meio: sem ele, duas abas se sobrescrevem.
   */
  const [sha, definirSha] = useState<string | null>(null);

  // busca a versão publicada; se a API ainda não existe, segue com a embutida
  useEffect(() => {
    let vivo = true;
    fetch("/api/conteudo?documento=guia")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { conteudo: Guia; sha?: string; quem?: string }) => {
        if (!vivo) return;
        if (d.conteudo) definirGuia(d.conteudo);
        if (d.sha) definirSha(d.sha);
        if (d.quem) definirQuem(d.quem);
        definirEstado("pronto");
      })
      .catch(() => {
        if (!vivo) return;
        definirEstado("pronto");
        definirRecado(
          "A API não respondeu. Dá para olhar, mas não dá para salvar: recarregue quando o acesso estiver de pé."
        );
      });
    return () => { vivo = false; };
  }, []);

  useEffect(() => {
    const aoSair = (e: BeforeUnloadEvent) => {
      if (sujo) e.preventDefault();
    };
    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, [sujo]);

  const atual = useMemo(
    () => guia.secoes.find((s) => s.id === secaoAberta) ?? null,
    [guia, secaoAberta]
  );

  const trocarSecao = useCallback((nova: Secao) => {
    definirGuia((g) => ({ ...g, secoes: g.secoes.map((s) => (s.id === nova.id ? nova : s)) }));
    definirSujo(true);
  }, []);

  const salvar = async () => {
    if (!sha) {
      definirEstado("erro");
      definirRecado("Sem contato com a API: recarregue o painel antes de salvar.");
      return;
    }
    definirEstado("salvando");
    definirRecado("");
    try {
      const r = await fetch("/api/conteudo?documento=guia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo: guia, sha }),
      });
      const d = (await r.json().catch(() => ({}))) as { erro?: string; sha?: string };
      if (!r.ok) throw new Error(d.erro ?? `erro ${r.status}`);
      // o sha do arquivo muda a cada gravação; guardar o novo para a próxima
      if (d.sha) definirSha(d.sha);
      definirEstado("salvo");
      definirSujo(false);
      definirRecado("Salvo. O site republica em um a dois minutos.");
    } catch (e) {
      definirEstado("erro");
      definirRecado(`Não salvou: ${e instanceof Error ? e.message : "erro desconhecido"}`);
    }
  };

  return (
    <div className="admin">
      <header className="admin__barra">
        <a className="admin__voltar" href="/">← Guia</a>
        <span className="admin__titulo">Administração</span>
        {quem && <span className="admin__quem">{quem}</span>}
        <Botao aoClicar={salvar} variante="forte">
          {estado === "salvando" ? "Salvando…" : "Salvar"}
        </Botao>
      </header>

      {recado && (
        <p className={`admin__recado${estado === "erro" ? " admin__recado--erro" : ""}`}>{recado}</p>
      )}

      <main className="admin__corpo">
        {!atual ? (
          <>
            <h1 className="admin__h1">Seções do guia</h1>
            <p className="admin__ajuda">
              Toque numa seção para editar seus blocos. Cada bloco tem um tipo:
              parágrafo, rubrica, oração, tabela e assim por diante.
            </p>
            <ol className="admin__secoes">
              {guia.secoes.map((s, i) => (
                <li key={s.id}>
                  <button type="button" className="admin__secao" onClick={() => definirSecaoAberta(s.id)}>
                    <span className="admin__secao-num">{i + 1}</span>
                    <span className="admin__secao-nome">{s.titulo}</span>
                    <span className="admin__secao-conta">{s.blocos.length} blocos</span>
                  </button>
                  <div className="admin__secao-acoes">
                    <Botao aoClicar={() => { definirGuia((g) => ({ ...g, secoes: mover(g.secoes, i, -1) })); definirSujo(true); }} titulo="Subir">↑</Botao>
                    <Botao aoClicar={() => { definirGuia((g) => ({ ...g, secoes: mover(g.secoes, i, 1) })); definirSujo(true); }} titulo="Descer">↓</Botao>
                  </div>
                </li>
              ))}
            </ol>
            <Botao
              aoClicar={() => {
                const id = novoId("secao");
                definirGuia((g) => ({
                  ...g,
                  secoes: [...g.secoes, { id, titulo: "Nova seção", blocos: [] }],
                }));
                definirSujo(true);
                definirSecaoAberta(id);
              }}
              variante="forte"
            >
              + nova seção
            </Botao>
          </>
        ) : (
          <EditorDeSecao
            secao={atual}
            aoMudar={trocarSecao}
            aoVoltar={() => definirSecaoAberta(null)}
            aoRemover={() => {
              definirGuia((g) => ({ ...g, secoes: g.secoes.filter((s) => s.id !== atual.id) }));
              definirSujo(true);
              definirSecaoAberta(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

function EditorDeSecao({
  secao, aoMudar, aoVoltar, aoRemover,
}: { secao: Secao; aoMudar: (s: Secao) => void; aoVoltar: () => void; aoRemover: () => void }) {
  const [criando, definirCriando] = useState(false);

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
        <Texto valor={secao.resumo ?? ""} linhas={2} aoMudar={(resumo) => aoMudar({ ...secao, resumo })} />
      </Campo>

      <h2 className="admin__h2">Blocos</h2>
      {secao.blocos.map((b, i) => (
        <EditorDeBloco
          key={b.id ?? i}
          bloco={b}
          aoMudar={(novo) => trocarBlocos(secao.blocos.map((x, k) => (k === i ? novo : x)))}
          aoRemover={() => trocarBlocos(secao.blocos.filter((_, k) => k !== i))}
          aoMover={(passo) => trocarBlocos(mover(secao.blocos, i, passo))}
        >
          {b.tipo === "passo" && (
            <BlocosAninhados
              blocos={b.corpo}
              aoMudar={(corpo) => trocarBlocos(secao.blocos.map((x, k) => (k === i ? { ...b, corpo } : x)))}
            />
          )}
        </EditorDeBloco>
      ))}

      {criando ? (
        <div className="admin__tipos">
          {TIPOS.map((t) => (
            <button
              type="button"
              className="admin__tipo"
              key={t.tipo}
              onClick={() => { trocarBlocos([...secao.blocos, blocoVazio(t.tipo)]); definirCriando(false); }}
            >
              <strong>{t.rotulo}</strong>
              <span>{t.descricao}</span>
            </button>
          ))}
          <Botao aoClicar={() => definirCriando(false)}>cancelar</Botao>
        </div>
      ) : (
        <Botao aoClicar={() => definirCriando(true)} variante="forte">+ novo bloco</Botao>
      )}

      <div className="admin__perigo">
        <Botao aoClicar={aoRemover} variante="risco">Remover esta seção inteira</Botao>
      </div>
    </>
  );
}

/** Blocos de dentro de um passo. Aceita os tipos simples, sem aninhar de novo. */
function BlocosAninhados({ blocos, aoMudar }: { blocos: Bloco[]; aoMudar: (b: Bloco[]) => void }) {
  const [criando, definirCriando] = useState(false);
  const simples = TIPOS.filter((t) => t.tipo !== "passo");
  return (
    <div className="aninhado">
      <span className="campo__rotulo">Corpo do passo</span>
      {blocos.map((b, i) => (
        <EditorDeBloco
          key={b.id ?? i}
          bloco={b}
          aoMudar={(novo) => aoMudar(blocos.map((x, k) => (k === i ? novo : x)))}
          aoRemover={() => aoMudar(blocos.filter((_, k) => k !== i))}
          aoMover={(passo) => aoMudar(mover(blocos, i, passo))}
        />
      ))}
      {criando ? (
        <div className="admin__tipos">
          {simples.map((t) => (
            <button type="button" className="admin__tipo" key={t.tipo}
              onClick={() => { aoMudar([...blocos, blocoVazio(t.tipo as NomeDeTipo)]); definirCriando(false); }}>
              <strong>{t.rotulo}</strong>
              <span>{t.descricao}</span>
            </button>
          ))}
          <Botao aoClicar={() => definirCriando(false)}>cancelar</Botao>
        </div>
      ) : (
        <Botao aoClicar={() => definirCriando(true)}>+ bloco no passo</Botao>
      )}
    </div>
  );
}
