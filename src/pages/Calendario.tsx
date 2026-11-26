import { useCallback, useEffect, useMemo, useState } from "react";
import { mesLiturgico } from "../calendario/precedencia";
import { ehFestaMaiorDoOrdo, temOrdo, ultimoDiaDoOrdo } from "../calendario/ordo";
import { penitenciaDe } from "../calendario/penitencia";
import { DetalheDoDia } from "../components/DetalheDoDia";
import { LegendaDaGrade, MarcaDePenitencia } from "../components/MarcaDePenitencia";
import { DetalheDoOrdo } from "../components/DetalheDoOrdo";
import { SinaisDoDia, sinaisDe1962, sinaisDoOrdo } from "../components/SinaisDoDia";
import { GradeDoMes, mesmoDia } from "../components/GradeDoMes";
import { BotaoDeAssinar } from "../components/BotaoDeAssinar";
import { Bloco } from "../components/Bloco";
import introducao from "../data/calendario-introducao.json";
import type { Bloco as TipoBloco } from "../data/tipos";
import { Cabecalho } from "../components/Cabecalho";
import { AtalhosDaSecao, CartoesDeSecao } from "../components/CartoesDeSecao";
import { usarOrdo } from "../hooks/usarOrdo";
import { Moldura } from "../components/Moldura";
import { usarRota } from "../routes/usarRota";
import { comoIso, diaDaBusca, hojeUTC } from "../calendario/dias";

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

const LEMBRANCA = "nsn:calendario:escolha";
type Uso = "1962" | "pre55";

function usoLembrado(): Uso {
  try {
    return localStorage.getItem(LEMBRANCA) === "1962" ? "1962" : "pre55";
  } catch {
    return "pre55";
  }
}

export default function Calendario() {
  const { busca, navegar } = usarRota();
  const hoje = useMemo(hojeUTC, []);
  const escolhido = useMemo(() => diaDaBusca(busca, hoje), [busca, hoje]);

  const naUrl = busca.get("uso");
  const [lembrado, definirLembrado] = useState<Uso>(usoLembrado);
  const ano = escolhido.getUTCFullYear();
  const mes = escolhido.getUTCMonth() + 1;
  const pedido: Uso = naUrl === "pre55" ? "pre55" : naUrl === "1962" ? "1962" : lembrado;
  const uso: Uso = !naUrl && !temOrdo(ano, mes) ? "1962" : pedido;
  const pre55 = uso === "pre55";

  const de1962 = useMemo(() => mesLiturgico(ano, mes), [ano, mes]);
  const ordo = usarOrdo(ano, mes, pre55);

  const doOrdo = useMemo(
    () => ordo.dias.find((d) => mesmoDia(d.data, escolhido)) ?? ordo.dias[0],
    [ordo.dias, escolhido],
  );
  const de62 = useMemo(
    () => de1962.find((d) => mesmoDia(d.data, escolhido)) ?? de1962[0],
    [de1962, escolhido],
  );

  const irPara = useCallback(
    (data: Date, comQue?: Uso) => {
      const qual = comQue ?? (naUrl === "1962" || naUrl === "pre55" ? naUrl : undefined);
      navegar(`/calendario?dia=${comoIso(data)}${qual ? `&uso=${qual}` : ""}`);
    },
    [navegar, naUrl],
  );

  const andar = (passo: number) =>
    irPara(new Date(Date.UTC(ano, mes - 1 + passo, 1)));

  const [aviso, definirAviso] = useState("");
  useEffect(() => {
    if (!aviso) return;
    const fim = window.setTimeout(() => definirAviso(""), 3500);
    return () => window.clearTimeout(fim);
  }, [aviso]);

  const trocar = (novo: Uso) => {
    definirAviso(`Rubricas de ${novo === "pre55" ? "São Pio X" : "São João XXIII"}`);
    definirLembrado(novo);
    try {
      localStorage.setItem(LEMBRANCA, novo);
    } catch {
    }
    irPara(escolhido, novo);
  };

  return (
    <Moldura titulo="Calendário Romano Tradicional">
      <Cabecalho
        titulo="Calendário Romano Tradicional"
        descricao="O calendário litúrgico tradicional, dia a dia."
      />

      <AtalhosDaSecao padrao="/calendario" />

      <details className="opcional">
        <summary className="opcional__resumo">
          <span className="opcional__rotulo">{introducao.titulo}</span>
        </summary>
        <div className="opcional__corpo">
          {(introducao.blocos as TipoBloco[]).map((b, i) => (
            <Bloco bloco={b} key={i} />
          ))}
        </div>
      </details>

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

      <div className="calendario__painel">
        <div className="calendario__coluna-grade">
          {ordo.semOrdo ? (
            <p className="calendario__sem-ordo">
              O Ordo de {MESES[mes - 1]} de {ano} não está publicado. Ele vai até{" "}
              {ultimoDiaDoOrdo()}. Veja este mês{" "}
              <button type="button" className="elo-em-texto" onClick={() => trocar("1962")}>
                pelo calendário calculado
              </button>
              .
            </p>
          ) : pre55 ? (
            <>
              <GradeDoMes
                dias={ordo.dias}
                hoje={hoje}
                escolhido={escolhido}
                aoEscolher={(data) => irPara(data)}
                marcar={(d) => (
                  <>
                    <MarcaDePenitencia penitencia={d.penitencia} />
                    <SinaisDoDia sinais={sinaisDoOrdo(d)} />
                  </>
                )}
                destacar={ehFestaMaiorDoOrdo}
              />
              <LegendaDaGrade
                sinais={["primeiraQuinta", "primeiraSexta", "brasil", "temporas"]}
              />
            </>
          ) : (
            <>
              <GradeDoMes
                dias={de1962}
                hoje={hoje}
                escolhido={escolhido}
                aoEscolher={(data) => irPara(data)}
                marcar={(d) => (
                  <>
                    <MarcaDePenitencia penitencia={penitenciaDe(d)} />
                    <SinaisDoDia sinais={sinaisDe1962(d)} />
                  </>
                )}
                destacar={(d) => d.classe <= 2}
              />
              <LegendaDaGrade
                sinais={["primeiraQuinta", "primeiraSexta", "brasil", "temporas"]}
              />
            </>
          )}

          <div className="calendario__cantos">
            <div className="calendario__troca">
              <button
                type="button"
                className="calendario__trocar"
                aria-label="Trocar de calendário"
                title="Trocar de calendário"
                aria-pressed={!pre55}
                onClick={() => trocar(pre55 ? "1962" : "pre55")}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 8h14l-4-4M20 16H6l4 4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
              <span className="calendario__aviso" role="status">
                {aviso}
              </span>
            </div>
            <BotaoDeAssinar />
          </div>
        </div>

        <div className="calendario__coluna-detalhe">
          {pre55
            ? doOrdo && <DetalheDoOrdo dia={doOrdo} />
            : de62 && <DetalheDoDia dia={de62} />}
        </div>
      </div>

      <section className="agendas" id="ordo-no-celular">
        <h2 className="agendas__titulo">O calendário no celular</h2>
        <ol className="lista">
          <li>Toque no <strong>+</strong>, no canto de baixo do calendário.</li>
          <li>Escolha o ano e <strong>Google Agenda</strong>, ou <strong>Outro aplicativo</strong> no iPhone e no Outlook.</li>
          <li>Confirme a inclusão. O calendário passa a se atualizar sozinho.</li>
        </ol>
      </section>

      <CartoesDeSecao padrao="/calendario" />

      <p className="calendario__ressalva">
        {pre55
          ? "Copiado do Ordo publicado pelo Apostolado, dia a dia, sem cálculo nem dedução — inclusive os dias de abstinência. Na dúvida, confira no Ordo."
          : "Cobre o Temporal, o Santoral de I a IV classe, as Têmporas, as Rogações e a transferência das festas de I classe impedidas, com o próprio do Brasil e o do Apostolado. Não trata das oitavas menores nem das Missas votivas. A abstinência segue a disciplina que o Ordo marca — todas as sextas, e jejum nas Cinzas e na Sexta-feira Santa —, mas as dispensas das festas só o Ordo tem. Na dúvida, confira no Ordo."}
      </p>
    </Moldura>
  );
}
