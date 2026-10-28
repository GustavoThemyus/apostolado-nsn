import { site } from "../data/site";
import type { Agenda } from "../data/tipos";

/**
 * Os interruptores dos calendários vinculados.
 *
 * Caixas de seleção, e não abas: o ponto do Perez era justamente "ver tudo em
 * um local só", e aba troca em vez de somar. Quem é do Escapulário e da
 * Terceira Franciscana liga os dois e vê os dois na mesma grade.
 *
 * Sem cor por agenda. A casa do dia já leva a bolinha da cor litúrgica e o
 * marcador de plenária; uma terceira escala de cor, com seis valores, faria
 * a grade dizer mais do que se lê de relance. Na grade a marca é neutra e
 * conta quantas agendas têm algo no dia; quem diz qual é o detalhe embaixo.
 *
 * Tudo começa desligado. O calendário próprio do site é o que a página
 * promete; os outros são de associações a que a maior parte de quem lê não
 * pertence, e ligá-los por conta encheria a grade de dias que não são da
 * pessoa.
 */
export function SeletorDeAgendas({
  grupos,
  ligadas,
  aoAlternar,
  carregando,
}: {
  /**
   * Quais grupos do site.json entram, na ordem, e como se chamam aqui.
   *
   * Com rótulo porque o nome de uma agenda nem sempre basta sozinho: o
   * calendário próprio se chama "Indulgências" no site.json, e numa página
   * chamada "Calendário das Indulgências Plenárias Universais" essa caixa
   * sozinha parecia oferecer o que a página já mostra. O rótulo do grupo diz
   * de quem é.
   */
  grupos: { grupo: Agenda["grupo"]; titulo: string }[];
  ligadas: string[];
  aoAlternar: (id: string) => void;
  carregando: boolean;
}) {
  const blocos = grupos
    .map((g) => ({
      titulo: g.titulo,
      agendas: site.agendas.filter((a) => a.grupo === g.grupo && a.google),
    }))
    .filter((b) => b.agendas.length > 0);
  if (blocos.length === 0) return null;

  return (
    <fieldset className="agendas">
      <legend className="agendas__titulo">
        Mostrar também na grade
        {carregando && <span className="agendas__carregando"> buscando…</span>}
      </legend>
      {blocos.map((b) => (
        <div className="agendas__grupo" key={b.titulo}>
          <p className="agendas__grupo-titulo">{b.titulo}</p>
          <div className="agendas__lista">
            {b.agendas.map((a) => (
              <label className="agendas__item" key={a.id}>
                <input
                  type="checkbox"
                  checked={ligadas.includes(a.id)}
                  onChange={() => aoAlternar(a.id)}
                />
                <span className="agendas__nome">{a.nome}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
