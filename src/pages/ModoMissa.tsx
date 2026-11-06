import { useEffect, useMemo, useState } from "react";
import { comoIso, diaDaBusca, hojeUTC } from "../calendario/dias";
import { folhetoDoDia } from "../calendario/proprioDoDia";
import { temOrdo } from "../calendario/ordo";
import { mesmoDia } from "../components/GradeDoMes";
import { ListaDeBlocos } from "../components/Bloco";
import { ComOProprioDoDia } from "../components/ProprioDoDia";
import { Moldura } from "../components/Moldura";
import { Seta } from "../components/Seta";
import {
  SECOES,
  carregarSecao,
  secaoJaBaixada,
  type TextoDaSecao,
} from "../data/ordinario";
import { porId } from "../data/folhetos";
import { usarOrdo } from "../hooks/usarOrdo";
import { Elo } from "../routes/Elo";
import { usarRota } from "../routes/usarRota";

/*
 * A seção com que a página abre.
 *
 * As orações ao pé do altar, e não a capa: quem abre o modo missa está de pé
 * no banco, o celebrante começou, e o que ele precisa é da primeira coisa
 * que se reza junto. O resto está a um toque, na lista de seções.
 */
const PRIMEIRA = "pe-altar";

function secaoDaBusca(busca: URLSearchParams): string {
  const pedida = busca.get("secao");
  return SECOES.some((s) => s.id === pedida) ? (pedida as string) : PRIMEIRA;
}

/**
 * O Ordinário da Missa inteiro, com o próprio do dia encaixado nele.
 *
 * O impresso deixa dez lugares em branco e escreve "Ver a Missa do dia":
 * aqui esses dez lugares se enchem sozinhos com o folheto de próprio do dia,
 * quando ele já está transcrito. Esse é o ponto da página — não ter de
 * virar de um papel para outro no meio da Missa.
 *
 * Uma seção de cada vez, e não a Missa inteira numa rolagem só: são 12 871
 * palavras, e quem está na capela está num celular, muitas vezes sem Wi-Fi.
 * O índice carrega cada seção quando o leitor chega nela, e o que já veio
 * fica guardado — voltar ao Confiteor depois do Canon não baixa nada.
 *
 * O dia e a seção vão os dois na URL, para o elo poder ser mandado a alguém
 * e para o voltar do navegador fazer o que se espera dele.
 */
export default function ModoMissa() {
  const { busca, navegar } = usarRota();
  const hoje = useMemo(hojeUTC, []);
  const dia = useMemo(() => diaDaBusca(busca, hoje), [busca, hoje]);
  const idDaSecao = secaoDaBusca(busca);

  const ano = dia.getUTCFullYear();
  const ordo = usarOrdo(ano, dia.getUTCMonth() + 1, temOrdo(ano));
  const doOrdo = ordo.dias.find((d) => mesmoDia(d.data, dia));
  const folheto = porId(folhetoDoDia(doOrdo?.anexos));

  const [secao, definirSecao] = useState<TextoDaSecao | null>(
    () => secaoJaBaixada(idDaSecao) ?? null,
  );

  /*
   * Baixar a seção pedida, e descartar a resposta se o leitor já mudou de
   * seção enquanto ela vinha: numa rede de capela, duas trocas seguidas
   * chegariam fora de ordem e a tela ficaria na primeira.
   */
  useEffect(() => {
    const jaTem = secaoJaBaixada(idDaSecao);
    if (jaTem) {
      definirSecao(jaTem);
      return;
    }
    let valendo = true;
    definirSecao(null);
    void carregarSecao(idDaSecao).then((texto) => {
      if (valendo) definirSecao(texto);
    });
    return () => {
      valendo = false;
    };
  }, [idDaSecao]);

  const irPara = (id: string) =>
    navegar(`/missa/ordinario?dia=${comoIso(dia)}&secao=${id}`);

  const indice = SECOES.findIndex((s) => s.id === idDaSecao);
  const anterior = SECOES[indice - 1];
  const proxima = SECOES[indice + 1];

  /*
   * O primeiro bloco da seção é o título dela, que o corte do gerador leva
   * junto; aqui ele já é o cabeçalho da seção, e repeti-lo seria dizer
   * "Canon da Missa" duas vezes seguidas.
   */
  const blocos = secao
    ? secao.blocos[0]?.tipo === "subtitulo"
      ? secao.blocos.slice(1)
      : secao.blocos
    : [];

  return (
    <Moldura titulo="Modo missa" local={secao?.titulo} comProgresso>
      {/*
       * Sem o cabeçalho estampado das outras páginas: ele ocupa a primeira
       * tela inteira com a imagem e o lema, e aqui a primeira tela tem de
       * ser texto da Missa. Quem abriu isto está de pé, e o celebrante já
       * começou.
       */}
      <h1 className="modo-missa__nome">Ordinário da Missa</h1>

      <p className="modo-missa__dia">
        {doOrdo ? doOrdo.nome : "Dia fora do Ordo publicado"}
        {" · "}
        <Elo para={`/calendario?dia=${comoIso(dia)}&uso=pre55`} className="elo-texto">
          ver o dia no calendário
        </Elo>
      </p>

      {!folheto && (
        <p className="modo-missa__aviso">
          O próprio deste dia ainda não está transcrito aqui. Os lugares da
          Missa do dia ficam como no impresso, remetendo ao próprio.
        </p>
      )}

      <nav className="modo-missa__secoes" aria-label="Seções do Ordinário">
        {SECOES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={
              "modo-missa__secao" +
              (s.id === idDaSecao ? " modo-missa__secao--atual" : "") +
              (s.naMissa ? "" : " modo-missa__secao--fora")
            }
            aria-current={s.id === idDaSecao ? "true" : undefined}
            onClick={() => irPara(s.id)}
          >
            {s.titulo}
          </button>
        ))}
      </nav>

      <article className="folheto folheto--proprio">
        <h2 className="modo-missa__titulo">{secao?.titulo ?? "Carregando…"}</h2>
        <ComOProprioDoDia folheto={folheto}>
          <ListaDeBlocos blocos={blocos} />
        </ComOProprioDoDia>
      </article>

      <nav className="modo-missa__passos" aria-label="Seção anterior e próxima">
        {anterior ? (
          <button type="button" className="modo-missa__passo" onClick={() => irPara(anterior.id)}>
            <Seta className="modo-missa__seta modo-missa__seta--atras" />
            {anterior.titulo}
          </button>
        ) : (
          <span />
        )}
        {proxima && (
          <button
            type="button"
            className="modo-missa__passo modo-missa__passo--proxima"
            onClick={() => irPara(proxima.id)}
          >
            {proxima.titulo}
            <Seta className="modo-missa__seta" />
          </button>
        )}
      </nav>
    </Moldura>
  );
}
