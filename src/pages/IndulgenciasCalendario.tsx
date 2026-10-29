import { AssinarAgenda } from "../components/AssinarAgenda";
import { ListaDeBlocos } from "../components/Bloco";
import { ProvedorDeNotas } from "../components/Notas";
import { TextoRico } from "../components/TextoRico";
import { Cabecalho } from "../components/Cabecalho";
import { Elo } from "../routes/Elo";
import { Moldura } from "../components/Moldura";
import { indulgencias } from "../data/indulgenciasDias";

/**
 * O calendário das indulgências plenárias universais, por extenso.
 *
 * Aqui estão todas elas, do primeiro dia do ano ao último, com a obra de cada
 * uma. Era a página da grade do mês, e virou esta quando o Perez pediu a
 * troca: "aí o conteúdo da página seria tudo isso aí no arquivo; aí o
 * calendário que está lá, colocava na página geral das indulgências".
 *
 * A grade responde "o que tem hoje"; esta lista responde "quais são", que é a
 * pergunta de quem quer planejar o ano ou conferir uma data. Uma de cada vez,
 * a grade escondia vinte das vinte e uma.
 */
export default function IndulgenciasCalendario() {
  return (
    <Moldura titulo={indulgencias.titulo}>
      <Cabecalho titulo={indulgencias.titulo} descricao={indulgencias.descricao} />

      {/*
        As condições e as observações vêm do JSON, e não daqui.

        São o texto que o Perez escreveu para abrir o calendário, com as
        citações canônicas de cada item, e ele continua corrigindo-o. Escrito
        na página, cada vírgula dele exigiria mexer em TSX; no JSON o painel
        de edição alcança, como alcança o resto do conteúdo do site.

        As duas caixas, e não uma: a primeira é o que se tem de fazer, e é
        curta de propósito; a segunda é o que costuma ser perguntado depois, e
        tem nove itens. Juntas, as nove linhas enterravam as quatro.
      */}
      {/* o provedor envolve só estas duas caixas, que é onde estão as
          chamadas: as citações canônicas vivem em balão, como no resto do
          site, e sem ele virariam números soltos no meio da frase */}
      <ProvedorDeNotas notas={indulgencias.notas}>
        <aside className="nota" aria-labelledby="condicoes">
          <h2 className="nota__titulo" id="condicoes">
            {indulgencias.condicoes.titulo}
          </h2>
          <ListaDeBlocos blocos={indulgencias.condicoes.blocos} />
        </aside>

        <details className="observacoes">
          <summary className="observacoes__resumo">
            {indulgencias.observacoes.titulo}
            <span className="observacoes__pista"> o que vale para todas elas</span>
          </summary>
          <ListaDeBlocos blocos={indulgencias.observacoes.blocos} />
        </details>
      </ProvedorDeNotas>

      {/*
        Na ordem do ano, que é a ordem em que estão no arquivo.

        Não se agrupa por mês: oito das vinte e uma não têm mês — acompanham a
        Páscoa, ou caem num domingo que varia —, e inventar um cabeçalho de
        mês para elas seria dizer o que o Enchiridion não diz. A data por
        extenso de cada uma faz o mesmo trabalho sem a mentira.
      */}
      <section className="ano-de-indulgencias" aria-labelledby="no-ano">
        <h2 className="ano-de-indulgencias__titulo" id="no-ano">
          Os dias do ano
        </h2>
        <p className="ano-de-indulgencias__chamada">
          Para ver um mês de cada vez, com as festas do dia e os calendários das
          associações, veja{" "}
          <Elo para="/indulgencias">o calendário na página das indulgências</Elo>.
        </p>

        <ul className="indulgencias-dia">
          {indulgencias.dias.map((i) => (
            <li key={i.id} id={i.id}>
              {/* "Variável, conforme a Páscoa / Quinta-feira Santa" vem em
                  duas linhas no arquivo, e é o TextoRico que as quebra */}
              <p className="indulgencias-dia__quando">
                <TextoRico texto={i.quandoPorExtenso} />
              </p>
              <p className="indulgencias-dia__titulo">
                {i.titulo}
                <span className={`etiqueta etiqueta--${i.especie}`}>
                  {i.especie === "plenaria" ? "Plenária" : "Parcial"}
                </span>
              </p>
              <ListaDeBlocos blocos={i.obra} />
              {i.fonte && (
                <p className="indulgencias-dia__fonte">
                  <TextoRico texto={i.fonte} />
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="nota" aria-labelledby="sem-dia">
        <h2 className="nota__titulo" id="sem-dia">
          Em qualquer dia
        </h2>
        <p>
          Nem toda indulgência está presa a uma data. Estas valem quando a obra
          for feita, e por isso ficam fora da lista acima em vez de repetidas em
          todos os dias do ano.
        </p>
        <ul className="indulgencias-dia">
          {indulgencias.semDiaFixo.map((i) => (
            <li key={i.id} id={i.id}>
              <p className="indulgencias-dia__titulo">
                {i.titulo}
                <span className={`etiqueta etiqueta--${i.especie}`}>
                  {i.especie === "plenaria" ? "Plenária" : "Parcial"}
                </span>
              </p>
              <ListaDeBlocos blocos={i.obra} />
              {i.fonte && (
                <p className="indulgencias-dia__fonte">
                  <TextoRico texto={i.fonte} />
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/*
        Dois blocos, e não um: o calendário do Apostolado vale para qualquer
        fiel, e os das confrarias só para quem é de uma delas. Junto, o de cima
        parecia mais uma associação na lista.
      */}
      <AssinarAgenda
        grupo="indulgencias-apostolado"
        titulo="Levar as indulgências no celular"
        explicacao="O calendário que o Apostolado mantém, com os dias que ele marca."
      />

      <AssinarAgenda
        grupo="indulgencias"
        titulo="Calendários das confrarias e ordens terceiras"
        explicacao="Cada um traz os dias próprios de uma associação. Vincule o da que você pertence, para não perder as datas."
      />
    </Moldura>
  );
}
