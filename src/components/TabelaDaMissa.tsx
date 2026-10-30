import type { NaMissa } from "../calendario/ordo";

/** "sim" ou "não", com o motivo quando o Ordo o dá. */
function Sim({ v, porque }: { v: boolean; porque?: string }) {
  return (
    <>
      <span className={v ? "sinal sinal--sim" : "sinal sinal--nao"}>{v ? "sim" : "não"}</span>
      {porque && <span className="desenv__porque"> {porque}</span>}
    </>
  );
}

/**
 * Tira o chapéu que repete o nome da casa.
 *
 * O Ordo escreve "comemoração de São Telésforo Papa e Mártir" e "oração
 * A cunctis e ad libitum"; numa casa chamada Comemoração, ou Orações do
 * tempo, a primeira palavra é a etiqueta de novo. Foi o que o Perez pediu —
 * "retirar a forma 'comemoração de'… antes do nome do primeiro santo".
 *
 * Só o chapéu do começo: "comemoração da Oitava da Epifania e de Santo
 * Higino" continua dizendo "e de Santo Higino", que é o segundo comemorado e
 * não repetição de nada. E o que sobra sobe de maiúscula, porque passa a
 * abrir a frase.
 */
const CHAPEU = /^(comemoraç(ão|ões)|oraç(ão|ões))\s+(d[aeos]s?\s+)?/i;

/*
 * A palavra repetida no meio da enumeração.
 *
 * Em três dias o Ordo a escreve de novo antes de cada nome: "oração Deus, qui
 * salutis e oração Ecclesiæ", "oração A cunctis, oração Fidelium e oração ad
 * libitum". Na casa chamada Orações do tempo, as duas ou três são a etiqueta
 * repetida; os nomes, que é o que o Perez quer ver, ficam todos.
 */
const INTERNO = /(\s+e\s+|,\s*)oraç(ão|ões)\s+/gi;

export function semOChapeu(texto: string): string {
  const limpo = texto.replace(CHAPEU, "").replace(INTERNO, "$1");
  return limpo ? limpo[0].toUpperCase() + limpo.slice(1) : texto;
}

/**
 * O que acontece na Missa, segundo o Ordo, em quadro.
 *
 * **As casas seguem a ordem da Missa.** Foi o que o Perez pediu, e é o que
 * torna o quadro legível como itinerário e não como ficha: as comemorações
 * são coletas, e coleta vem antes da Epístola, logo antes do Credo; as
 * orações do tempo se acrescentam às coletas, e por isso vêm atrás delas; o
 * Trato e a Sequência ficam entre as leituras, e o Credo vem depois do
 * Evangelho.
 *
 * A Despedida antes do Último Evangelho pela mesma razão, e esta estava
 * errada em todo dia: o *Ite, Missa est* se canta antes do prólogo de São
 * João, e o quadro trazia os dois na ordem contrária.
 *
 * Fica em arquivo próprio porque serve duas telas: o detalhe do dia no
 * calendário e a faixa de hoje na página inicial.
 */
export function TabelaDaMissa({ naMissa, titulo }: { naMissa: NaMissa; titulo: string }) {
  return (
    <div className="desenv">
      <p className="desenv__titulo">{titulo}</p>
      <dl className="desenv__lista">
        {/*
          A Missa abre o quadro. Antes vinha depois dele, como parágrafo
          solto, e era a primeira coisa que se procura: é ela que muda de um
          dia para o outro, enquanto Glória e Credo se repetem.
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
        {naMissa.comemoracoes.length > 0 && (
          <div>
            <dt>Comemoração</dt>
            <dd>{naMissa.comemoracoes.map(semOChapeu).join("; ")}</dd>
          </div>
        )}
        {/*
          As orações que se acrescentam à do dia, e só as que o Ordo chama
          pelo nome — "A cunctis", "Concede e Ecclesiæ", "Fidelium". Pedido do
          Perez, duas vezes: primeiro para tirá-las da casa "Missa", onde se
          lia "Missa Ecce advenit da festa; oração Deus, qui salutis e
          Ecclesiæ" como se o nome da Missa fosse a frase inteira; depois para
          que a casa trouxesse só as do tempo, deixando as "Orações próprias"
          da festa de volta ao lado do nome da Missa, que é onde dizem algo.
        */}
        {naMissa.oracoes.length > 0 && (
          <div>
            <dt>Orações do tempo</dt>
            <dd>{naMissa.oracoes.map(semOChapeu).join("; ")}</dd>
          </div>
        )}
        {naMissa.entreAsLeituras.length > 0 && (
          <div>
            <dt>Entre as leituras</dt>
            <dd>{naMissa.entreAsLeituras.join("; ")}</dd>
          </div>
        )}
        <div>
          <dt>Credo</dt>
          <dd><Sim v={naMissa.credo} porque={naMissa.credoPorque} /></dd>
        </div>
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
        {naMissa.fecho && (
          <div>
            <dt>Despedida</dt>
            <dd>{naMissa.fecho}</dd>
          </div>
        )}
        {/*
          Sempre presente, porque o Perez quer o quadro igual em todo dia.
          O Ordo só o menciona quando foge do comum; calado, vale a regra
          geral — e isso fica dito, para a dedução não se passar pela palavra
          dele, que é o que esta tela evita em todo o resto.
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
      </dl>
    </div>
  );
}
