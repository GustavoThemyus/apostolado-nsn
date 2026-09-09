import { useCallback, useMemo } from "react";
import { mesLiturgico } from "../calendario/precedencia";
import { DetalheDoDia } from "../components/DetalheDoDia";
import { GradeDoMes, mesmoDia } from "../components/GradeDoMes";
import { AssinarAgenda } from "../components/AssinarAgenda";
import { Cabecalho } from "../components/Cabecalho";
import { AtalhosDaSecao, CartoesDeSecao } from "../components/CartoesDeSecao";
import {
  LegendaDasAgendas,
  VincularAgenda,
} from "../components/VincularAgenda";
import {
  chaveDoDia,
  usarAgendasVinculadas,
} from "../hooks/usarAgendasVinculadas";
import { Moldura } from "../components/Moldura";
import { usarRota } from "../routes/usarRota";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const hojeUTC = () => {
  const a = new Date();
  return new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
};

const comoIso = (d: Date) => d.toISOString().slice(0, 10);

/** Lê `?dia=AAAA-MM-DD`, para o dia poder ser mandado por link. */
function diaDaBusca(busca: URLSearchParams, padrao: Date): Date {
  const cru = busca.get("dia");
  if (!cru || !/^\d{4}-\d{2}-\d{2}$/.test(cru)) return padrao;
  const d = new Date(`${cru}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? padrao
    : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export default function Calendario() {
  const { busca, navegar } = usarRota();
  const hoje = useMemo(hojeUTC, []);
  const escolhido = useMemo(() => diaDaBusca(busca, hoje), [busca, hoje]);

  const ano = escolhido.getUTCFullYear();
  const mes = escolhido.getUTCMonth() + 1;
  const dias = useMemo(() => mesLiturgico(ano, mes), [ano, mes]);
  const detalhe = useMemo(
    () => dias.find((d) => mesmoDia(d.data, escolhido)) ?? dias[0],
    [dias, escolhido],
  );

  const irPara = useCallback(
    (data: Date) => navegar(`/calendario?dia=${comoIso(data)}`),
    [navegar],
  );

  const andar = (passo: number) =>
    irPara(new Date(Date.UTC(ano, mes - 1 + passo, 1)));

  const { porDia } = usarAgendasVinculadas();

  return (
    <Moldura titulo="Calendário Romano Tradicional">
      <Cabecalho
        titulo="Calendário Romano Tradicional"
        descricao="O calendário do Missal de 1962, calculado para qualquer ano. Cada rito, e mesmo cada lugar, tem o seu; este é o do rito tradicional, com o próprio da capela."
      />

      {/* antes do texto: quem chega tem de saber que a seção tem mais */}
      <AtalhosDaSecao padrao="/calendario" />

      <aside className="nota" aria-labelledby="qual-calendario">
        <h2 className="nota__titulo" id="qual-calendario">
          Qual calendário é este
        </h2>
        <p>
          O calendário abaixo é o do <strong>Missal de 1962</strong>, calculado
          aqui para qualquer ano. A capela, porém, segue o{" "}
          <strong>Ordo de São Pio X</strong>, anterior à reforma de 1955. Em boa
          parte dos dias os dois coincidem; nas oitavas, nas vigílias e na
          Semana Santa, não.
        </p>
        <p>
          Os dois convivem. O Ordo da capela pode ser{" "}
          <a href="#ordo-no-site">mostrado aqui na grade</a>, com bandeira
          própria, ou <a href="#ordo-no-celular">vinculado ao seu celular</a>.
          Nos dois casos ele acrescenta, e não substitui.
        </p>
      </aside>

      <div className="calendario__barra">
        <button
          type="button"
          className="barra__botao"
          onClick={() => andar(-1)}
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <p className="calendario__mes">
          {MESES[mes - 1]} <span>{ano}</span>
        </p>
        <button
          type="button"
          className="barra__botao"
          onClick={() => andar(1)}
          aria-label="Próximo mês"
        >
          ›
        </button>
        <button
          type="button"
          className="barra__botao"
          onClick={() => irPara(hoje)}
        >
          Hoje
        </button>
      </div>

      <GradeDoMes
        dias={dias}
        hoje={hoje}
        escolhido={escolhido}
        aoEscolher={irPara}
        marcar={(d) => {
          const itens = porDia.get(chaveDoDia(d.data));
          if (!itens || itens.length === 0) return null;
          return (
            <span className="calendario__bandeiras" aria-hidden="true">
              {[...new Set(itens.map((i) => i.agenda))].map((id) => (
                <span className={`bandeira bandeira--${id}`} key={id} />
              ))}
            </span>
          );
        }}
      />

      <LegendaDasAgendas />

      {detalhe && (
        <DetalheDoDia
          dia={detalhe}
          vinculados={porDia.get(chaveDoDia(detalhe.data)) ?? []}
        />
      )}

      <VincularAgenda grupo="ordo" ancora="ordo-no-site" />

      <AssinarAgenda
        grupo="ordo"
        titulo="Levar o Ordo no celular"
        ancora="ordo-no-celular"
        explicacao="Para acompanhar dia a dia o que se reza na capela, no próprio aparelho."
      />

      <CartoesDeSecao padrao="/calendario" />

      <p className="calendario__ressalva">
        Cobre o Temporal, o Santoral de I a IV classe, as Têmporas, as Rogações
        e a transferência das festas de I classe impedidas, com o próprio da
        capela. Não trata das oitavas menores nem das Missas votivas. Para
        celebrar, confira no Ordo.
      </p>
    </Moldura>
  );
}
