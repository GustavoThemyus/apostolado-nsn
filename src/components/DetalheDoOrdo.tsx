import { Fragment } from "react";
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
import { NomeDaFesta } from "./NomeDaFesta";
import { NotasDoOrdo } from "./NotasDoOrdo";
import { Seta } from "./Seta";
import { TabelaDaMissa } from "./TabelaDaMissa";
import { postagemDoDia } from "../calendario/vinculo";
import { publicadas } from "../data/postagens";
import { Elo } from "../routes/Elo";

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
function BlocoDaCelebracao({
  celebracao,
  primeira,
}: {
  celebracao: Celebracao;
  primeira: boolean;
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

      {naMissa && (
        <TabelaDaMissa
          naMissa={naMissa}
          titulo={primeira ? "Na Missa deste dia" : "Na Missa"}
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
        <span className="ordo__celebracao-rotulo">{rotulo ?? celebracao.posto ?? "Outra Missa"}</span>
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
  const { patrocinio, grau } = patrocinioDoGrau(dia.grau);
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
        <Fragment key={i}>
          {/* o aviso entra uma vez, antes da primeira das alternativas */}
          {c.alternativa && !celebracoes[i - 1]?.alternativa && (
            <p className="ordo__escolha">Pode-se celebrar, à escolha:</p>
          )}
          <BlocoDaCelebracao celebracao={c} primeira={i === 0} />
        </Fragment>
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
