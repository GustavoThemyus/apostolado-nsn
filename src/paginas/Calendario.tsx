import { useCallback, useMemo } from "react";
import { mesLiturgico } from "../calendario/precedencia";
import { DetalheDoDia } from "../components/DetalheDoDia";
import { GradeDoMes, mesmoDia } from "../components/GradeDoMes";
import { Moldura } from "../components/Moldura";
import { usarRota } from "../rotas/usarRota";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

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
  return Number.isNaN(d.getTime()) ? padrao : new Date(Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()
  ));
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
    [dias, escolhido]
  );

  const irPara = useCallback(
    (data: Date) => navegar(`/calendario?dia=${comoIso(data)}`),
    [navegar]
  );

  const andar = (passo: number) => irPara(new Date(Date.UTC(ano, mes - 1 + passo, 1)));

  return (
    <Moldura titulo="Calendário Romano Tradicional">
      <header className="pagina__topo">
        <h1 className="pagina__titulo">Calendário Romano Tradicional</h1>
        <p className="pagina__resumo">
          O calendário do Missal de 1962, calculado para qualquer ano. Cada rito, e mesmo
          cada lugar, tem o seu; este é o do rito tradicional, com o próprio da capela.
        </p>
      </header>

      <div className="calendario__barra">
        <button type="button" className="barra__botao" onClick={() => andar(-1)} aria-label="Mês anterior">‹</button>
        <p className="calendario__mes">
          {MESES[mes - 1]} <span>{ano}</span>
        </p>
        <button type="button" className="barra__botao" onClick={() => andar(1)} aria-label="Próximo mês">›</button>
        <button type="button" className="barra__botao" onClick={() => irPara(hoje)}>Hoje</button>
      </div>

      <GradeDoMes dias={dias} hoje={hoje} escolhido={escolhido} aoEscolher={irPara} />

      {detalhe && <DetalheDoDia dia={detalhe} />}

      <p className="calendario__ressalva">
        Calendário de 1962, calculado para qualquer ano, com o próprio da capela. Cobre o
        Temporal, o Santoral de I a IV classe, as Têmporas, as Rogações e a transferência
        das festas de I classe impedidas. Não trata das oitavas menores nem das Missas
        votivas. Confira no Ordo antes de celebrar.
      </p>
    </Moldura>
  );
}
