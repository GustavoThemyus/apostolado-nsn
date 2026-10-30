import { useMemo } from "react";
import { Elo } from "../routes/Elo";
import { diaLiturgico } from "../calendario/precedencia";
import { analisarMissa, celebracoesDoOrdo, patrocinioDoGrau, temOrdo, type DiaDoOrdo } from "../calendario/ordo";
import { NOME_DA_PENITENCIA } from "../calendario/penitencia";
import { usarOrdo } from "../hooks/usarOrdo";
import { Desenvolvimento } from "./Desenvolvimento";
import { NomeDaFesta } from "./NomeDaFesta";
import { semOChapeu, TabelaDaMissa } from "./TabelaDaMissa";
import { mesmoDia } from "./GradeDoMes";
import { NOME_DO_TEMPO } from "../calendario/tipos";

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco",
  vermelho: "Vermelho",
  verde: "Verde",
  roxo: "Roxo",
  preto: "Preto",
  rosa: "Rosa",
};

/** "2026-12-08" -> "8 de dezembro". */
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

/**
 * Faixa com o dia litúrgico de hoje, no Ordo que a capela segue.
 *
 * "O calendário da página inicial eu quero que seja o pré 55", pediu o Perez,
 * e tem razão: quem chega ao site quer saber o que se reza *na capela* hoje,
 * não o que o Missal de 1962 mandaria. O de 1962 continua a um toque daqui,
 * no calendário do ano, com o botão que troca os dois.
 *
 * O Ordo só cobre os anos que o Apostolado publicou. Fora deles esta faixa
 * volta ao cálculo de 1962 — que é dedução, e não a palavra do Ordo, mas é
 * melhor que uma caixa vazia na primeira tela do site.
 */
export function DiaDeHoje({ data }: { data?: Date }) {
  const hoje = useMemo(() => {
    if (data) return data;
    const agora = new Date();
    return new Date(
      Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()),
    );
  }, [data]);

  const ano = hoje.getUTCFullYear();
  /*
   * `temOrdo` responde sem baixar nada, e é o que evita a troca de conteúdo
   * na cara do leitor: no ano sem Ordo a faixa de 1962 aparece já pronta, e
   * no ano com Ordo nunca se mostra o dia de 1962 para depois substituí-lo
   * por outro — o que apareceria como a festa de hoje mudando de nome.
   */
  const comOrdo = temOrdo(ano);
  const ordo = usarOrdo(ano, hoje.getUTCMonth() + 1, comOrdo);
  const doOrdo = useMemo(
    () => ordo.dias.find((d) => mesmoDia(d.data, hoje)),
    [ordo.dias, hoje],
  );

  if (!comOrdo) return <De1962 hoje={hoje} />;

  return (
    <aside
      /*
       * Enquanto o Ordo do ano não chega, a faixa guarda a altura que vai
       * ocupar. Sem isso o que vem abaixo dela — os avisos, os cartões —
       * subia e descia na primeira tela do site, a cada visita.
       */
      className={`dia${doOrdo ? "" : " dia--carregando"}`}
      aria-label="Dia litúrgico de hoje"
      aria-busy={doOrdo ? undefined : true}
    >
      <p className="dia__data">{porExtenso(hoje)}</p>
      {doOrdo && <DoOrdo dia={doOrdo} />}
      <Elo para="/calendario?uso=pre55" className="dia__link">
        Ver o calendário do ano
      </Elo>
    </aside>
  );
}

/** O dia como o Ordo da capela o traz: nada deduzido, tudo copiado. */
function DoOrdo({ dia }: { dia: DiaDoOrdo }) {
  const celebracao = celebracoesDoOrdo(dia)[0];
  const naMissa = analisarMissa(celebracao?.missa);
  const { patrocinio, grau } = patrocinioDoGrau(dia.grau);
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
        <div>
          <dt>Grau</dt>
          <dd>{grau}</dd>
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
      {/*
        Só a Missa da capela. O dia pode trazer a do Calendário Universal e a
        do Brasil, e as rubricas dele, mas aqui é faixa de resumo: o dia
        inteiro está no calendário, a um toque.
      */}
      {naMissa && <TabelaDaMissa naMissa={naMissa} titulo="Na Missa deste dia" />}
    </>
  );
}

/**
 * O dia deduzido das rubricas de 1962, para os anos sem Ordo publicado.
 *
 * Cobre o Temporal e o Santoral; é o mesmo motor da página do calendário.
 */
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
      <Elo para="/calendario" className="dia__link">
        Ver o calendário do ano
      </Elo>
    </aside>
  );
}
