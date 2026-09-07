import { Desenvolvimento } from "./Desenvolvimento";
import type { ItemVinculado } from "../hooks/usarAgendasVinculadas";
import { porExtensoCurto } from "./DiaDeHoje";
import { NOME_DO_TEMPO } from "../calendario/tipos";
import type { DiaLiturgico } from "../calendario/tipos";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco", vermelho: "Vermelho", verde: "Verde",
  roxo: "Roxo", preto: "Preto", rosa: "Rosa",
};

/** O que se celebra num dia, com tempo, cor, classe e o que muda na Missa. */
export function DetalheDoDia({
  dia,
  vinculados = [],
}: {
  dia: DiaLiturgico;
  /** Itens das agendas do Google que o visitante vinculou. */
  vinculados?: ItemVinculado[];
}) {
  return (
    <div className="calendario__detalhe">
      <p className="calendario__detalhe-data">
        {dia.data.getUTCDate()} de {MESES[dia.data.getUTCMonth()]} de {dia.data.getUTCFullYear()}
      </p>
      <p className="calendario__detalhe-nome">{dia.nome}</p>
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
      {dia.transferidaDe && (
        <p className="dia__transferida">
          Transferida de {porExtensoCurto(dia.transferidaDe)}, por impedimento.
        </p>
      )}
      {dia.comemoracoes.length > 0 && (
        <p className="dia__comemoracoes">
          <span>Comemoração: </span>
          {dia.comemoracoes.join("; ")}
        </p>
      )}
      {dia.observacoes.map((o) => (
        <p className="dia__observacao" key={o}>{o}</p>
      ))}
      <Desenvolvimento dia={dia} />

      {vinculados.length > 0 && (
        <div className="dia__agenda">
          <p className="dia__agenda-titulo">Do Google Agenda</p>
          <ul className="dia__agenda-lista">
            {vinculados.map((item) => (
              <li key={`${item.agenda}-${item.titulo}`}>
                <span className={`bandeira bandeira--${item.agenda}`} aria-hidden="true" />
                <span>
                  <span className="dia__agenda-nome">{item.titulo}</span>
                  <span className="dia__agenda-fonte">{item.nomeDaAgenda}</span>
                  {item.descricao && (
                    <span className="dia__agenda-descricao">{item.descricao}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
