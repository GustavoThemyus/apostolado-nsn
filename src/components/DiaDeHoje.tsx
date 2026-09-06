import { useMemo } from "react";
import { nomeDoDia } from "../calendario/nomes";
import { diaDoTempo } from "../calendario/tempo";
import { NOME_DO_TEMPO } from "../calendario/tipos";

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco",
  vermelho: "Vermelho",
  verde: "Verde",
  roxo: "Roxo",
  preto: "Preto",
  rosa: "Rosa",
};

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
export function DiaDeHoje({ data }: { data?: Date }) {
  const hoje = useMemo(() => {
    if (data) return data;
    const agora = new Date();
    return new Date(Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()));
  }, [data]);

  const dia = diaDoTempo(hoje);
  const nome = nomeDoDia(hoje);

  return (
    <aside className="dia" aria-label="Dia litúrgico de hoje">
      <p className="dia__data">{porExtenso(hoje)}</p>
      <p className="dia__nome">{nome}</p>
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
      </dl>
      <p className="dia__ressalva">
        Do Temporal. Uma festa do Santoral pode ter precedência sobre este dia.
      </p>
    </aside>
  );
}
