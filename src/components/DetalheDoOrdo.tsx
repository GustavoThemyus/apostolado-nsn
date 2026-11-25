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

/**
 * O próprio do dia, quando ele já está transcrito aqui.
 *
 * O Ordo anexa a cada dia o PDF do próprio, no Drive do Apostolado, e alguns
 * desses PDFs já viraram folheto neste site. Quando viraram, o elo leva ao
 * folheto: lê-se no celular, sem baixar nada e sem dar zoom, que é o ponto
 * de hospedá-lo. Quando não, continua levando ao PDF, como sempre levou.
 *
 * Quem acha o folheto mora em `src/calendario/proprioDoDia.ts`, porque agora
 * são duas as telas que precisam dele: esta e o modo missa.
 */
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

/**
 * Uma celebração do dia: a da capela, ou a de outro calendário.
 *
 * A primeira não leva rótulo, porque é a do dia e a página inteira já é sobre
 * ela. As seguintes levam o do Ordo — "No Calendário Universal", "No Brasil",
 * "Na Igreja Catedral da Arquidiocese da Paraíba" — ou, quando o Ordo as
 * anuncia só pelo posto, como a Missa das Rogações, o próprio posto.
 */
/** Grau, rito e cor: o mesmo quadro para o dia e para cada Missa extra. */
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
      {/* o posto só se repete no corpo quando não foi ele o resumo */}
      {celebracao.posto && (primeira || !!rotulo) && (
        <p className="ordo__celebracao-posto">{celebracao.posto}</p>
      )}

      {/*
        De que próprio sai a Missa, quando o Ordo diz.

        Em 39 celebrações de 2026 ele escreve o título acima da linha da Missa
        e recua a linha embaixo: "Próprio do Brasil", "Próprio da Arquidiocese
        da Paraíba", "Quatro Têmporas da Quaresma". É resposta à pergunta de
        onde se tira a Missa do dia, e perdê-la deixaria "Missa Terribilis"
        sem dizer em que livro ela está.
      */}
      {celebracao.proprio && (
        <p className="ordo__celebracao-proprio">{celebracao.proprio}</p>
      )}

      {/* a Missa extra com a mesma cabeça que o dia tem lá em cima */}
      {celebracao.ficha && (
        <>
          {/* recolhida, o nome já é o resumo; passada para o lado, não é */}
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

      <NotasDoOrdo notas={celebracao.notas} />
    </>
  );

  if (primeira) return <section className="ordo__celebracao">{corpo}</section>;

  /*
   * Recolhida, e aberta por uma seta.
   *
   * É o que o Perez pediu desde a primeira mensagem sobre o calendário: "você
   * coloca uma setinha, aí dessa setinha ela vai puxar outra missa". O que
   * interessa a quem abre o dia é a Missa da capela; as outras são consulta.
   *
   * `<details>` e não um botão: a seta vem de graça, abre sem script, e o
   * leitor de tela já sabe anunciar o estado.
   */
  return (
    <details className="ordo__celebracao ordo__celebracao--outra">
      <summary className="ordo__celebracao-resumo">
        <span className="ordo__celebracao-rotulo">{rotulo ?? celebracao.ficha?.nome ?? celebracao.posto ?? "Outra Missa"}</span>
      </summary>
      {corpo}
    </details>
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
  /* a da Igreja universal não se recolhe: passa-se para o lado */
  const { daqui, universal } = ladosDoDia(celebracoes);
  const { patrocinio, grau: rito } = patrocinioDoGrau(dia.rito);
  /*
   * A postagem acompanha a festa, e não a casa do calendário.
   *
   * As comemorações da Missa entram na busca junto com o nome do dia: Santa
   * Filomena cai dentro da Oitava da Dedicação da Titular, e no Ordo daquele
   * dia ela é comemoração, não título.
   */
  const paraVinculo = {
    nome: dia.nome,
    data: dia.data,
    comemoracoes: analisarMissa(celebracoes[0]?.missa)?.comemoracoes,
  };
  const postagem = postagemDoDia(publicadas(), paraVinculo);

  /* a primeira de cada lado vem aberta; as outras, recolhidas */
  const emLista = (missas: Celebracao[]) =>
    missas.map((c, i) => (
      <Fragment key={i}>
        {/* o aviso entra uma vez, antes da primeira das alternativas */}
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
      {/*
        O que o santo é para esta terra vem antes do grau, e separado dele:
        são coisas de natureza diferente, e o Ordo as escreve numa frase só.
      */}
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

      {/* o próprio é do dia, e não de uma das celebrações dele */}
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

      {/*
       * O modo missa: o Ordinário inteiro, com o próprio deste dia já
       * encaixado nos dez lugares que o impresso deixa em branco.
       */}
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
