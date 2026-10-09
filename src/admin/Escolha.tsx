import { REGISTRO, type DocumentoRegistrado } from "../data/registro";
import { ROTAS, SECOES_DO_MENU, rotaPorPadrao } from "../routes/rotas";
import { TEM_EDITOR } from "./formas";

/**
 * A lista do que dá para editar.
 *
 * Os grupos saem das próprias rotas, e não de uma segunda lista escrita à
 * mão: documento novo no registro aparece aqui sozinho, no grupo certo, e
 * ninguém precisa lembrar de atualizar duas coisas.
 */
const TOPO = "— o site inteiro —";

function grupoDe(doc: DocumentoRegistrado): string {
  if (!doc.rota || doc.rota === "/") return TOPO;
  const secao = SECOES_DO_MENU.find(
    (padrao) => padrao !== "/" && (doc.rota === padrao || doc.rota!.startsWith(`${padrao}/`)),
  );
  if (!secao) return TOPO;
  const r = rotaPorPadrao(secao);
  return r?.curto ?? r?.titulo ?? TOPO;
}

/** Na ordem do menu, com o que é do site inteiro por último. */
function agrupar(): [string, DocumentoRegistrado[]][] {
  const grupos = new Map<string, DocumentoRegistrado[]>();
  for (const doc of REGISTRO) {
    const g = grupoDe(doc);
    (grupos.get(g) ?? grupos.set(g, []).get(g)!).push(doc);
  }
  const ordem = SECOES_DO_MENU.map((p) => rotaPorPadrao(p)).map(
    (r) => r?.curto ?? r?.titulo ?? "",
  );
  return [...grupos.entries()].sort(
    (a, b) =>
      (a[0] === TOPO ? 99 : ordem.indexOf(a[0])) - (b[0] === TOPO ? 99 : ordem.indexOf(b[0])),
  );
}

export function Escolha({ aoAbrir }: { aoAbrir: (id: string) => void }) {
  return (
    <>
      <h1 className="admin__h1">O que você quer editar</h1>
      <p className="admin__ajuda">
        Cada item é uma parte do site. O que você salvar aqui vira uma gravação
        no repositório, com o seu nome, e o site republica em seguida.
      </p>

      {agrupar().map(([grupo, docs]) => (
        <section className="escolha" key={grupo}>
          <h2 className="admin__h2">{grupo}</h2>
          <ul className="escolha__lista">
            {docs.map((doc) => {
              const pronto = TEM_EDITOR.has(doc.forma);
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    className="escolha__item"
                    onClick={() => aoAbrir(doc.id)}
                    disabled={!pronto}
                  >
                    <span className="escolha__nome">
                      {doc.titulo}
                      {!pronto && <span className="escolha__falta">sem editor ainda</span>}
                    </span>
                    {doc.ajuda && <span className="escolha__ajuda">{doc.ajuda}</span>}
                  </button>
                  {doc.rota && ROTAS.some((r) => r.padrao === doc.rota) && (
                    <a
                      className="escolha__ver"
                      href={doc.rota}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      ver publicado ↗
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
