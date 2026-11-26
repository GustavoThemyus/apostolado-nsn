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
    <Moldura titulo={folheto.titulo} comProgresso>
      <Cabecalho titulo={folheto.titulo} descricao={folheto.resumo} />
      {folheto.rascunho && <Vazia variante="rascunho" />}

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

          {folheto.cabecalho && (
            <header className="folheto__abertura">
              {folheto.cabecalho.data && (
                <p className="folheto__data">{folheto.cabecalho.data}</p>
              )}
              <h2 className="folheto__nome">{folheto.cabecalho.nome}</h2>
              <p className="folheto__grau">{folheto.cabecalho.grau}</p>
              {folheto.cabecalho.estacao && (
                <p className="folheto__estacao">{folheto.cabecalho.estacao}</p>
              )}
            </header>
          )}

          {folheto.obra && (
            <p className="folheto__obra">
              <TextoRico texto={folheto.obra} />
            </p>
          )}

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
