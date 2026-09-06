import { NOME_DA_ETIQUETA } from "../data/tipos";
import type { Bloco, Etiqueta } from "../data/tipos";
import { Botao, Campo, Linha, ListaDeTextos, Texto } from "./Campos";
import { ROTULO } from "./tiposDeBloco";

interface Props {
  bloco: Bloco;
  aoMudar: (b: Bloco) => void;
  aoRemover: () => void;
  aoMover: (passo: number) => void;
  children?: React.ReactNode;
}

const ETIQUETAS: Etiqueta[] = ["ordinario", "proprio", "variavel", "comum"];

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

      {(bloco.tipo === "paragrafo" || bloco.tipo === "rubrica") && (
        <Campo rotulo="Texto">
          <Texto valor={bloco.texto} aoMudar={(texto) => troca({ texto })} linhas={4} />
        </Campo>
      )}

      {bloco.tipo === "subtitulo" && (
        <Campo rotulo="Título do tópico">
          <Linha valor={bloco.texto} aoMudar={(texto) => troca({ texto })} />
        </Campo>
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
            <Campo rotulo="Número">
              <input className="campo__linha" type="number" min={1} value={bloco.numero}
                onChange={(e) => troca({ numero: Number(e.target.value) })} />
            </Campo>
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
