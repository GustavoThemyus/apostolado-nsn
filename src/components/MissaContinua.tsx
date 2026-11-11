import { Fragment, useEffect, useMemo, useState } from "react";
import { comoIso, diaDaBusca, hojeUTC } from "../calendario/dias";
import { naMissaDoOrdo, temOrdo } from "../calendario/ordo";
import { naMissaDoDia, type NaMissaDoDia } from "../calendario/naMissaDoDia";
import { folhetoDoDia } from "../calendario/proprioDoDia";
import { porId } from "../data/folhetos";
import { SECOES, carregarSecoes, type TextoDaSecao } from "../data/ordinario";
import { montarSecoes, type ItemNaTela, type OpcoesDeLeitura } from "../data/ordinarioNaTela";
import { usarOrdo } from "../hooks/usarOrdo";
import { Elo } from "../routes/Elo";
import { usarRota } from "../routes/usarRota";
import { mesmoDia } from "./GradeDoMes";
import { Bloco } from "./Bloco";
import { Moldura } from "./Moldura";
import { PosturaDoFiel } from "./PosturaDoFiel";
import { ComOProprioDoDia } from "./ProprioDoDia";

/**
 * Os grupos que se abrem e se fecham, no padrão do calendário: um `<details>`,
 * com a seta do navegador. Só a oração preparatória nasce aberta, porque o
 * Perez quer que ela fique sempre à vista, para incentivar. Os outros são
 * opcionais ou dependem da Missa (incenso, Leoninas) e nascem fechados.
 */
const GRUPOS: Record<string, { titulo: (dia: NaMissaDoDia) => string; aberto?: boolean }> = {
  "preparacao": { titulo: () => "Oração preparatória", aberto: true },
  "aspersao": {
    titulo: (d) =>
      d.aspersao === "vidi-aquam"
        ? "Vidi aquam: a aspersão do Tempo Pascal"
        : "Asperges me: a aspersão do domingo",
  },
  "incenso-inicial": { titulo: () => "Bênção do incenso, quando há incenso" },
  "incensacao": { titulo: () => "Incensação das oferendas, quando há incenso" },
  "leoninas": { titulo: () => "Orações Leoninas, na Missa rezada" },
  "acao-de-gracas": { titulo: () => "Ação de graças depois da Missa" },
};

/** A seção que não abre com título no impresso ganha um aqui. */
const TITULO_NA_PAGINA = (id: string, dia: NaMissaDoDia): string | undefined =>
  id === "asperges"
    ? dia.aspersao
      ? "Entrada do sacerdote e aspersão"
      : "Entrada do sacerdote"
    : SECOES.find((s) => s.id === id)?.titulo;

const CHAVE = "ordinario:leitura";
const PADRAO: OpcoesDeLeitura = { vozes: "altas", rubricas: true };

/** A escolha do fiel fica no aparelho dele: é conveniência, não dado da página. */
function usarOpcoes(): [OpcoesDeLeitura, (o: Partial<OpcoesDeLeitura>) => void] {
  const [opcoes, definir] = useState<OpcoesDeLeitura>(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
      if (guardado && (guardado.vozes === "altas" || guardado.vozes === "todas")) {
        return { vozes: guardado.vozes, rubricas: guardado.rubricas !== false };
      }
    } catch {
      /* sem armazenamento: vale o padrão */
    }
    return PADRAO;
  });
  const mudar = (parte: Partial<OpcoesDeLeitura>) =>
    definir((atual) => {
      const novo = { ...atual, ...parte };
      try {
        localStorage.setItem(CHAVE, JSON.stringify(novo));
      } catch {
        /* idem */
      }
      return novo;
    });
  return [opcoes, mudar];
}

function Itens({ itens, dia }: { itens: ItemNaTela[]; dia: NaMissaDoDia }) {
  return (
    <>
      {itens.map((item, i) => {
        if (item.tipo === "bloco") {
          return (
            <Fragment key={i}>
              {item.postura && <PosturaDoFiel postura={item.postura} />}
              <Bloco bloco={item.bloco} />
            </Fragment>
          );
        }
        const grupo = GRUPOS[item.id];
        if (!grupo) return <Itens key={i} itens={item.itens} dia={dia} />;
        return (
          <details className="opcional" key={i} open={grupo.aberto || undefined}>
            <summary className="opcional__resumo">
              <span className="opcional__rotulo">{grupo.titulo(dia)}</span>
            </summary>
            <div className="opcional__corpo">
              <Itens itens={item.itens} dia={dia} />
            </div>
          </details>
        );
      })}
    </>
  );
}

function Controles({
  opcoes,
  mudar,
}: {
  opcoes: OpcoesDeLeitura;
  mudar: (o: Partial<OpcoesDeLeitura>) => void;
}) {
  return (
    <div className="leitura" role="group" aria-label="Como ler a Missa">
      <div className="leitura__vozes" role="group" aria-label="O que ler">
        <button
          type="button"
          className="leitura__botao"
          aria-pressed={opcoes.vozes === "altas"}
          onClick={() => mudar({ vozes: "altas" })}
        >
          Só o que se diz em voz alta
        </button>
        <button
          type="button"
          className="leitura__botao"
          aria-pressed={opcoes.vozes === "todas"}
          onClick={() => mudar({ vozes: "todas" })}
        >
          Tudo, com o silêncio
        </button>
      </div>
      <button
        type="button"
        className="leitura__botao leitura__botao--chave"
        aria-pressed={opcoes.rubricas}
        onClick={() => mudar({ rubricas: !opcoes.rubricas })}
      >
        Rubricas e explicações
      </button>
    </div>
  );
}

/**
 * A Missa numa leitura só, do começo ao fim.
 *
 * Serve à página do Ordinário e à da Missa do dia: o texto é o mesmo e o que
 * muda é o recorte (`ids`) e se o próprio do dia entra nos dez lugares que o
 * impresso deixa em branco. As escolhas do fiel (voz alta ou tudo, com ou sem
 * rubricas) filtram esse mesmo texto, e não escolhem entre cópias dele.
 *
 * Quem decide o que a Missa de hoje tem é o calendário (`naMissaDoDia`); aqui
 * só se mostra. O Ordo publicado, quando cobre o ano, manda no Glória e no
 * Credo; fora dele valem as rubricas gerais.
 */
export function MissaContinua({
  titulo,
  subtitulo,
  ids,
  comProprio,
}: {
  titulo: string;
  subtitulo?: string;
  ids: string[];
  comProprio: boolean;
}) {
  const { busca } = usarRota();
  const hoje = useMemo(hojeUTC, []);
  const dia = useMemo(() => diaDaBusca(busca, hoje), [busca, hoje]);
  const iso = comoIso(dia);

  const ano = dia.getUTCFullYear();
  const ordo = usarOrdo(ano, dia.getUTCMonth() + 1, temOrdo(ano));
  const doOrdo = ordo.dias.find((d) => mesmoDia(d.data, dia));
  const folheto = comProprio ? porId(folhetoDoDia(doOrdo?.anexos)) : undefined;
  const naDoDia = useMemo(
    () => naMissaDoDia(dia, doOrdo ? naMissaDoOrdo(doOrdo) : null),
    [dia, doOrdo],
  );

  const [carregadas, definirCarregadas] = useState<TextoDaSecao[] | null>(null);
  useEffect(() => {
    let vivo = true;
    void carregarSecoes(ids).then((r) => {
      if (vivo) definirCarregadas(r.filter((s): s is TextoDaSecao => s !== null));
    });
    return () => {
      vivo = false;
    };
  }, [ids]);

  const [opcoes, mudar] = usarOpcoes();
  const secoes = useMemo(
    () => (carregadas ? montarSecoes(carregadas, naDoDia, opcoes) : []),
    [carregadas, naDoDia, opcoes],
  );
  const comTexto = secoes.filter((s) => s.itens.length > 0);
  const abreComTitulo = (id: string) =>
    carregadas?.find((s) => s.id === id)?.blocos[0]?.tipo === "subtitulo";

  const rito = naDoDia.ritoProprio;
  const esperandoOrdo = ordo.carregando;

  return (
    <Moldura titulo={titulo} comProgresso>
      <h1 className="modo-missa__nome">{titulo}</h1>
      {subtitulo && <p className="modo-missa__subtitulo lat" lang="la">{subtitulo}</p>}

      <p className="modo-missa__dia">
        {doOrdo ? doOrdo.nome : "Dia fora do Ordo publicado"}
        {" · "}
        <Elo para={`/calendario?dia=${iso}&uso=pre55`} className="elo-texto">
          ver o dia no calendário
        </Elo>
        {!comProprio && (
          <>
            {" · "}
            <Elo para={`/missa/dia?dia=${iso}`} className="elo-texto">
              Missa do dia
            </Elo>
          </>
        )}
      </p>

      {rito && (
        <p className="modo-missa__aviso">
          {rito.nome}. {rito.nota}
        </p>
      )}
      {comProprio && !folheto && !rito && !esperandoOrdo && (
        <p className="modo-missa__aviso">
          O próprio deste dia ainda não está transcrito aqui. Os lugares da
          Missa do dia ficam como no impresso, remetendo ao próprio.
        </p>
      )}

      {!(comProprio && rito) && (
        <>
          <Controles opcoes={opcoes} mudar={mudar} />

          <nav className="modo-missa__secoes" aria-label="Partes da Missa">
            {comTexto.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={
                  "modo-missa__secao" +
                  (SECOES.find((x) => x.id === s.id)?.naMissa ? "" : " modo-missa__secao--fora")
                }
              >
                {TITULO_NA_PAGINA(s.id, naDoDia)}
              </a>
            ))}
          </nav>

          <article className={"folheto folheto--proprio" + (opcoes.rubricas ? "" : " ordinario--sem-rubricas")}>
            <ComOProprioDoDia folheto={folheto} dia={iso}>
              {!carregadas || esperandoOrdo ? (
                <p className="modo-missa__aviso">Carregando…</p>
              ) : (
                comTexto.map((s) => (
                  <section className="ordinario__secao" id={s.id} key={s.id}>
                    {!abreComTitulo(s.id) && (
                      <h3 className="subtitulo">{TITULO_NA_PAGINA(s.id, naDoDia)}</h3>
                    )}
                    <Itens itens={s.itens} dia={naDoDia} />
                  </section>
                ))
              )}
            </ComOProprioDoDia>
          </article>
        </>
      )}
    </Moldura>
  );
}
