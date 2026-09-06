import { site } from "../data/site";
import type { Agenda } from "../data/tipos";

/**
 * Botões para vincular um calendário do Google ao aparelho do fiel.
 *
 * São dois links externos e nada mais: nada de iframe, que é pesado, ignora
 * os tokens do tema e é ruim no celular. O calendário do site continua sendo
 * o nosso; estes são adicionais, e não substituem nada.
 *
 * Só funciona com calendário público: convite por e-mail é compartilhamento
 * privado e não serve para visitante anônimo.
 */
function Linha({ agenda }: { agenda: Agenda }) {
  const id = encodeURIComponent(agenda.google);
  const noGoogle = `https://calendar.google.com/calendar/render?cid=${id}`;
  const noAparelho = `webcal://calendar.google.com/calendar/ical/${id}/public/basic.ics`;

  return (
    <li className="agenda">
      <div className="agenda__nome">
        <span>{agenda.nome}</span>
        {agenda.descricao && <span className="agenda__descricao">{agenda.descricao}</span>}
      </div>
      <div className="agenda__acoes">
        {/* rel=external mantém o interceptador do router longe destes links */}
        <a className="botao-agenda" href={noGoogle} target="_blank" rel="external noreferrer">
          Google Agenda
        </a>
        <a className="botao-agenda botao-agenda--secundario" href={noAparelho} rel="external">
          Outro aplicativo
        </a>
      </div>
    </li>
  );
}

export function AssinarAgenda({
  grupo,
  titulo,
  explicacao,
  ancora,
}: {
  grupo: Agenda["grupo"];
  titulo: string;
  explicacao?: string;
  /** Para poder ser apontada de outro ponto da página. */
  ancora?: string;
}) {
  const agendas = site.agendas.filter((a) => a.grupo === grupo && a.google);
  if (agendas.length === 0) return null;

  return (
    <section className="agendas" id={ancora}>
      <h2 className="agendas__titulo">{titulo}</h2>
      {explicacao && <p className="agendas__explicacao">{explicacao}</p>}
      <ul className="agendas__lista">
        {agendas.map((a) => (
          <Linha key={a.id} agenda={a} />
        ))}
      </ul>
      <p className="agendas__nota">
        O primeiro botão abre o Google Agenda e pergunta se você quer acrescentar o
        calendário. O segundo serve para iPhone, Outlook e outros aplicativos que
        aceitam assinatura por endereço.
      </p>
    </section>
  );
}
