import { useMemo } from "react";
import { diaLiturgico } from "../calendario/precedencia";
import { NOME_DO_TEMPO } from "../calendario/tipos";

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco",
  vermelho: "Vermelho",
  verde: "Verde",
  roxo: "Roxo",
  preto: "Preto",
  rosa: "Rosa",
};

/** "2026-12-08" -> "8 de dezembro". */
export function porExtensoCurto(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${d} de ${MESES[m - 1]}`;
}

function porExtenso(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(data);
}

/**
 * Faixa com o dia litúrgico de hoje, calculado no navegador a partir da data
 * do aparelho. Cobre o Temporal; o Santoral ainda não entra.
 */
export function DiaDeHoje({ data, aoAbrirCalendario }: { data?: Date; aoAbrirCalendario: () => void }) {
  const hoje = useMemo(() => {
    if (data) return data;
    const agora = new Date();
    return new Date(Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()));
  }, [data]);

  const dia = diaLiturgico(hoje);

  return (
    <aside className="dia" aria-label="Dia litúrgico de hoje">
      <p className="dia__data">{porExtenso(hoje)}</p>
      <p className="dia__nome">{dia.nome}</p>
      <dl className="dia__detalhes">
        <div>
          <dt>Tempo</dt>
          <dd>{NOME_DO_TEMPO[dia.tempo]}</dd>
        </div>
        <div>
          <dt>Cor</dt>
          <dd>
            <span className={`dia__amostra dia__amostra--${dia.cor}`} aria-hidden="true" />
            <span className={`cor cor--${dia.cor}`}>{NOME_DA_COR[dia.cor]}</span>
          </dd>
        </div>
        <div>
          <dt>Classe</dt>
          <dd>{dia.classe}ª</dd>
        </div>
      </dl>
      {dia.comemoracoes.length > 0 && (
        <p className="dia__comemoracoes">
          <span>Comemoração: </span>
          {dia.comemoracoes.join("; ")}
        </p>
      )}
      {dia.transferidaDe && (
        <p className="dia__transferida">
          Transferida de {porExtensoCurto(dia.transferidaDe)}, por impedimento.
        </p>
      )}
      {dia.observacoes.map((o) => (
        <p className="dia__observacao" key={o}>{o}</p>
      ))}
      <button type="button" className="dia__link" onClick={aoAbrirCalendario}>
        Ver o calendário do ano
      </button>
    </aside>
  );
}
