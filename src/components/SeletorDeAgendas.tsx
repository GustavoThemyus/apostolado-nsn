import { site } from "../data/site";
import type { Agenda } from "../data/tipos";

export function SeletorDeAgendas({
  grupos,
  proprios,
  ligadas,
  aoAlternar,
  carregando,
}: {
  grupos: { grupo: Agenda["grupo"]; titulo: string }[];
  proprios?: { titulo: string; itens: { id: string; nome: string }[] }[];
  ligadas: string[];
  aoAlternar: (id: string) => void;
  carregando: boolean;
}) {
  const blocos = [
    ...grupos.map((g) => ({
      titulo: g.titulo,
      agendas: site.agendas
        .filter((a) => a.grupo === g.grupo && a.google)
        .map((a) => ({ id: a.id, nome: a.nome })),
    })),
    ...(proprios ?? []).map((g) => ({ titulo: g.titulo, agendas: g.itens })),
  ].filter((b) => b.agendas.length > 0);
  if (blocos.length === 0) return null;

  return (
    <fieldset className="agendas-na-grade">
      <legend className="agendas-na-grade__titulo">
        Mostrar também na grade
        {carregando && <span className="agendas-na-grade__carregando"> buscando…</span>}
      </legend>
      {blocos.map((b) => (
        <div className="agendas-na-grade__grupo" key={b.titulo}>
          <p className="agendas-na-grade__grupo-titulo">{b.titulo}</p>
          <div className="agendas-na-grade__lista">
            {b.agendas.map((a) => (
              <label className="agendas-na-grade__item" key={a.id}>
                <input
                  type="checkbox"
                  checked={ligadas.includes(a.id)}
                  onChange={() => aoAlternar(a.id)}
                />
                <Cor agenda={a.id} />
                <span className="agendas-na-grade__nome">{a.nome}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

function Cor({ agenda }: { agenda: string }) {
  return (
    <span
      className={`agendas-na-grade__cor agendas-na-grade__ponto--${agenda}`}
      aria-hidden="true"
    />
  );
}
