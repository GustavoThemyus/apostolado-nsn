import { useCallback, useMemo } from "react";
import bruto from "../data/indulgencias-dias.json";
import { indulgenciasDoMes, temPlenaria, type DiaDeIndulgencia } from "../calendario/indulgencias";
import { mesLiturgico } from "../calendario/precedencia";
import { AssinarAgenda } from "../components/AssinarAgenda";
import { ListaDeBlocos } from "../components/Bloco";
import { Cabecalho } from "../components/Cabecalho";
import { GradeDoMes, mesmoDia } from "../components/GradeDoMes";
import { Moldura } from "../components/Moldura";
import { porExtensoCurto } from "../components/DiaDeHoje";
import { usarRota } from "../rotas/usarRota";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

interface Colecao {
  titulo: string;
  descricao: string;
  dias: DiaDeIndulgencia[];
  /** As que valem em qualquer dia, e por isso não entram na grade. */
  semDiaFixo: { id: string; titulo: string; especie: string; fonte?: string; obra: [] }[];
}

const colecao = bruto as unknown as Colecao;

const hojeUTC = () => {
  const a = new Date();
  return new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
};
const comoIso = (d: Date) => d.toISOString().slice(0, 10);

function diaDaBusca(busca: URLSearchParams, padrao: Date): Date {
  const cru = busca.get("dia");
  if (!cru || !/^\d{4}-\d{2}-\d{2}$/.test(cru)) return padrao;
  const d = new Date(`${cru}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? padrao
    : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * O calendário das indulgências.
 *
 * Usa a mesma grade e o mesmo motor do calendário litúrgico, e é isso que faz
 * a indulgência presa a uma festa acompanhar a transferência dela. Um segundo
 * calendário, próprio, divergiria do primeiro na primeira exceção.
 */
export default function IndulgenciasCalendario() {
  const { busca, navegar } = usarRota();
  const hoje = useMemo(hojeUTC, []);
  const escolhido = useMemo(() => diaDaBusca(busca, hoje), [busca, hoje]);

  const ano = escolhido.getUTCFullYear();
  const mes = escolhido.getUTCMonth() + 1;

  const dias = useMemo(() => mesLiturgico(ano, mes), [ano, mes]);
  const porDia = useMemo(
    () => indulgenciasDoMes(colecao.dias, ano, mes),
    [ano, mes]
  );

  const irPara = useCallback(
    (data: Date) => navegar(`/indulgencias/calendario?dia=${comoIso(data)}`),
    [navegar]
  );
  const andar = (passo: number) => irPara(new Date(Date.UTC(ano, mes - 1 + passo, 1)));

  const doDia = porDia.get(comoIso(escolhido)) ?? [];
  const diaLiturgico = dias.find((d) => mesmoDia(d.data, escolhido));

  return (
    <Moldura titulo={colecao.titulo}>
      <Cabecalho titulo="Dias de indulgência plenária" descricao={colecao.descricao} />

      <aside className="nota" aria-labelledby="condicoes">
        <h2 className="nota__titulo" id="condicoes">As condições, uma vez só</h2>
        <p>
          Confissão sacramental, comunhão eucarística, oração pelas intenções do Sumo
          Pontífice e desapego de todo pecado, mesmo venial. Valem para toda plenária
          desta página, e por isso ficam aqui em vez de repetidas em cada dia: repetidas,
          divergem.
        </p>
        <p>
          Sem o desapego, ou faltando alguma das outras condições, a indulgência é
          apenas parcial.
        </p>
      </aside>

      <div className="calendario__barra">
        <button type="button" className="barra__botao" onClick={() => andar(-1)} aria-label="Mês anterior">‹</button>
        <p className="calendario__mes">
          {MESES[mes - 1]} <span>{ano}</span>
        </p>
        <button type="button" className="barra__botao" onClick={() => andar(1)} aria-label="Próximo mês">›</button>
        <button type="button" className="barra__botao" onClick={() => irPara(hoje)}>Hoje</button>
      </div>

      <GradeDoMes
        dias={dias}
        hoje={hoje}
        escolhido={escolhido}
        aoEscolher={irPara}
        marcar={(d) => {
          const ocorrencias = porDia.get(comoIso(d.data));
          if (!ocorrencias?.length) return null;
          return (
            <span
              className={`indulgencia__marca${
                temPlenaria(ocorrencias) ? " indulgencia__marca--plenaria" : ""
              }`}
              aria-hidden="true"
            />
          );
        }}
      />

      <p className="legenda-agendas">
        <span className="legenda-agendas__rotulo">Na grade:</span>
        <span className="legenda-agendas__item">
          <span className="indulgencia__marca indulgencia__marca--plenaria" aria-hidden="true" />
          plenária
        </span>
        <span className="legenda-agendas__item">
          <span className="indulgencia__marca" aria-hidden="true" />
          parcial
        </span>
      </p>

      <div className="calendario__detalhe">
        <p className="calendario__detalhe-data">
          {escolhido.getUTCDate()} de {MESES[escolhido.getUTCMonth()]} de {ano}
        </p>
        {diaLiturgico && <p className="calendario__detalhe-nome">{diaLiturgico.nome}</p>}

        {doDia.length === 0 ? (
          <p className="dia__observacao">Nenhuma indulgência presa a este dia.</p>
        ) : (
          <ul className="indulgencias-dia">
            {doDia.map(({ entrada, transferidaDe }) => (
              <li key={entrada.id}>
                <p className="indulgencias-dia__titulo">
                  {entrada.titulo}
                  <span
                    className={`etiqueta etiqueta--${entrada.especie}`}
                  >
                    {entrada.especie === "plenaria" ? "Plenária" : "Parcial"}
                  </span>
                </p>
                {transferidaDe && (
                  <p className="dia__transferida">
                    Acompanha a festa, transferida de {porExtensoCurto(transferidaDe)}.
                  </p>
                )}
                <ListaDeBlocos blocos={entrada.obra} />
                {entrada.fonte && <p className="indulgencias-dia__fonte">{entrada.fonte}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="nota" aria-labelledby="sem-dia">
        <h2 className="nota__titulo" id="sem-dia">Em qualquer dia</h2>
        <p>
          Nem toda indulgência está presa a uma data. Estas valem quando a obra for
          feita, e por isso ficam fora da grade em vez de repetidas em todos os dias
          do ano.
        </p>
        <ul className="indulgencias-dia">
          {colecao.semDiaFixo.map((i) => (
            <li key={i.id}>
              <p className="indulgencias-dia__titulo">
                {i.titulo}
                <span className={`etiqueta etiqueta--${i.especie}`}>
                  {i.especie === "plenaria" ? "Plenária" : "Parcial"}
                </span>
              </p>
              <ListaDeBlocos blocos={i.obra} />
              {i.fonte && <p className="indulgencias-dia__fonte">{i.fonte}</p>}
            </li>
          ))}
        </ul>
      </section>

      <AssinarAgenda
        grupo="indulgencias"
        titulo="Levar as indulgências no celular"
        explicacao="Os calendários das confrarias e ordens terceiras, para não perder os dias."
      />
    </Moldura>
  );
}
