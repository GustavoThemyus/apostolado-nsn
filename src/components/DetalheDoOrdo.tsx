import {
  analisarMissa,
  celebracoesDoOrdo,
  patrocinioDoGrau,
  soAsPermitidas,
  type Celebracao,
  type DiaDoOrdo,
} from "../calendario/ordo";
import { NOME_DA_PENITENCIA } from "../calendario/penitencia";
import { NOME_DO_TEMPO } from "../calendario/tipos";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
  "agosto", "setembro", "outubro", "novembro", "dezembro"];

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco", vermelho: "Vermelho", verde: "Verde",
  roxo: "Roxo", preto: "Preto", rosa: "Rosa",
};

/** "sim" ou "não", com o motivo quando o Ordo o dá. */
function Sim({ v, porque }: { v: boolean; porque?: string }) {
  return (
    <>
      <span className={v ? "sinal sinal--sim" : "sinal sinal--nao"}>{v ? "sim" : "não"}</span>
      {porque && <span className="desenv__porque"> {porque}</span>}
    </>
  );
}

const ehMarcada = (p: string) => /^[➢❖]/.test(p);

/*
 * O parágrafo que só anuncia a penitência sai da lista: ele já virou a linha
 * em destaque acima e a cruz na grade, e repetido aqui embaixo é a mesma
 * informação pela terceira vez. Conferido: os 53 dias que a trazem dizem
 * exatamente uma destas três frases, e mais nada.
 */
const SO_PENITENCIA =
  /^(Dia de (jejum e )?abstinência|Hoje é dispensada a Abstinência de carne)$/i;

/**
 * Uma celebração do dia: a da capela, ou a de outro calendário.
 *
 * A primeira não leva rótulo, porque é a do dia e a página inteira já é sobre
 * ela. As seguintes levam o do Ordo — "No Calendário Universal", "No Brasil",
 * "Na Igreja Catedral da Arquidiocese da Paraíba" — ou, quando o Ordo as
 * anuncia só pelo posto, como a Missa das Rogações, o próprio posto.
 */
function BlocoDaCelebracao({
  celebracao,
  primeira,
}: {
  celebracao: Celebracao;
  primeira: boolean;
}) {
  const naMissa = analisarMissa(celebracao.missa);
  const notas = celebracao.notas.filter((p) => !SO_PENITENCIA.test(p.trim()));
  const permitidas = celebracao.permitidas.map(soAsPermitidas);
  const rotulo = celebracao.rotulo?.replace(/\s*:\s*$/, "").trim();

  return (
    <section className={primeira ? "ordo__celebracao" : "ordo__celebracao ordo__celebracao--outra"}>
      {!primeira && rotulo && <p className="ordo__celebracao-rotulo">{rotulo}</p>}
      {celebracao.posto && <p className="ordo__celebracao-posto">{celebracao.posto}</p>}

      {naMissa && (
        <div className="desenv">
          <p className="desenv__titulo">{primeira ? "Na Missa deste dia" : "Na Missa"}</p>
          <dl className="desenv__lista">
            {/*
              A Missa abre a tabela. Antes vinha depois dela, como parágrafo
              solto, e era a primeira coisa que se procura: é ela que muda de
              um dia para o outro, enquanto Glória e Credo se repetem.
            */}
            {naMissa.resto.length > 0 && (
              <div>
                <dt>Missa</dt>
                <dd>{naMissa.resto.join("; ")}</dd>
              </div>
            )}
            <div>
              <dt>Glória</dt>
              <dd><Sim v={naMissa.gloria} porque={naMissa.gloriaPorque} /></dd>
            </div>
            <div>
              <dt>Credo</dt>
              <dd><Sim v={naMissa.credo} porque={naMissa.credoPorque} /></dd>
            </div>
            {naMissa.comemoracoes.length > 0 && (
              <div>
                <dt>Comemoração</dt>
                <dd>{naMissa.comemoracoes.join("; ")}</dd>
              </div>
            )}
            {naMissa.entreAsLeituras.length > 0 && (
              <div>
                <dt>Entre as leituras</dt>
                <dd>{naMissa.entreAsLeituras.join("; ")}</dd>
              </div>
            )}
            {naMissa.prefacio && (
              <div>
                <dt>Prefácio</dt>
                <dd>
                  {naMissa.prefacio}
                  {naMissa.communicantes && (
                    <span className="desenv__porque"> e Communicantes próprio</span>
                  )}
                </dd>
              </div>
            )}
            {/*
              Sempre presente, porque o Perez quer o quadro igual em todo dia.
              O Ordo só o menciona quando foge do comum; calado, vale a regra
              geral — e isso fica dito, para a dedução não se passar pela
              palavra dele, que é o que esta tela evita em todo o resto.
            */}
            <div>
              <dt>Último Evangelho</dt>
              <dd>
                {naMissa.ultimoEvangelho ?? (
                  <>
                    prólogo de São João
                    <span className="desenv__porque"> pela regra geral</span>
                  </>
                )}
              </dd>
            </div>
            {naMissa.fecho && (
              <div>
                <dt>Despedida</dt>
                <dd>{naMissa.fecho}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/*
        Nos dias sem tabela a linha vem inteira, porque ali ela não é a Missa:
        é o rito próprio do dia — Sexta-feira Santa, Sábado Santo, a Vigília
        de Pentecostes — e não cabe em campos. Nos demais, a linha já subiu
        para a primeira casa da tabela.
      */}
      {!naMissa && celebracao.missa && <p className="ordo__missa">{celebracao.missa}</p>}

      {permitidas.length > 0 && (
        <p className="ordo__permitidas">
          <span className="ordo__permitidas-rotulo">Missas permitidas</span>
          {permitidas.join("; ")}
        </p>
      )}

      {notas.length > 0 && (
        <ul className="ordo__notas">
          {notas.map((p) => (
            <li className={ehMarcada(p) ? "ordo__nota" : "ordo__nota ordo__nota--corrida"} key={p}>
              {p.replace(/^[➢❖]\s*/, "")}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * O dia no Ordo da capela.
 *
 * Não é o irmão do `DetalheDoDia`: aquele mostra o que o motor de 1962 deduziu
 * — classe, Glória, Credo — e aqui nada é deduzido. O Ordo já diz a Missa, as
 * comemorações, o Prefácio e as rubricas, e o que esta tela faz é mostrá-las
 * com as palavras dele. Por isso o grau vem escrito ("Duples maior") e não
 * como número de classe: são vocabulários diferentes, e traduzir um no outro
 * seria dizer o que o Ordo não diz.
 *
 * O dia pode trazer mais de uma celebração — em 2026 são 35 dias —, e cada
 * uma vem no bloco dela. Antes a tela lia só a primeira linha e empilhava
 * todo o resto numa lista de observações, onde a Missa do Calendário
 * Universal ficava indistinguível de uma rubrica sobre quando ajoelhar.
 */
export function DetalheDoOrdo({ dia }: { dia: DiaDoOrdo }) {
  const celebracoes = celebracoesDoOrdo(dia);
  const { patrocinio, grau } = patrocinioDoGrau(dia.grau);

  return (
    <div className="calendario__detalhe">
      <p className="calendario__detalhe-data">
        {dia.data.getUTCDate()} de {MESES[dia.data.getUTCMonth()]} de{" "}
        {dia.data.getUTCFullYear()}
      </p>
      <p className="calendario__detalhe-nome">{dia.nome}</p>
      {/*
        O que o santo é para esta terra vem antes do grau, e separado dele:
        são coisas de natureza diferente, e o Ordo as escreve numa frase só.
      */}
      {patrocinio && <p className="ordo__patrocinio">{patrocinio}</p>}
      <dl className="dia__detalhes">
        <div>
          <dt>Tempo</dt>
          <dd>{NOME_DO_TEMPO[dia.tempo]}</dd>
        </div>
        <div>
          <dt>Cor</dt>
          <dd>
            <span className={`dia__amostra dia__amostra--${dia.cor}`} aria-hidden="true" />
            <span className={`cor cor--${dia.cor}`}>{NOME_DA_COR[dia.cor]}</span>
          </dd>
        </div>
        <div>
          <dt>Grau</dt>
          <dd>{grau}</dd>
        </div>
      </dl>

      {dia.cores && <p className="ordo__cores">{dia.cores[0].toUpperCase() + dia.cores.slice(1)}.</p>}
      {dia.guarda && <p className="ordo__guarda">Dia santo de guarda.</p>}
      {dia.penitencia && (
        <p className="dia__penitencia">
          <strong>{NOME_DA_PENITENCIA[dia.penitencia]}.</strong> Como o Ordo o marca.
        </p>
      )}

      {celebracoes.map((c, i) => (
        <BlocoDaCelebracao celebracao={c} primeira={i === 0} key={i} />
      ))}

      {/* o próprio é do dia, e não de uma das celebrações dele */}
      {dia.anexos && dia.anexos.length > 0 && (
        <p className="ordo__proprio">
          {dia.anexos.length === 1 ? (
            <a
              className="elo-texto elo-texto--externo"
              href={dia.anexos[0].url}
              target="_blank"
              rel="noreferrer noopener external"
            >
              Confira o próprio da Missa
            </a>
          ) : (
            <>
              <span className="ordo__proprio-rotulo">Próprio da Missa:</span>
              {dia.anexos.map((a) => (
                <a
                  className="elo-texto elo-texto--externo"
                  href={a.url}
                  key={a.url}
                  target="_blank"
                  rel="noreferrer noopener external"
                >
                  {a.nome}
                </a>
              ))}
            </>
          )}
        </p>
      )}
    </div>
  );
}
