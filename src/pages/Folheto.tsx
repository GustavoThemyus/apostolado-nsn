import { ListaDeBlocos } from "../components/Bloco";
import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { TextoRico } from "../components/TextoRico";
import { Vazia } from "../components/Vazia";
import { condicoes, porId } from "../data/folhetos";
import { tipoDaPeca } from "../data/ordinario";
import type { Bloco } from "../data/tipos";
import { Elo } from "../routes/Elo";
import { usarParametros } from "../routes/usarRota";

/**
 * Um folheto, do jeito que ele é impresso — e corrido.
 *
 * O impresso tem duas páginas porque papel acaba. Aqui a oração que começa na
 * primeira e termina na segunda é um bloco só, que é exatamente o que o Perez
 * pediu: "sem ser duas imagens, uma coisa só corrida".
 *
 * A folha não tenta imitar o papel creme do PDF. O site é escuro por padrão
 * porque é lido no celular, muitas vezes de noite e dentro da igreja, e uma
 * folha creme acesa no meio da página escura é o oposto de discreto. O que
 * faz reconhecer a folha é a moldura, a serifa e a oração em duas colunas —
 * isso ela tem, nos dois temas.
 */
/**
 * Os blocos do próprio, agrupados por peça: do subtítulo que a abre até o
 * seguinte. É o grupo que carrega o tipo da peça, e o tipo é o que o CSS lê
 * para decidir a capitular. As comemorações ("2. Santíssima Virgem Maria")
 * abrem grupo próprio e caem em "oracao", que é a capitular de sempre.
 */
function agruparPecas(blocos: Bloco[]) {
  const pecas: { tipo: ReturnType<typeof tipoDaPeca>; blocos: Bloco[] }[] = [];
  for (const bloco of blocos) {
    if (bloco.tipo === "subtitulo" || pecas.length === 0) {
      pecas.push({
        tipo: bloco.tipo === "subtitulo" ? tipoDaPeca(bloco.texto) : "oracao",
        blocos: [],
      });
    }
    pecas[pecas.length - 1].blocos.push(bloco);
  }
  return pecas;
}

export default function Folheto() {
  const { id } = usarParametros();
  const folheto = porId(id);

  if (!folheto) {
    return (
      <Moldura titulo="Folheto">
        <Cabecalho titulo="Folheto" />
        <Vazia o_que={`O folheto "${id}" não foi encontrado.`} />
        <p>
          <Elo para="/folhetos">Ver todos os folhetos</Elo>
        </p>
      </Moldura>
    );
  }

  return (
    <Moldura titulo={folheto.titulo}>
      <Cabecalho titulo={folheto.titulo} descricao={folheto.resumo} />
      {folheto.rascunho && <Vazia variante="rascunho" />}

      {/*
        O próprio da Missa tem folha própria: capitulares no início de cada
        peça, títulos centrados e o fio do impresso. "Fazer umas letras
        capitulares na primeira letra do intróito, das orações, do evangelho,
        e colocar os v e r estilizados em vermelho", pediu o Perez.

        Modificador, e não estilo de toda folha, porque é o próprio que imita
        o missal. A folha de indulgência é outra coisa: um impresso de uma
        página, com a obra e as condições, e capitular nela seria enfeite.
      */}
      <article className={`folheto${folheto.categoria === "proprio" ? " folheto--proprio" : ""}`}>
        <div className="folheto__folha">
          {folheto.chapeu && <p className="folheto__chapeu">{folheto.chapeu}</p>}

          {folheto.imagem && (
            <img
              className="folheto__estampa"
              src={folheto.imagem}
              alt=""
              width={folheto.largura}
              height={folheto.altura}
            />
          )}

          {/*
            Data, nome e grau, como o impresso os põe logo abaixo da estampa.
            Repetem o cabeçalho da página de propósito: a folha é a folha, e
            quem a abre pelo modo missa ou rola até ela precisa saber de que
            dia é sem subir. O nome é h2 para o sumário do leitor de tela
            continuar com uma hierarquia só.
          */}
          {folheto.cabecalho && (
            <header className="folheto__abertura">
              {folheto.cabecalho.data && (
                <p className="folheto__data">{folheto.cabecalho.data}</p>
              )}
              <h2 className="folheto__nome">{folheto.cabecalho.nome}</h2>
              <p className="folheto__grau">{folheto.cabecalho.grau}</p>
            </header>
          )}

          {folheto.obra && (
            <p className="folheto__obra">
              <TextoRico texto={folheto.obra} />
            </p>
          )}

          {/*
            A concessão inteira é elo, e cai no ponto exato dela dentro do
            Enchiridion. "Ao invés de linkar o enquiridio nas concessões em
            cada Indulgência, tu poderia linkar toda a concessão e levar a
            pessoa pra parte exata da concessão", pediu o Perez.
          */}
          {folheto.concessao && (
            <p className="folheto__concessao">
              <TextoRico texto={folheto.concessao} />
            </p>
          )}

          {folheto.categoria === "proprio" ? (
            agruparPecas(folheto.blocos).map((peca, n) => (
              <div className={`peca peca--${peca.tipo}`} key={n}>
                <ListaDeBlocos blocos={peca.blocos} />
              </div>
            ))
          ) : (
            <ListaDeBlocos blocos={folheto.blocos} />
          )}

          {folheto.condicoes && (
            <section className="folheto__condicoes" aria-labelledby="condicoes">
              <h2 className="folheto__condicoes-titulo" id="condicoes">
                {condicoes.titulo}
              </h2>
              <ListaDeBlocos blocos={condicoes.blocos} />
            </section>
          )}
        </div>

        {/*
          O arquivo no Drive, para quem vai imprimir. "No final de cada
          Indulgência, tu linka o arquivo no Drive do apostolado pra pessoa
          poder baixar e imprimir", pediu o Perez.

          Fora da folha, e não dentro: o que está dentro é o impresso, e o
          impresso não fala de si mesmo. Aqui embaixo é o site falando com
          quem lê.
        */}
        {folheto.arquivo && (
          <p className="folheto__arquivo">
            <a
              className="elo-texto elo-texto--externo"
              href={folheto.arquivo}
              target="_blank"
              rel="noreferrer noopener external"
            >
              Baixar o folheto para imprimir
            </a>
            <span className="folheto__arquivo-onde">No Drive do Apostolado</span>
          </p>
        )}
      </article>
    </Moldura>
  );
}
