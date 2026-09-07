import {
  agendasDisponiveis,
  desvincular,
  estaVinculada,
  vincular,
} from "../agenda/vinculo";
import { usarAgendasVinculadas } from "../hooks/usarAgendasVinculadas";
import type { Agenda } from "../data/tipos";

/**
 * Vincular um calendário do Google ao calendário do próprio site.
 *
 * Diferente do bloco de assinatura, que manda o fiel para o aplicativo do
 * aparelho: aqui os itens entram na grade e no detalhe do dia, marcados com a
 * bandeira da agenda de onde vieram. Desvincular tira tudo e a grade volta a
 * ser só o calendário de 1962.
 *
 * O vínculo é do aparelho de quem lê, não da capela: ninguém mais vê.
 */
export function VincularAgenda({ grupo, ancora }: { grupo: Agenda["grupo"]; ancora?: string }) {
  const { vinculadas, carregando, semDetalhes, falharam } = usarAgendasVinculadas();
  const agendas = agendasDisponiveis(grupo);
  if (agendas.length === 0) return null;

  const ativas = agendas.filter((a) => vinculadas.includes(a.id));

  return (
    <section className="vinculo" id={ancora} aria-labelledby="vinculo-titulo">
      <div className="vinculo__topo">
        <h2 className="vinculo__titulo" id="vinculo-titulo">
          Mostrar no calendário acima
        </h2>
        {ativas.length > 0 && (
          <button
            type="button"
            className="vinculo__limpar"
            onClick={() => ativas.forEach((a) => desvincular(a.id))}
          >
            Desvincular tudo
          </button>
        )}
      </div>

      <p className="vinculo__explicacao">
        O calendário do site é o do Missal de 1962. Vinculando um calendário do Google, os
        itens dele passam a aparecer na grade com bandeira própria, sem substituir nada.
        {carregando && " Buscando..."}
      </p>

      <ul className="vinculo__lista">
        {agendas.map((agenda) => {
          const ligada = estaVinculada(agenda.id);
          const muda = semDetalhes.some((s) => s.id === agenda.id);
          const falhou = falharam.includes(agenda.id);
          return (
            <li className="vinculo__item" key={agenda.id}>
              <div className="vinculo__nome">
                <span className={`bandeira bandeira--${agenda.id}`} aria-hidden="true" />
                <span>
                  {agenda.nome}
                  {agenda.descricao && (
                    <span className="vinculo__descricao">{agenda.descricao}</span>
                  )}
                  {ligada && muda && (
                    <span className="vinculo__aviso">
                      Este calendário está público sem os detalhes, então o Google não
                      devolve o nome dos itens. Nada foi acrescentado à grade.
                    </span>
                  )}
                  {ligada && falhou && (
                    <span className="vinculo__aviso">Não foi possível ler este calendário.</span>
                  )}
                </span>
              </div>
              <button
                type="button"
                className={`botao-agenda${ligada ? " botao-agenda--secundario" : ""}`}
                onClick={() => (ligada ? desvincular(agenda.id) : vincular(agenda.id))}
                aria-pressed={ligada}
              >
                {ligada ? "Desvincular" : "Vincular"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** A legenda das bandeiras, mostrada só quando há algo vinculado. */
export function LegendaDasAgendas() {
  const { vinculadas, porDia } = usarAgendasVinculadas();
  if (vinculadas.length === 0 || porDia.size === 0) return null;

  const nomes = new Map<string, string>();
  for (const itens of porDia.values()) {
    for (const item of itens) nomes.set(item.agenda, item.nomeDaAgenda);
  }
  if (nomes.size === 0) return null;

  return (
    <p className="legenda-agendas">
      <span className="legenda-agendas__rotulo">Do Google Agenda:</span>
      {[...nomes].map(([id, nome]) => (
        <span className="legenda-agendas__item" key={id}>
          <span className={`bandeira bandeira--${id}`} aria-hidden="true" />
          {nome}
        </span>
      ))}
    </p>
  );
}
