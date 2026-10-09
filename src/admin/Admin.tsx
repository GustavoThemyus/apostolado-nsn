import { porId } from "../data/registro";
import type { ColecaoDePostagens, Conteudo, Site } from "../data/tipos";
import { usarParametros, usarRota } from "../routes/usarRota";
import { Botao } from "./Campos";
import { EditorDeDocumento } from "./EditorDeDocumento";
import { EditorDeInicio, type PaginaInicial } from "./EditorDeInicio";
import { EditorDePostagens } from "./EditorDePostagens";
import { EditorDeSite } from "./EditorDeSite";
import { Escolha } from "./Escolha";
import { usarDocumento } from "./usarDocumento";
import "../styles/admin.css";

/**
 * O painel.
 *
 * `/admin` lista o que dá para editar; `/admin/<id>` abre um documento. O id
 * vem da rota, e não de um estado interno, para o endereço poder ser guardado
 * nos favoritos e para o botão voltar do navegador funcionar.
 *
 * Quem decide o que cada id é, e onde ele mora no repositório, é o registro —
 * aqui e, principalmente, no Worker. O painel manda só o id: aceitar um
 * caminho vindo do navegador daria escrita em qualquer arquivo, e o
 * repositório publica sozinho.
 */
export function Admin() {
  const { navegar } = usarRota();
  const { documento } = usarParametros();

  if (!documento) {
    return (
      <Moldura>
        <Escolha aoAbrir={(id) => navegar(`/admin/${id}`)} />
      </Moldura>
    );
  }
  return <Documento id={documento} aoVoltar={() => navegar("/admin")} />;
}

function Documento({ id, aoVoltar }: { id: string; aoVoltar: () => void }) {
  const registro = porId(id);
  const { conteudo, estado, recado, quem, sujo, mudar, salvar } = usarDocumento<unknown>(id);

  if (!registro) {
    return (
      <Moldura aoVoltar={aoVoltar}>
        <p className="admin__recado admin__recado--erro">
          Não existe documento com o id “{id}”.
        </p>
      </Moldura>
    );
  }

  return (
    <Moldura
      titulo={registro.titulo}
      aoVoltar={aoVoltar}
      quem={quem}
      sujo={sujo}
      acao={
        <Botao aoClicar={salvar} variante="forte">
          {estado === "salvando" ? "Salvando…" : sujo ? "Salvar" : "Salvo"}
        </Botao>
      }
      recado={recado}
      erro={estado === "erro"}
    >
      {conteudo === null ? (
        <p className="admin__ajuda">{estado === "lendo" ? "Abrindo…" : ""}</p>
      ) : registro.forma === "documento" ? (
        <EditorDeDocumento conteudo={conteudo as Conteudo} aoMudar={mudar} />
      ) : registro.forma === "postagens" ? (
        <EditorDePostagens conteudo={conteudo as ColecaoDePostagens} aoMudar={mudar} />
      ) : registro.forma === "inicio" ? (
        <EditorDeInicio conteudo={conteudo as PaginaInicial} aoMudar={mudar} />
      ) : registro.forma === "site" ? (
        <EditorDeSite conteudo={conteudo as Site} aoMudar={mudar} />
      ) : (
        <p className="admin__ajuda">
          Esta forma de documento ainda não tem editor no painel.
        </p>
      )}
    </Moldura>
  );
}

function Moldura({
  titulo = "Administração",
  children,
  aoVoltar,
  quem,
  sujo,
  acao,
  recado,
  erro,
}: {
  titulo?: string;
  children: React.ReactNode;
  aoVoltar?: () => void;
  quem?: string;
  sujo?: boolean;
  acao?: React.ReactNode;
  recado?: string;
  erro?: boolean;
}) {
  return (
    <div className="admin">
      <header className="admin__barra">
        {aoVoltar ? (
          <button type="button" className="admin__voltar" onClick={aoVoltar}>
            ← painel
          </button>
        ) : (
          <a className="admin__voltar" href="/">
            ← site
          </a>
        )}
        <span className="admin__titulo">
          {titulo}
          {sujo && <span className="admin__sujo" title="Há coisa por salvar">•</span>}
        </span>
        {quem && <span className="admin__quem">{quem}</span>}
        {acao}
      </header>

      {recado && (
        <p className={`admin__recado${erro ? " admin__recado--erro" : ""}`}>{recado}</p>
      )}

      <main className="admin__corpo">{children}</main>
    </div>
  );
}
