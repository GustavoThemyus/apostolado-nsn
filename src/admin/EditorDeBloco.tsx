import { NOME_DA_ETIQUETA } from "../data/tipos";
import type { Bloco, Etiqueta } from "../data/tipos";
import { Botao, Campo, Linha, ListaDeTextos, Texto } from "./Campos";
import { ROTULO, novoId } from "./tiposDeBloco";

interface Props {
  bloco: Bloco;
  aoMudar: (b: Bloco) => void;
  aoRemover: () => void;
  aoMover: (passo: number) => void;
  children?: React.ReactNode;
}

const ETIQUETAS: Etiqueta[] = ["ordinario", "proprio", "variavel", "comum"];

/**
 * As faixas de um bloco bilíngue, emparelhadas, ou null quando não dá.
 *
 * O modelo guarda duas listas de blocos, e não uma lista de pares: é isso que
 * deixa o subgrid casar cada parágrafo do latim com a altura do seu par. Mas
 * a página só casa se as duas listas tiverem o mesmo tamanho, e por isso
 * `conteudo.teste.ts` o exige.
 *
 * Daí editar em par, e não cada coluna por si. Uma oração salva pelo painel
 * com três parágrafos de latim para dois de tradução não daria erro nenhum ao
 * salvar: sairia desencontrada na folha publicada, e o teste só acusaria
 * depois. Em par, a conta não tem como não fechar.
 *
 * Nas 490 faixas que existem hoje — as dos folhetos e as do Enchiridion —
 * os dois lados são sempre parágrafo. Se alguma trouxer outra coisa, o editor
 * se recusa a mexer no bloco em vez de achatá-la.
 */
function faixasDe(latim: Bloco[], portugues: Bloco[]): { la: string; pt: string }[] | null {
  if (latim.length !== portugues.length) return null;
  const textos = (lado: Bloco[]): string[] | null => {
    const saida: string[] = [];
    for (const b of lado) {
      if (b.tipo !== "paragrafo") return null;
      saida.push(b.texto);
    }
    return saida;
  };
  const la = textos(latim);
  const pt = textos(portugues);
  if (!la || !pt) return null;
  return la.map((texto, i) => ({ la: texto, pt: pt[i] }));
}

/** O parágrafo de volta, guardando o id que ele já tinha. */
const comTexto = (antigo: Bloco | undefined, texto: string): Bloco =>
  antigo && antigo.tipo === "paragrafo"
    ? { ...antigo, texto }
    : { id: novoId("faixa"), tipo: "paragrafo", texto };

export function EditorDeBloco({ bloco, aoMudar, aoRemover, aoMover, children }: Props) {
  const troca = (parte: Partial<Bloco>) => aoMudar({ ...bloco, ...parte } as Bloco);

  return (
    <article className="bloco-edit">
      <header className="bloco-edit__topo">
        <span className="bloco-edit__tipo">{ROTULO[bloco.tipo]}</span>
        <div className="bloco-edit__acoes">
          <Botao aoClicar={() => aoMover(-1)} titulo="Subir">↑</Botao>
          <Botao aoClicar={() => aoMover(1)} titulo="Descer">↓</Botao>
          <Botao aoClicar={aoRemover} variante="risco" titulo="Remover bloco">Remover</Botao>
        </div>
      </header>

      {(bloco.tipo === "paragrafo" || bloco.tipo === "rubrica" || bloco.tipo === "assembleia") && (
        <Campo rotulo="Texto">
          <Texto valor={bloco.texto} aoMudar={(texto) => troca({ texto })} linhas={4} />
        </Campo>
      )}

      {bloco.tipo === "subtitulo" && (
        <>
          <Campo rotulo="Título do tópico">
            <Linha valor={bloco.texto} aoMudar={(texto) => troca({ texto })} />
          </Campo>
          <Campo
            rotulo="Âncora"
            dica="Nome curto e sem acento. É o que faz o sumário e o índice apontarem para aqui. Mudar quebra os links já feitos."
          >
            <Linha valor={bloco.ancora ?? ""} aoMudar={(ancora) => troca({ ancora })} />
          </Campo>
          <label className="campo campo--inline">
            <input
              type="checkbox"
              checked={bloco.menor ?? false}
              onChange={(e) => troca({ menor: e.target.checked })}
            />
            <span>Tópico menor, fora do sumário</span>
          </label>
        </>
      )}

      {bloco.tipo === "lista" && (
        <>
          <label className="campo campo--inline">
            <input
              type="checkbox"
              checked={Boolean(bloco.ordenada)}
              onChange={(e) => troca({ ordenada: e.target.checked })}
            />
            <span>Numerada</span>
          </label>
          <ListaDeTextos rotulo="Itens" itens={bloco.itens} aoMudar={(itens) => troca({ itens })} />
        </>
      )}

      {bloco.tipo === "oracao" && (
        <div className="lista-edit">
          <span className="campo__rotulo">Versos</span>
          {bloco.versos.map((v, i) => (
            <div className="verso-edit" key={i}>
              <Campo rotulo="Latim">
                <Texto valor={v.latim ?? ""} aoMudar={(latim) =>
                  troca({ versos: bloco.versos.map((x, k) => (k === i ? { ...x, latim } : x)) })} linhas={2} marcacao={false} />
              </Campo>
              <Campo rotulo="Português">
                <Texto valor={v.portugues ?? ""} aoMudar={(portugues) =>
                  troca({ versos: bloco.versos.map((x, k) => (k === i ? { ...x, portugues } : x)) })} linhas={2} marcacao={false} />
              </Campo>
              <Botao aoClicar={() => troca({ versos: bloco.versos.filter((_, k) => k !== i) })} variante="risco">
                Remover verso
              </Botao>
            </div>
          ))}
          <Botao aoClicar={() => troca({ versos: [...bloco.versos, { latim: "", portugues: "" }] })}>
            + verso
          </Botao>
        </div>
      )}

      {bloco.tipo === "bilingue" &&
        (() => {
          const faixas = faixasDe(bloco.latim, bloco.portugues);
          if (!faixas) {
            return (
              <p className="admin__ajuda admin__ajuda--atencao">
                Este bloco tem {bloco.latim.length}{" "}
                {bloco.latim.length === 1 ? "faixa" : "faixas"} de latim para{" "}
                {bloco.portugues.length} de tradução, ou alguma que não é parágrafo
                simples. O painel não mexe nele para não desencontrar as duas colunas.
              </p>
            );
          }
          const escrever = (novas: { la: string; pt: string }[]) =>
            troca({
              latim: novas.map((f, i) => comTexto(bloco.latim[i], f.la)),
              portugues: novas.map((f, i) => comTexto(bloco.portugues[i], f.pt)),
            });
          return (
            <div className="lista-edit">
              <span className="campo__rotulo">Faixas</span>
              <span className="campo__dica">
                Cada faixa é um parágrafo de latim ao lado do seu par em português. Na
                tela estreita elas voltam a ficar empilhadas, uma embaixo da outra.
              </span>
              {faixas.map((faixa, i) => (
                <div className="verso-edit" key={bloco.latim[i]?.id ?? i}>
                  <Campo rotulo="Latim">
                    <Texto
                      valor={faixa.la}
                      linhas={4}
                      aoMudar={(la) =>
                        escrever(faixas.map((x, k) => (k === i ? { ...x, la } : x)))
                      }
                    />
                  </Campo>
                  <Campo rotulo="Português">
                    <Texto
                      valor={faixa.pt}
                      linhas={4}
                      aoMudar={(pt) =>
                        escrever(faixas.map((x, k) => (k === i ? { ...x, pt } : x)))
                      }
                    />
                  </Campo>
                  <Botao
                    aoClicar={() => escrever(faixas.filter((_, k) => k !== i))}
                    variante="risco"
                  >
                    Remover esta faixa
                  </Botao>
                </div>
              ))}
              <Botao aoClicar={() => escrever([...faixas, { la: "", pt: "" }])}>
                + faixa
              </Botao>
            </div>
          );
        })()}

      {bloco.tipo === "nota" && (
        <>
          <Campo rotulo="Título da nota">
            <Linha valor={bloco.titulo} aoMudar={(titulo) => troca({ titulo })} />
          </Campo>
          <label className="campo campo--inline">
            <input type="checkbox" checked={Boolean(bloco.alerta)}
              onChange={(e) => troca({ alerta: e.target.checked })} />
            <span>Caixa de alerta (barra vermelha)</span>
          </label>
          <ListaDeTextos rotulo="Parágrafos" itens={bloco.paragrafos}
            aoMudar={(paragrafos) => troca({ paragrafos })} />
        </>
      )}

      {bloco.tipo === "tabela" && (
        <>
          <ListaDeTextos rotulo="Colunas" itens={bloco.colunas} aoMudar={(colunas) =>
            troca({
              colunas,
              linhas: bloco.linhas.map((l) => {
                const c = [...l];
                c.length = colunas.length;
                return Array.from(c, (x) => x ?? "");
              }),
            })} />
          <div className="lista-edit">
            <span className="campo__rotulo">Linhas</span>
            {bloco.linhas.map((linha, i) => (
              <div className="linha-edit" key={i}>
                {linha.map((celula, j) => (
                  <Campo rotulo={bloco.colunas[j] || `Coluna ${j + 1}`} key={j}>
                    <Texto valor={celula} linhas={2} aoMudar={(v) =>
                      troca({ linhas: bloco.linhas.map((l, k) => k === i ? l.map((c, m) => (m === j ? v : c)) : l) })} />
                  </Campo>
                ))}
                <Botao aoClicar={() => troca({ linhas: bloco.linhas.filter((_, k) => k !== i) })} variante="risco">
                  Remover linha
                </Botao>
              </div>
            ))}
            <Botao aoClicar={() => troca({ linhas: [...bloco.linhas, bloco.colunas.map(() => "")] })}>
              + linha
            </Botao>
          </div>
        </>
      )}

      {bloco.tipo === "legenda" && (
        <div className="lista-edit">
          <span className="campo__rotulo">Chaves</span>
          {bloco.itens.map((item, i) => (
            <div className="verso-edit" key={i}>
              <Campo rotulo="Chave">
                <Linha valor={item.chave} aoMudar={(chave) =>
                  troca({ itens: bloco.itens.map((x, k) => (k === i ? { ...x, chave } : x)) })} />
              </Campo>
              <Campo rotulo="Etiqueta">
                <select className="campo__linha" value={item.etiqueta} onChange={(e) =>
                  troca({ itens: bloco.itens.map((x, k) => k === i ? { ...x, etiqueta: e.target.value as Etiqueta } : x) })}>
                  {ETIQUETAS.map((et) => <option key={et} value={et}>{NOME_DA_ETIQUETA[et]}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Texto">
                <Texto valor={item.texto} linhas={2} aoMudar={(texto) =>
                  troca({ itens: bloco.itens.map((x, k) => (k === i ? { ...x, texto } : x)) })} />
              </Campo>
              <Botao aoClicar={() => troca({ itens: bloco.itens.filter((_, k) => k !== i) })} variante="risco">
                Remover chave
              </Botao>
            </div>
          ))}
          <Botao aoClicar={() => troca({ itens: [...bloco.itens, { chave: "", etiqueta: "ordinario", texto: "" }] })}>
            + chave
          </Botao>
        </div>
      )}

      {bloco.tipo === "passo" && (
        <>
          <div className="dupla">
            <Campo rotulo="Etiqueta">
              <select className="campo__linha" value={bloco.etiqueta}
                onChange={(e) => troca({ etiqueta: e.target.value as Etiqueta })}>
                {ETIQUETAS.map((et) => <option key={et} value={et}>{NOME_DA_ETIQUETA[et]}</option>)}
              </select>
            </Campo>
          </div>
          <Campo rotulo="Título">
            <Linha valor={bloco.titulo} aoMudar={(titulo) => troca({ titulo })} />
          </Campo>
          <Campo rotulo="Título em latim" dica="Aparece em itálico, ao lado do título.">
            <Linha valor={bloco.tituloLatim ?? ""} aoMudar={(tituloLatim) => troca({ tituloLatim })} />
          </Campo>
          {children}
        </>
      )}
    </article>
  );
}
