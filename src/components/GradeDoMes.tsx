import type { ReactNode } from "react";
import type { Cor } from "../calendario/tipos";

export interface DiaNaGrade {
  data: Date;
  nome: string;
  cor: Cor;
}

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export const mesmoDia = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

export function GradeDoMes<T extends DiaNaGrade>({
  dias,
  hoje,
  escolhido,
  aoEscolher,
  marcar,
  destacar,
}: {
  dias: T[];
  hoje: Date;
  escolhido: Date;
  aoEscolher: (data: Date) => void;
  marcar?: (dia: T) => ReactNode;
  destacar?: (dia: T) => boolean;
}) {
  if (dias.length === 0) return null;
  const primeiro = dias[0].data;
  const vazias = primeiro.getUTCDay();

  return (
    <div className="calendario__grade" role="grid">
      {SEMANA.map((s, i) => (
        <span className="calendario__cabeca" key={i} aria-hidden="true">
          {s}
        </span>
      ))}
      {Array.from({ length: vazias }, (_, i) => (
        <span className="calendario__vazio" key={`v${i}`} />
      ))}
      {dias.map((d) => {
        const eHoje = mesmoDia(d.data, hoje);
        const selecionado = mesmoDia(d.data, escolhido);
        return (
          <button
            type="button"
            key={d.data.toISOString()}
            className={`calendario__dia${eHoje ? " calendario__dia--hoje" : ""}${
              selecionado ? " calendario__dia--escolhido" : ""
            }`}
            onClick={() => aoEscolher(d.data)}
            aria-pressed={selecionado}
            title={d.nome}
          >
            <span className="calendario__numero">{d.data.getUTCDate()}</span>
            <span
              className={`calendario__ponto dia__amostra--${d.cor}${
                destacar?.(d) ? " calendario__ponto--maior" : ""
              }`}
              aria-hidden="true"
            />
            {marcar?.(d)}
          </button>
        );
      })}
    </div>
  );
}
