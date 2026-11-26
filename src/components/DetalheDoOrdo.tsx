import { Deslize } from "./Deslize";
import { Fragment, type ReactNode } from "react";
import {
  analisarMissa,
  celebracoesDoOrdo,
  ladosDoDia,
  patrocinioDoGrau,
  soAsPermitidas,
  naQuaresma,
  soONomeDaMissa,
  type Celebracao,
  type DiaDoOrdo,
} from "../calendario/ordo";
import { NOME_DA_PENITENCIA } from "../calendario/penitencia";
import { NOME_DO_TEMPO } from "../calendario/tipos";
import { NomeDaFesta } from "./NomeDaFesta";
import { NotasDoOrdo } from "./NotasDoOrdo";
import { Seta } from "./Seta";
import { TabelaDaMissa } from "./TabelaDaMissa";
import { postagemDoDia } from "../calendario/vinculo";
import { publicadas } from "../data/postagens";
import { folhetoDoAnexo } from "../calendario/proprioDoDia";
import { comoIso } from "../calendario/dias";
import { Elo } from "../routes/Elo";

function EloDoProprio({
  anexo,
  children,
}: {
  anexo: { nome: string; url: string };
  children: ReactNode;
}) {
  const folheto = folhetoDoAnexo(anexo.url);
  if (folheto) {
    return (
      <Elo para={`/folhetos/${folheto}`} className="elo-texto">
        {children}
      </Elo>
    );
  }
  return (
    <a
      className="elo-texto elo-texto--externo"
      href={anexo.url}
      target="_blank"
      rel="noreferrer noopener external"
    >
      {children}
    </a>
  );
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
  "agosto", "setembro", "outubro", "novembro", "dezembro"];

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco", vermelho: "Vermelho", verde: "Verde",
  roxo: "Roxo", preto: "Preto", rosa: "Rosa",
};

function Ficha({ grau, rito, cor, tempo }: Pick<DiaDoOrdo, "grau" | "rito" | "cor"> & {
  tempo?: DiaDoOrdo["tempo"];
}) {
  return (
    <dl className="dia__detalhes">
      {tempo && (
        <div>
          <dt>Tempo</dt>
          <dd>{NOME_DO_TEMPO[tempo]}</dd>
        </div>
      )}
      <div>
        <dt>Cor</dt>
        <dd>
          <span className={`dia__amostra dia__amostra--${cor}`} aria-hidden="true" />
          <span className={`cor cor--${cor}`}>{NOME_DA_COR[cor]}</span>
        </dd>
      </div>
      {grau && (
        <div>
          <dt>Grau</dt>
          <dd>{grau}</dd>
        </div>
      )}
      <div>
        <dt>Rito</dt>
        <dd>{rito}</dd>
      </div>
    </dl>
  );
}

function BlocoDaCelebracao({
  celebracao,
  primeira,
  quaresma,
  soONome,
}: {
  celebracao: Celebracao;
  primeira: boolean;
  quaresma: boolean;
  soONome: boolean;
}) {
  const naMissa = analisarMissa(celebracao.missa);
  const permitidas = celebracao.permitidas.map(soAsPermitidas);
  const rotulo = celebracao.rotulo?.replace(/\s*:\s*$/, "").trim();

  const corpo = (
    <>
      {celebracao.posto && (primeira || !!rotulo) && (
        <p className="ordo__celebracao-posto">{celebracao.posto}</p>
      )}

      {celebracao.proprio && (
        <p className="ordo__celebracao-proprio">{celebracao.proprio}</p>
      )}

      {celebracao.ficha && (
        <>
          {primeira && <p className="ordo__celebracao-posto">{celebracao.ficha.nome}</p>}
          {celebracao.ficha.subtitulo && (
            <p className="ordo__patrocinio">{celebracao.ficha.subtitulo}</p>
          )}
          <Ficha {...celebracao.ficha} />
          {celebracao.ficha.cores && <p className="ordo__cores">{celebracao.ficha.cores}.</p>}
        </>
      )}

      {naMissa && (
        <TabelaDaMissa
          naMissa={naMissa}
          quaresma={quaresma}
          soONome={soONome}
          titulo={primeira && !celebracao.ficha ? "Na Missa deste dia" : "Na Missa"}
        />
      )}

      {!naMissa && celebracao.missa && <p className="ordo__missa">{celebracao.missa}</p>}

      {permitidas.length > 0 && (
        <p className="ordo__permitidas">
          <span className="ordo__permitidas-rotulo">Missas permitidas</span>
          {permitidas.join("; ")}
        </p>
      )}

      <NotasDoOrdo notas={celebracao.notas} />
    </>
  );

  if (primeira) return <section className="ordo__celebracao">{corpo}</section>;

  return (
    <details className="ordo__celebracao ordo__celebracao--outra">
      <summary className="ordo__celebracao-resumo">
        <span className="ordo__celebracao-rotulo">{rotulo ?? celebracao.ficha?.nome ?? celebracao.posto ?? "Outra Missa"}</span>
      </summary>
      {corpo}
    </details>
  );
}

export function DetalheDoOrdo({ dia }: { dia: DiaDoOrdo }) {
  const celebracoes = celebracoesDoOrdo(dia);
  const { daqui, universal } = ladosDoDia(celebracoes);
  const { patrocinio, grau: rito } = patrocinioDoGrau(dia.rito);
  const paraVinculo = {
    nome: dia.nome,
    data: dia.data,
    comemoracoes: analisarMissa(celebracoes[0]?.missa)?.comemoracoes,
  };
  const postagem = postagemDoDia(publicadas(), paraVinculo);

  const emLista = (missas: Celebracao[]) =>
    missas.map((c, i) => (
      <Fragment key={i}>
        {c.alternativa && !missas[i - 1]?.alternativa && (
          <p className="ordo__escolha">
            {c.ficha ? "É possível também celebrar:" : "Pode-se celebrar, à escolha:"}
          </p>
        )}
        <BlocoDaCelebracao
          celebracao={c}
          primeira={i === 0}
          quaresma={naQuaresma(dia.tempo)}
          soONome={soONomeDaMissa(dia.data)}
        />
      </Fragment>
    ));

  return (
    <div className="calendario__detalhe">
      <p className="calendario__detalhe-data">
        {dia.data.getUTCDate()} de {MESES[dia.data.getUTCMonth()]} de{" "}
        {dia.data.getUTCFullYear()}
      </p>
      <NomeDaFesta dia={paraVinculo} />
      {patrocinio && <p className="ordo__patrocinio">{patrocinio}</p>}
      {dia.subtitulo && <p className="ordo__patrocinio">{dia.subtitulo}</p>}
      <Ficha tempo={dia.tempo} cor={dia.cor} grau={dia.grau} rito={rito} />

      {dia.cores && <p className="ordo__cores">{dia.cores[0].toUpperCase() + dia.cores.slice(1)}.</p>}
      {dia.guarda && <p className="ordo__guarda">Dia santo de guarda.</p>}
      {dia.penitencia && (
        <p className="dia__penitencia">
          <strong>{NOME_DA_PENITENCIA[dia.penitencia]}.</strong> Como o Ordo o marca.
        </p>
      )}

      {universal.length > 0 ? (
        <Deslize
          key={comoIso(dia.data)}
          paineis={[
            { rotulo: "No Brasil", corpo: emLista(daqui) },
            {
              rotulo: universal[0].rotulo!.replace(/\s*:\s*$/, "").trim(),
              corpo: emLista(universal),
            },
          ]}
        />
      ) : (
        emLista(daqui)
      )}

      {dia.anexos && dia.anexos.length > 0 && (
        <p className="ordo__proprio">
          {dia.anexos.length === 1 ? (
            <EloDoProprio anexo={dia.anexos[0]}>
              {folhetoDoAnexo(dia.anexos[0].url)
                ? "Ler o próprio da Missa"
                : "Confira o próprio da Missa"}
            </EloDoProprio>
          ) : (
            <>
              <span className="ordo__proprio-rotulo">Próprio da Missa:</span>
              {dia.anexos.map((a) => (
                <EloDoProprio anexo={a} key={a.url}>
                  {a.nome}
                </EloDoProprio>
              ))}
            </>
          )}
        </p>
      )}

      <Elo
        para={`/missa/dia?dia=${comoIso(dia.data)}`}
        className="dia__modo-missa"
      >
        Acompanhar a Missa
        <Seta className="cartao__seta" />
      </Elo>

      {postagem && (
        <Elo para={`/postagens/${postagem.id}`} className="dia__postagem">
          <span className="dia__postagem-rotulo">Sobre esta festa</span>
          <span className="dia__postagem-titulo">{postagem.titulo}</span>
          <Seta className="cartao__seta" />
        </Elo>
      )}
    </div>
  );
}
