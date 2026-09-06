import type { ReactNode } from "react";

export function Campo({ rotulo, children, dica }: { rotulo: string; children: ReactNode; dica?: string }) {
  return (
    <label className="campo">
      <span className="campo__rotulo">{rotulo}</span>
      {children}
      {dica && <span className="campo__dica">{dica}</span>}
    </label>
  );
}

export function Texto({
  valor, aoMudar, linhas = 3, marcacao = true,
}: { valor: string; aoMudar: (v: string) => void; linhas?: number; marcacao?: boolean }) {
  return (
    <textarea
      className="campo__area"
      rows={linhas}
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      spellCheck
      placeholder={marcacao ? "Use [lat]latim[/lat], [b]destaque[/b], [i]itálico[/i]" : undefined}
    />
  );
}

export function Linha({ valor, aoMudar }: { valor: string; aoMudar: (v: string) => void }) {
  return <input className="campo__linha" value={valor} onChange={(e) => aoMudar(e.target.value)} />;
}

export function Botao({
  children, aoClicar, variante = "normal", titulo,
}: { children: ReactNode; aoClicar: () => void; variante?: "normal" | "risco" | "forte"; titulo?: string }) {
  return (
    <button type="button" className={`botao botao--${variante}`} onClick={aoClicar} title={titulo}>
      {children}
    </button>
  );
}

/** Lista de textos com acrescentar, remover e reordenar. */
export function ListaDeTextos({
  itens, aoMudar, rotulo,
}: { itens: string[]; aoMudar: (v: string[]) => void; rotulo: string }) {
  const trocar = (i: number, v: string) => aoMudar(itens.map((x, k) => (k === i ? v : x)));
  const mover = (i: number, passo: number) => {
    const j = i + passo;
    if (j < 0 || j >= itens.length) return;
    const c = [...itens];
    [c[i], c[j]] = [c[j], c[i]];
    aoMudar(c);
  };
  return (
    <div className="lista-edit">
      <span className="campo__rotulo">{rotulo}</span>
      {itens.map((item, i) => (
        <div className="lista-edit__item" key={i}>
          <textarea
            className="campo__area"
            rows={2}
            value={item}
            onChange={(e) => trocar(i, e.target.value)}
          />
          <div className="lista-edit__acoes">
            <Botao aoClicar={() => mover(i, -1)} titulo="Subir">↑</Botao>
            <Botao aoClicar={() => mover(i, 1)} titulo="Descer">↓</Botao>
            <Botao aoClicar={() => aoMudar(itens.filter((_, k) => k !== i))} variante="risco" titulo="Remover">×</Botao>
          </div>
        </div>
      ))}
      <Botao aoClicar={() => aoMudar([...itens, ""])}>+ item</Botao>
    </div>
  );
}
