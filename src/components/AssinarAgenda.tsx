import { useState } from "react";
import { site } from "../data/site";
import type { Agenda } from "../data/tipos";

export function Linha({ agenda }: { agenda: Agenda }) {
  const id = encodeURIComponent(agenda.google);
  const noGoogle = `https://calendar.google.com/calendar/render?cid=${id}`;
  const endereco = `https://calendar.google.com/calendar/ical/${id}/public/basic.ics`;
  const noAparelho = endereco.replace("https:", "webcal:");
  const [aberto, definirAberto] = useState(false);
  const [copia, definirCopia] = useState<"copiado" | "falhou">();

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(endereco);
      definirCopia("copiado");
    } catch {
      definirCopia("falhou");
    }
  };

  return (
    <li className="agenda">
      <div className="agenda__nome">
        <span>{agenda.nome}</span>
        {agenda.descricao && <span className="agenda__descricao">{agenda.descricao}</span>}
      </div>
      <div className="agenda__acoes">
        <a className="botao-agenda" href={noGoogle} target="_blank" rel="external noreferrer">
          Google Agenda
        </a>
        <button
          type="button"
          className="botao-agenda botao-agenda--secundario"
          aria-expanded={aberto}
          onClick={() => definirAberto((a) => !a)}
        >
          Outro aplicativo
        </button>
      </div>
      {aberto && (
        <div className="agenda__outro">
          <p>
            No iPhone, toque em{" "}
            <a className="elo-texto" href={noAparelho} rel="external">
              abrir no calendário
            </a>{" "}
            e confirme a assinatura.
          </p>
          <p>
            Se nada acontecer, copie o endereço abaixo e cole no seu aplicativo, na opção
            de assinar um calendário por endereço (URL).
          </p>
          <input
            className="agenda__endereco"
            readOnly
            value={endereco}
            aria-label={`Endereço do calendário ${agenda.nome}`}
            onFocus={(e) => e.currentTarget.select()}
          />
          <button type="button" className="botao-agenda" onClick={copiar}>
            <span role="status">
              {copia === "copiado"
                ? "Endereço copiado"
                : copia === "falhou"
                  ? "Não copiou: toque no endereço e copie"
                  : "Copiar endereço"}
            </span>
          </button>
        </div>
      )}
    </li>
  );
}

export function AssinarEsta({ id }: { id: string }) {
  const agenda = site.agendas.find((a) => a.id === id && a.google);
  if (!agenda) return null;

  return (
    <aside className="agendas" aria-label={`Calendário: ${agenda.nome}`}>
      <p className="agendas__titulo">Leve este calendário no celular</p>
      <ul className="agendas__lista">
        <Linha agenda={agenda} />
      </ul>
    </aside>
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
        calendário. O segundo mostra como assinar no iPhone, no Outlook e em outros
        aplicativos que aceitam assinatura por endereço.
      </p>
    </section>
  );
}
