import type { Retrato, Site } from "../data/tipos";
import { Botao, Campo, Linha, ListaDeTextos, Texto } from "./Campos";
import { mover } from "./mover";

/**
 * A identidade do site: o que aparece em toda página.
 *
 * Mexer aqui mexe nas dezoito páginas de uma vez, e por isso o editor avisa
 * disso no alto em vez de parecer mais um formulário.
 */
export function EditorDeSite({
  conteudo,
  aoMudar,
}: {
  conteudo: Site;
  aoMudar: (c: Site) => void;
}) {
  const troca = (parte: Partial<Site>) => aoMudar({ ...conteudo, ...parte });

  return (
    <>
      <p className="admin__ajuda admin__ajuda--atencao">
        Isto aparece em todas as páginas do site. Um erro aqui aparece em
        dezoito lugares de uma vez.
      </p>

      <Campo rotulo="Nome do Apostolado" dica="Por extenso, no rodapé e no cabeçalho.">
        <Linha valor={conteudo.marca} aoMudar={(marca) => troca({ marca })} />
      </Campo>
      <Campo rotulo="Sigla" dica="Onde o nome inteiro não cabe.">
        <Linha valor={conteudo.marcaCurta} aoMudar={(marcaCurta) => troca({ marcaCurta })} />
      </Campo>
      <Campo rotulo="Lema" dica="Em latim, abaixo do nome.">
        <Linha valor={conteudo.lema} aoMudar={(lema) => troca({ lema })} />
      </Campo>
      <Campo rotulo="Chamada" dica="A linha em versalete dourado acima do título de cada página.">
        <Linha valor={conteudo.chamada} aoMudar={(chamada) => troca({ chamada })} />
      </Campo>

      <ListaDeTextos
        rotulo="Linhas do rodapé"
        itens={conteudo.rodape}
        aoMudar={(rodape) => troca({ rodape })}
      />

      <Campo
        rotulo="Crédito de quem fez o site"
        dica="Última linha do rodapé. Vazio, a linha some."
      >
        <Texto
          valor={conteudo.credito ?? ""}
          linhas={2}
          aoMudar={(credito) => troca({ credito: credito || undefined })}
        />
      </Campo>

      <h2 className="admin__h2">Calendários do Google</h2>
      <p className="admin__ajuda">
        Os {conteudo.agendas.length} calendários que o visitante pode vincular
        ao celular continuam no site e não se mexem por aqui: trocar um
        identificador errado deixa o botão de vincular quebrado sem aviso
        nenhum, e já aconteceu de uma mudança de conta apagar os anexos do
        Ordo. Para acrescentar ou trocar um, peça a quem cuida do site.
      </p>

      <h2 className="admin__h2">Retratos da lateral</h2>
      <p className="admin__ajuda">
        Aparecem na coluna lateral, só no computador. Estampa vazia esconde o
        retrato em vez de mostrar um quadro vazio em toda página.
      </p>
      {(conteudo.lateral ?? []).map((r, i) => (
        <article className="bloco-edit" key={r.id}>
          <header className="bloco-edit__topo">
            <span className="bloco-edit__tipo">{r.nome || "sem nome"}</span>
            <div className="bloco-edit__acoes">
              <Botao aoClicar={() => troca({ lateral: mover(conteudo.lateral ?? [], i, -1) })} titulo="Subir">↑</Botao>
              <Botao aoClicar={() => troca({ lateral: mover(conteudo.lateral ?? [], i, 1) })} titulo="Descer">↓</Botao>
            </div>
          </header>
          {(
            [
              ["titulo", "Ofício"],
              ["nome", "Quem"],
              ["imagem", "Estampa"],
            ] as const
          ).map(([campo, rotulo]) => (
            <Campo rotulo={rotulo} key={campo}>
              <Linha
                valor={r[campo]}
                aoMudar={(v) =>
                  troca({
                    lateral: (conteudo.lateral ?? []).map((x: Retrato, k) =>
                      k === i ? { ...x, [campo]: v } : x,
                    ),
                  })
                }
              />
            </Campo>
          ))}
        </article>
      ))}
    </>
  );
}
