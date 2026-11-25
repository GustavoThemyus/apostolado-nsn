import type { PosturaDoMomento } from "../data/tipos";
import { Fragment, useEffect, useMemo, useState } from "react";
import { comoIso, diaDaBusca, hojeUTC } from "../calendario/dias";
import { naMissaDoOrdo, temOrdo } from "../calendario/ordo";
import { naMissaDoDia, type NaMissaDoDia } from "../calendario/naMissaDoDia";
import { folhetoDoDia } from "../calendario/proprioDoDia";
import { porId } from "../data/folhetos";
import {
  SECOES,
  aberturaDoEvangelho,
  carregarSecoes,
  comEvangelhoDoDia,
  semLausDoOrdinario,
  type TextoDaSecao,
} from "../data/ordinario";
import { montarSecoes, type ItemNaTela } from "../data/ordinarioNaTela";
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

type BlocoNaTela = Extract<ItemNaTela, { tipo: "bloco" }>;

/**
 * Os itens em trechos de uma só postura.
 *
 * Um subtítulo fica fora do trecho, e o encerra: assim o aviso de postura vem
 * depois do título da parte, junto do texto a que se refere, e nunca solto
 * entre uma parte e outra.
 */
function emTrechos(itens: ItemNaTela[]): (ItemNaTela | { tipo: "trecho"; blocos: BlocoNaTela[] })[] {
  const saida: (ItemNaTela | { tipo: "trecho"; blocos: BlocoNaTela[] })[] = [];
  for (const item of itens) {
    if (item.tipo !== "bloco" || !item.postura || item.bloco.tipo === "subtitulo") {
      saida.push(item);
      continue;
    }
    const ultimo = saida[saida.length - 1];
    if (
      ultimo?.tipo === "trecho" &&
      JSON.stringify(ultimo.blocos[0].postura) === JSON.stringify(item.postura)
    ) {
      ultimo.blocos.push(item);
    } else {
      saida.push({ tipo: "trecho", blocos: [item] });
    }
  }
  return saida;
}

/** A classe do filete: a postura, ou "mista" quando rezada e cantada divergem. */
const filete = (p: PosturaDoMomento): string =>
  typeof p === "string" ? p : p.rezada === p.cantada ? p.rezada : "mista";

function Itens({ itens, dia }: { itens: ItemNaTela[]; dia: NaMissaDoDia }) {
  return (
    <>
      {emTrechos(itens).map((item, i) => {
        if (item.tipo === "trecho") {
          const postura = item.blocos[0].postura!;
          return (
            <div className={`trecho trecho--${filete(postura)}`} key={i}>
              <PosturaDoFiel postura={postura} />
              {item.blocos.map((b, n) => (
                <Bloco bloco={b.bloco} key={n} />
              ))}
            </div>
          );
        }
        if (item.tipo === "bloco") {
          return (
            <Fragment key={i}>
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

/**
 * A Missa numa leitura só, do começo ao fim.
 *
 * Serve à página do Ordinário e à da Missa do dia: o texto é o mesmo e o que
 * muda é o recorte (`ids`) e se o próprio do dia entra nos dez lugares que o
 * impresso deixa em branco. As orações em silêncio e as rubricas aparecem
 * sempre, a pedido do Perez.
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
  const ordo = usarOrdo(
    ano,
    dia.getUTCMonth() + 1,
    temOrdo(ano, dia.getUTCMonth() + 1, dia.getUTCDate()),
  );
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

  // O Evangelho do dia entra na linha "Sequéntia (Inítium) … N." do Ordinário
  const comEvangelho = useMemo(() => {
    const abertura = folheto ? aberturaDoEvangelho(folheto) : undefined;
    if (!carregadas || !abertura) return { secoes: carregadas, mesclado: false };
    let mesclado = false;
    const secoes = carregadas.map((s) => {
      if (s.id !== "catecumenos") return s;
      const r = comEvangelhoDoDia(s.blocos, abertura);
      mesclado = r.substituiu;
      return { ...s, blocos: folheto ? semLausDoOrdinario(r.blocos, folheto) : r.blocos };
    });
    return { secoes, mesclado };
  }, [carregadas, folheto]);

  const secoes = useMemo(
    () => (comEvangelho.secoes ? montarSecoes(comEvangelho.secoes, naDoDia) : []),
    [comEvangelho, naDoDia],
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
      {/*
        O Ordo é o anterior a 1955 e só existe para os anos publicados. Fora
        deles, Glória e Credo vêm de outras rubricas: melhor dizer do que
        deixar parecer a mesma coisa.
      */}
      {naDoDia.fonte === "rubricas" && !rito && !esperandoOrdo && (
        <p className="modo-missa__aviso">
          Este dia está fora do Ordo publicado pelo Apostolado. O Glória e o Credo
          são calculados pelas rubricas gerais e podem diferir do Ordo.
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

          <article className="folheto folheto--proprio">
            <ComOProprioDoDia folheto={folheto} dia={iso} evangelhoNoOrdinario={comEvangelho.mesclado}>
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
