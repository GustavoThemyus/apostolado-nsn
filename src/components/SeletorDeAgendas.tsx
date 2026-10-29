import { site } from "../data/site";
import type { Agenda } from "../data/tipos";

/**
 * Os interruptores dos calendários vinculados.
 *
 * Caixas de seleção, e não abas: o ponto do Perez era justamente "ver tudo em
 * um local só", e aba troca em vez de somar. Quem é do Escapulário e da
 * Terceira Franciscana liga os dois e vê os dois na mesma grade.
 *
 * Cada um na sua cor, e a bolinha ao lado do nome é a legenda da grade. A
 * cor é a do hábito de quem a usa, escolhida pelo Perez: o marrom do Carmo e
 * o do burel franciscano, o cinza da Dominicana, o branco do cordão, o
 * vermelho do Sagrado Coração para o Apostolado da Oração. Na grade a
 * bolinha aparece sozinha na casa do dia, e sem esta lista seria charada.
 *
 * O calendário do Apostolado fica sempre ligado, sem caixa: é o que a página
 * promete. Os outros começam desligados, porque são de associações a que a
 * maior parte de quem lê não pertence, e ligá-los por conta encheria a grade
 * de dias que não são da pessoa.
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
   *
   * `sempre` marca o grupo que não se desliga: ele entra como linha, com a
   * cor e o nome, e sem caixa nenhuma.
   */
  grupos: { grupo: Agenda["grupo"]; titulo: string; sempre?: boolean }[];
  ligadas: string[];
  aoAlternar: (id: string) => void;
  carregando: boolean;
}) {
  const blocos = grupos
    .map((g) => ({
      titulo: g.titulo,
      sempre: g.sempre ?? false,
      agendas: site.agendas.filter((a) => a.grupo === g.grupo && a.google),
    }))
    .filter((b) => b.agendas.length > 0);
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
            {b.agendas.map((a) =>
              b.sempre ? (
                <p className="agendas-na-grade__fixa" key={a.id}>
                  <Cor agenda={a.id} />
                  <span className="agendas-na-grade__nome">
                    {a.nome}
                    <span className="agendas-na-grade__sempre"> sempre na grade</span>
                  </span>
                </p>
              ) : (
                <label className="agendas-na-grade__item" key={a.id}>
                  <input
                    type="checkbox"
                    checked={ligadas.includes(a.id)}
                    onChange={() => aoAlternar(a.id)}
                  />
                  <Cor agenda={a.id} />
                  <span className="agendas-na-grade__nome">{a.nome}</span>
                </label>
              ),
            )}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

/** A bolinha da agenda, do tamanho de legenda. A da grade é a mesma cor, miúda. */
function Cor({ agenda }: { agenda: string }) {
  return (
    <span
      className={`agendas-na-grade__cor agendas-na-grade__ponto--${agenda}`}
      aria-hidden="true"
    />
  );
}
