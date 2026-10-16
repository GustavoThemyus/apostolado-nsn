import type { TextoDaPagina } from "../data/tipos";
import { PADROES } from "../routes/padroes";
import { ROTAS } from "../routes/rotas";
import { Campo, Linha, Texto } from "./Campos";

/**
 * Os títulos e cabeçalhos de cada página.
 *
 * Aqui não se cria nem se apaga nada: a lista de páginas é a do site, e vem
 * de `padroes.ts`. Caminho novo exige página nova, que exige código. O que se
 * edita é o que o leitor lê no alto — e isso o Apostolado não alcançava, por
 * viver junto da tabela de rotas.
 *
 * As páginas aparecem agrupadas por seção, como no site, porque é assim que
 * quem edita as procura: ninguém pensa "quero mudar /indulgencias/raccolta",
 * pensa "quero mudar a Raccolta, que fica nas Indulgências".
 */
type Textos = Record<string, TextoDaPagina>;

/** A seção de topo a que o caminho pertence, para agrupar a lista. */
function secaoDe(caminho: string): string {
  const raiz = ROTAS.find((r) => r.padrao === caminho)?.pai ?? caminho;
  if (raiz === "/") return "Página inicial";
  return ROTAS.find((r) => r.padrao === raiz)?.titulo ?? raiz;
}

export function EditorDePaginas({
  conteudo,
  aoMudar,
}: {
  conteudo: Textos;
  aoMudar: (c: Textos) => void;
}) {
  const grupos = new Map<string, string[]>();
  for (const caminho of PADROES) {
    const secao = secaoDe(caminho);
    (grupos.get(secao) ?? grupos.set(secao, []).get(secao)!).push(caminho);
  }

  const trocar = (caminho: string, parte: Partial<TextoDaPagina>) =>
    aoMudar({ ...conteudo, [caminho]: { ...conteudo[caminho], ...parte } });

  return (
    <>
      <p className="admin__ajuda admin__ajuda--atencao">
        Isto é o que cada página mostra no alto, e o que a seção mostra dela
        nos cartões. Mexe também no menu, nas migalhas e na prévia que aparece
        ao compartilhar o endereço no WhatsApp.
      </p>

      {[...grupos].map(([secao, caminhos]) => (
        <section className="escolha" key={secao}>
          <h2 className="admin__h2">{secao}</h2>
          {caminhos.map((caminho) => {
            const texto = conteudo[caminho] ?? { titulo: "" };
            return (
              <article className="bloco-edit" key={caminho}>
                <header className="bloco-edit__topo">
                  <span className="bloco-edit__tipo">{caminho}</span>
                </header>

                <Campo rotulo="Título" dica="Vai para a aba do navegador, o cabeçalho e as migalhas.">
                  <Linha valor={texto.titulo} aoMudar={(titulo) => trocar(caminho, { titulo })} />
                </Campo>

                <Campo
                  rotulo="Título curto"
                  dica="Onde o inteiro não cabe: a barra do alto e os atalhos da seção. Vazio, usa o título."
                >
                  <Linha
                    valor={texto.curto ?? ""}
                    aoMudar={(curto) => trocar(caminho, { curto: curto || undefined })}
                  />
                </Campo>

                <Campo
                  rotulo="Descrição"
                  dica="Uma linha. Aparece abaixo do título, no cartão da seção e na prévia ao compartilhar."
                >
                  <Texto
                    valor={texto.descricao ?? ""}
                    linhas={2}
                    marcacao={false}
                    aoMudar={(descricao) => trocar(caminho, { descricao: descricao || undefined })}
                  />
                </Campo>

                <Campo
                  rotulo="Chamada"
                  dica="A linha em versalete dourado acima do título. Vazia, a página herda a da seção; sem essa, a do site."
                >
                  <Texto
                    valor={texto.chamada ?? ""}
                    linhas={2}
                    marcacao={false}
                    aoMudar={(chamada) => trocar(caminho, { chamada: chamada || undefined })}
                  />
                </Campo>

                <Campo
                  rotulo="Estampa"
                  dica="Caminho de um arquivo em /public. Vale para a seção inteira: as filhas herdam."
                >
                  <Linha
                    valor={texto.imagem ?? ""}
                    aoMudar={(imagem) => trocar(caminho, { imagem: imagem || undefined })}
                  />
                </Campo>
              </article>
            );
          })}
        </section>
      ))}
    </>
  );
}
