import { useState } from "react";
import type { Bloco } from "../data/tipos";
import type { Aviso } from "../components/Mural";
import type { Contribuicao } from "../components/Contribuir";
import type { Padroeiro } from "../components/Padroeiros";
import { Botao, Campo, Linha } from "./Campos";
import { ListaDeBlocos } from "./EditorDeDocumento";
import { mover } from "./mover";

/**
 * A página inicial.
 *
 * É a que mais muda de semana para semana, por causa do mural: por isso os
 * avisos vêm primeiro, antes da apresentação e dos padroeiros, que mudam uma
 * vez por ano.
 */
export interface PaginaInicial {
  titulo: string;
  descricao: string;
  avisos: Aviso[];
  sobre: { titulo: string; emPreparacao?: boolean; blocos: Bloco[] };
  contribuicao: Contribuicao;
  padroeiros: Padroeiro[];
}

const hoje = () => new Date().toISOString().slice(0, 10);

export function EditorDeInicio({
  conteudo,
  aoMudar,
}: {
  conteudo: PaginaInicial;
  aoMudar: (c: PaginaInicial) => void;
}) {
  const [aviso, definirAviso] = useState<string | null>(null);
  const aberto = conteudo.avisos.find((a) => a.id === aviso) ?? null;

  const trocarAvisos = (avisos: Aviso[]) => aoMudar({ ...conteudo, avisos });

  if (aberto) {
    return (
      <>
        <button
          type="button"
          className="admin__voltar admin__voltar--corpo"
          onClick={() => definirAviso(null)}
        >
          ← a página inicial
        </button>
        <Campo rotulo="Título do aviso">
          <Linha
            valor={aberto.titulo}
            aoMudar={(titulo) =>
              trocarAvisos(conteudo.avisos.map((a) => (a.id === aberto.id ? { ...a, titulo } : a)))
            }
          />
        </Campo>
        <Campo
          rotulo="Some depois de"
          dica="O aviso desaparece sozinho passada esta data. Deixe vazio para ficar até alguém apagar."
        >
          <input
            className="campo__linha"
            type="date"
            value={aberto.ate ?? ""}
            onChange={(e) =>
              trocarAvisos(
                conteudo.avisos.map((a) =>
                  a.id === aberto.id ? { ...a, ate: e.target.value || undefined } : a,
                ),
              )
            }
          />
        </Campo>
        <h2 className="admin__h2">Texto do aviso</h2>
        <ListaDeBlocos
          blocos={aberto.blocos}
          aoMudar={(blocos) =>
            trocarAvisos(conteudo.avisos.map((a) => (a.id === aberto.id ? { ...a, blocos } : a)))
          }
        />
        <div className="admin__perigo">
          <Botao
            variante="risco"
            aoClicar={() => {
              trocarAvisos(conteudo.avisos.filter((a) => a.id !== aberto.id));
              definirAviso(null);
            }}
          >
            Remover este aviso
          </Botao>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="admin__h2">Mural de avisos</h2>
      <p className="admin__ajuda">
        O que aparece no alto da página inicial. Cada aviso pode ter uma data
        de validade e sumir sozinho, para o mural não ficar com recado velho.
      </p>
      <ol className="admin__secoes">
        {conteudo.avisos.map((a, i) => (
          <li key={a.id}>
            <button type="button" className="admin__secao" onClick={() => definirAviso(a.id)}>
              <span className="admin__secao-num">{i + 1}</span>
              <span className="admin__secao-nome">
                {a.titulo || "sem título"}
                {a.ate && a.ate < hoje() && <span className="escolha__falta">vencido</span>}
              </span>
              <span className="admin__secao-conta">{a.ate ? `até ${a.ate}` : "sem prazo"}</span>
            </button>
            <div className="admin__secao-acoes">
              <Botao aoClicar={() => trocarAvisos(mover(conteudo.avisos, i, -1))} titulo="Subir">↑</Botao>
              <Botao aoClicar={() => trocarAvisos(mover(conteudo.avisos, i, 1))} titulo="Descer">↓</Botao>
            </div>
          </li>
        ))}
      </ol>
      <Botao
        variante="forte"
        aoClicar={() => {
          const id = `aviso-${Date.now().toString(36)}`;
          trocarAvisos([...conteudo.avisos, { id, titulo: "Novo aviso", blocos: [] }]);
          definirAviso(id);
        }}
      >
        + novo aviso
      </Botao>

      <h2 className="admin__h2">O que é o Apostolado</h2>
      <Campo rotulo="Título do bloco">
        <Linha
          valor={conteudo.sobre.titulo}
          aoMudar={(titulo) => aoMudar({ ...conteudo, sobre: { ...conteudo.sobre, titulo } })}
        />
      </Campo>
      <label className="campo campo--inline">
        <input
          type="checkbox"
          checked={Boolean(conteudo.sobre.emPreparacao)}
          onChange={(e) =>
            aoMudar({ ...conteudo, sobre: { ...conteudo.sobre, emPreparacao: e.target.checked } })
          }
        />
        <span>Ainda por escrever (mostra o aviso no lugar do texto)</span>
      </label>
      <ListaDeBlocos
        blocos={conteudo.sobre.blocos}
        aoMudar={(blocos) => aoMudar({ ...conteudo, sobre: { ...conteudo.sobre, blocos } })}
      />

      <h2 className="admin__h2">Contribuição</h2>
      <p className="admin__ajuda">
        Confira dígito por dígito antes de salvar: erro em conta bancária manda
        o dinheiro de quem confia no site para a conta de outra pessoa.
      </p>
      <Campo rotulo="Título">
        <Linha
          valor={conteudo.contribuicao.titulo}
          aoMudar={(titulo) =>
            aoMudar({ ...conteudo, contribuicao: { ...conteudo.contribuicao, titulo } })
          }
        />
      </Campo>
      <Campo rotulo="Chave Pix">
        <Linha
          valor={conteudo.contribuicao.pix}
          aoMudar={(pix) =>
            aoMudar({ ...conteudo, contribuicao: { ...conteudo.contribuicao, pix } })
          }
        />
      </Campo>
      <div className="dupla">
        {(["instituicao", "agencia", "conta", "titular"] as const).map((campo) => (
          <Campo rotulo={campo[0].toUpperCase() + campo.slice(1)} key={campo}>
            <Linha
              valor={conteudo.contribuicao.banco[campo]}
              aoMudar={(v) =>
                aoMudar({
                  ...conteudo,
                  contribuicao: {
                    ...conteudo.contribuicao,
                    banco: { ...conteudo.contribuicao.banco, [campo]: v },
                  },
                })
              }
            />
          </Campo>
        ))}
      </div>

      <h2 className="admin__h2">Padroeiros</h2>
      {conteudo.padroeiros.map((p, i) => (
        <article className="bloco-edit" key={p.id}>
          <header className="bloco-edit__topo">
            <span className="bloco-edit__tipo">{p.nome || "sem nome"}</span>
            <div className="bloco-edit__acoes">
              <Botao aoClicar={() => aoMudar({ ...conteudo, padroeiros: mover(conteudo.padroeiros, i, -1) })} titulo="Subir">↑</Botao>
              <Botao aoClicar={() => aoMudar({ ...conteudo, padroeiros: mover(conteudo.padroeiros, i, 1) })} titulo="Descer">↓</Botao>
            </div>
          </header>
          <Campo rotulo="Nome">
            <Linha
              valor={p.nome}
              aoMudar={(nome) =>
                aoMudar({
                  ...conteudo,
                  padroeiros: conteudo.padroeiros.map((x, k) => (k === i ? { ...x, nome } : x)),
                })
              }
            />
          </Campo>
          <Campo rotulo="O que é para o Apostolado">
            <Linha
              valor={p.descricao ?? ""}
              aoMudar={(descricao) =>
                aoMudar({
                  ...conteudo,
                  padroeiros: conteudo.padroeiros.map((x, k) => (k === i ? { ...x, descricao } : x)),
                })
              }
            />
          </Campo>
          <Campo rotulo="Estampa" dica="Caminho em /public. Vazio esconde o quadro em vez de mostrá-lo vazio.">
            <Linha
              valor={p.imagem}
              aoMudar={(imagem) =>
                aoMudar({
                  ...conteudo,
                  padroeiros: conteudo.padroeiros.map((x, k) => (k === i ? { ...x, imagem } : x)),
                })
              }
            />
          </Campo>
        </article>
      ))}
    </>
  );
}
