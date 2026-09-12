import { useCallback, useEffect, useMemo, useState } from "react";
import { mesLiturgico } from "../calendario/precedencia";
import { ANOS_COM_ORDO } from "../calendario/ordo";
import { DetalheDoDia } from "../components/DetalheDoDia";
import { DetalheDoOrdo } from "../components/DetalheDoOrdo";
import { GradeDoMes, mesmoDia } from "../components/GradeDoMes";
import { AssinarAgenda } from "../components/AssinarAgenda";
import { Cabecalho } from "../components/Cabecalho";
import { AtalhosDaSecao, CartoesDeSecao } from "../components/CartoesDeSecao";
import { usarOrdo } from "../hooks/usarOrdo";
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

/*
 * Qual dos dois calendários mostrar.
 *
 * Vem da URL quando ela diz, para o link ser compartilhável com a escolha
 * dentro; senão, do que o leitor escolheu da última vez. A lembrança é do
 * aparelho de quem lê, e por isso `localStorage` — que num navegador com os
 * dados do site bloqueados lança em vez de devolver vazio, daí o try.
 */
const LEMBRANCA = "nsn:calendario:uso";
type Uso = "1962" | "pre55";

function usoLembrado(): Uso {
  try {
    return localStorage.getItem(LEMBRANCA) === "pre55" ? "pre55" : "1962";
  } catch {
    return "1962";
  }
}

export default function Calendario() {
  const { busca, navegar } = usarRota();
  const hoje = useMemo(hojeUTC, []);
  const escolhido = useMemo(() => diaDaBusca(busca, hoje), [busca, hoje]);

  const naUrl = busca.get("uso");
  const [lembrado, definirLembrado] = useState<Uso>(usoLembrado);
  const uso: Uso = naUrl === "pre55" ? "pre55" : naUrl === "1962" ? "1962" : lembrado;
  const pre55 = uso === "pre55";

  useEffect(() => {
    try {
      localStorage.setItem(LEMBRANCA, uso);
    } catch {
      /* navegador com os dados do site bloqueados: a escolha vale só nesta visita */
    }
  }, [uso]);

  const ano = escolhido.getUTCFullYear();
  const mes = escolhido.getUTCMonth() + 1;

  const de1962 = useMemo(() => mesLiturgico(ano, mes), [ano, mes]);
  const ordo = usarOrdo(ano, mes, pre55);

  // os dois detalhes são resolvidos à parte: os dias não têm a mesma forma, e
  // um `as` aqui seria prometer ao compilador o que a tela é que decide
  const doOrdo = useMemo(
    () => ordo.dias.find((d) => mesmoDia(d.data, escolhido)) ?? ordo.dias[0],
    [ordo.dias, escolhido],
  );
  const de62 = useMemo(
    () => de1962.find((d) => mesmoDia(d.data, escolhido)) ?? de1962[0],
    [de1962, escolhido],
  );

  const irPara = useCallback(
    (data: Date, comQue: Uso = uso) =>
      navegar(`/calendario?dia=${comoIso(data)}${comQue === "pre55" ? "&uso=pre55" : ""}`),
    [navegar, uso],
  );

  const andar = (passo: number) =>
    irPara(new Date(Date.UTC(ano, mes - 1 + passo, 1)));

  const trocar = (novo: Uso) => {
    definirLembrado(novo);
    irPara(escolhido, novo);
  };

  const anos = ANOS_COM_ORDO.join(", ");

  return (
    <Moldura titulo="Calendário Romano Tradicional">
      <Cabecalho
        titulo="Calendário Romano Tradicional"
        descricao="Dois calendários na mesma grade: o do Missal de 1962, calculado para qualquer ano, e o Ordo de São Pio X que a capela segue, anterior à reforma de 1955."
      />

      {/* antes do texto: quem chega tem de saber que a seção tem mais */}
      <AtalhosDaSecao padrao="/calendario" />

      <aside className="nota" aria-labelledby="qual-calendario">
        <h2 className="nota__titulo" id="qual-calendario">
          Qual calendário é este
        </h2>
        <p>
          A grade mostra um dos dois, e o botão no alto troca. O{" "}
          <strong>Missal de 1962</strong> é calculado aqui, para qualquer ano. O{" "}
          <strong>Ordo de São Pio X</strong>, anterior à reforma de 1955, é o
          que a capela segue: não é calculado, é copiado do Ordo que o
          Apostolado publica, com o grau, a Missa, as comemorações e as
          rubricas de cada dia.
        </p>
        <p>
          Em boa parte dos dias os dois coincidem; nas oitavas, nas vigílias e
          na Semana Santa, não. Em 2026 eles diferem em 135 dos 365 dias.
        </p>
      </aside>

      <div className="calendario__uso" role="group" aria-label="Qual calendário mostrar">
        {([["1962", "1962"], ["pre55", "Pré-55"]] as const).map(([qual, rotulo]) => (
          <button
            type="button"
            key={qual}
            className={`uso__opcao${uso === qual ? " uso__opcao--ativa" : ""}`}
            aria-pressed={uso === qual}
            onClick={() => trocar(qual)}
          >
            {rotulo}
          </button>
        ))}
      </div>

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

      {ordo.semOrdo ? (
        <p className="calendario__sem-ordo">
          O Apostolado ainda não publicou o Ordo de {ano}. Publicado, ele entra
          aqui. Por enquanto há {ANOS_COM_ORDO.length > 1 ? "os anos" : "o ano"}{" "}
          {anos} — ou veja este mês{" "}
          <button type="button" className="elo-em-texto" onClick={() => trocar("1962")}>
            pelo calendário de 1962
          </button>
          .
        </p>
      ) : pre55 ? (
        <GradeDoMes
          dias={ordo.dias}
          hoje={hoje}
          escolhido={escolhido}
          aoEscolher={(data) => irPara(data)}
        />
      ) : (
        <GradeDoMes
          dias={de1962}
          hoje={hoje}
          escolhido={escolhido}
          aoEscolher={(data) => irPara(data)}
        />
      )}

      {pre55
        ? doOrdo && <DetalheDoOrdo dia={doOrdo} />
        : de62 && <DetalheDoDia dia={de62} />}

      <AssinarAgenda
        grupo="ordo"
        titulo="Levar o Ordo no celular"
        ancora="ordo-no-celular"
        explicacao="Para acompanhar dia a dia o que se reza na capela, no próprio aparelho."
      />

      <CartoesDeSecao padrao="/calendario" />

      <p className="calendario__ressalva">
        {pre55
          ? "Copiado do Ordo publicado pelo Apostolado, dia a dia, sem cálculo nem dedução. Para celebrar, confira no Ordo."
          : "Cobre o Temporal, o Santoral de I a IV classe, as Têmporas, as Rogações e a transferência das festas de I classe impedidas, com o próprio da capela. Não trata das oitavas menores nem das Missas votivas. Para celebrar, confira no Ordo."}
      </p>
    </Moldura>
  );
}
