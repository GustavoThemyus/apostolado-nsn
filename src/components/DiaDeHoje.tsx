import { useMemo } from "react";
import { Elo } from "../routes/Elo";
import { diaLiturgico } from "../calendar/precedencia";
import { analisarMissa, celebracoesDoOrdo, patrocinioDoGrau, naQuaresma, soONomeDaMissa, temOrdo, type DiaDoOrdo } from "../calendar/ordo";
import { NOME_DA_PENITENCIA } from "../calendar/penitencia";
import { usarOrdo } from "../hooks/usarOrdo";
import { Desenvolvimento } from "./Desenvolvimento";
import { NomeDaFesta } from "./NomeDaFesta";
import { NotasDoOrdo } from "./NotasDoOrdo";
import { semOChapeu, TabelaDaMissa } from "./TabelaDaMissa";
import { mesmoDia } from "./GradeDoMes";
import { comoIso } from "../calendar/dias";
import { Seta } from "./Seta";
import { NOME_DO_TEMPO } from "../calendar/tipos";

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco",
  vermelho: "Vermelho",
  verde: "Verde",
  roxo: "Roxo",
  preto: "Preto",
  rosa: "Rosa",
};

export function porExtensoCurto(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
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
  return `${d} de ${MESES[m - 1]}`;
}

function porExtenso(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(data);
}

export function DiaDeHoje({ data }: { data?: Date }) {
  const hoje = useMemo(() => {
    if (data) return data;
    const agora = new Date();
    return new Date(
      Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()),
    );
  }, [data]);

  const ano = hoje.getUTCFullYear();
  const comOrdo = temOrdo(ano, hoje.getUTCMonth() + 1, hoje.getUTCDate());
  const ordo = usarOrdo(ano, hoje.getUTCMonth() + 1, comOrdo);
  const doOrdo = useMemo(
    () => ordo.dias.find((d) => mesmoDia(d.data, hoje)),
    [ordo.dias, hoje],
  );

  if (!comOrdo) return <De1962 hoje={hoje} />;

  return (
    <aside
      className={`dia${doOrdo ? "" : " dia--carregando"}`}
      aria-label="Dia litúrgico de hoje"
      aria-busy={doOrdo ? undefined : true}
    >
      <p className="dia__data">{porExtenso(hoje)}</p>
      {doOrdo && <DoOrdo dia={doOrdo} />}
      <div className="dia__acoes">
        <Elo para={`/missa/dia?dia=${comoIso(hoje)}`} className="dia__modo-missa">
          Acompanhar a Missa
          <Seta className="cartao__seta" />
        </Elo>
        <Elo para="/calendario?uso=pre55" className="dia__link">
          Ver o calendário do ano
        </Elo>
      </div>
    </aside>
  );
}

function DoOrdo({ dia }: { dia: DiaDoOrdo }) {
  const celebracao = celebracoesDoOrdo(dia)[0];
  const naMissa = analisarMissa(celebracao?.missa);
  const { patrocinio, grau: rito } = patrocinioDoGrau(dia.rito);
  const paraVinculo = {
    nome: dia.nome,
    data: dia.data,
    comemoracoes: naMissa?.comemoracoes,
  };

  return (
    <>
      <NomeDaFesta dia={paraVinculo} classe="dia__nome" />
      {patrocinio && <p className="ordo__patrocinio">{patrocinio}</p>}
      <dl className="dia__detalhes">
        <div>
          <dt>Tempo</dt>
          <dd>{NOME_DO_TEMPO[dia.tempo]}</dd>
        </div>
        <div>
          <dt>Cor</dt>
          <dd>
            <span
              className={`dia__amostra dia__amostra--${dia.cor}`}
              aria-hidden="true"
            />
            <span className={`cor cor--${dia.cor}`}>
              {NOME_DA_COR[dia.cor]}
            </span>
          </dd>
        </div>
        {dia.grau && (
          <div>
            <dt>Grau</dt>
            <dd>{dia.grau}</dd>
          </div>
        )}
        <div>
          <dt>Rito</dt>
          <dd>{rito}</dd>
        </div>
      </dl>
      {dia.guarda && <p className="ordo__guarda">Dia santo de guarda.</p>}
      {dia.penitencia && (
        <p className="dia__penitencia">
          <strong>{NOME_DA_PENITENCIA[dia.penitencia]}.</strong> Como o Ordo o marca.
        </p>
      )}
      {naMissa && naMissa.comemoracoes.length > 0 && (
        <p className="dia__comemoracoes">
          <span>Comemoração: </span>
          {naMissa.comemoracoes.map(semOChapeu).join("; ")}
        </p>
      )}
      {naMissa && <TabelaDaMissa
          naMissa={naMissa}
          titulo="Na Missa deste dia"
          quaresma={naQuaresma(dia.tempo)}
          soONome={soONomeDaMissa(dia.data)}
        />}
      <NotasDoOrdo notas={celebracao?.notas ?? []} />
    </>
  );
}

function De1962({ hoje }: { hoje: Date }) {
  const dia = diaLiturgico(hoje);

  return (
    <aside className="dia" aria-label="Dia litúrgico de hoje">
      <p className="dia__data">{porExtenso(hoje)}</p>
      <NomeDaFesta dia={dia} classe="dia__nome" />
      <dl className="dia__detalhes">
        <div>
          <dt>Tempo</dt>
          <dd>{NOME_DO_TEMPO[dia.tempo]}</dd>
        </div>
        <div>
          <dt>Cor</dt>
          <dd>
            <span
              className={`dia__amostra dia__amostra--${dia.cor}`}
              aria-hidden="true"
            />
            <span className={`cor cor--${dia.cor}`}>
              {NOME_DA_COR[dia.cor]}
            </span>
          </dd>
        </div>
        <div>
          <dt>Classe</dt>
          <dd>{dia.classe}ª</dd>
        </div>
      </dl>
      {dia.comemoracoes.length > 0 && (
        <p className="dia__comemoracoes">
          <span>Comemoração: </span>
          {dia.comemoracoes.join("; ")}
        </p>
      )}
      {dia.transferidaDe && (
        <p className="dia__transferida">
          Transferida de {porExtensoCurto(dia.transferidaDe)}, por impedimento.
        </p>
      )}
      {dia.observacoes.map((o) => (
        <p className="dia__observacao" key={o}>
          {o}
        </p>
      ))}
      <Desenvolvimento dia={dia} />
      <div className="dia__acoes">
        <Elo para={`/missa/dia?dia=${comoIso(hoje)}`} className="dia__modo-missa">
          Acompanhar a Missa
          <Seta className="cartao__seta" />
        </Elo>
        <Elo para="/calendario" className="dia__link">
          Ver o calendário do ano
        </Elo>
      </div>
    </aside>
  );
}
