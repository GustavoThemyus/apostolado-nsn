import bruto from "../data/inicio.json";
import { ListaDeBlocos } from "../components/Bloco";
import { Cabecalho } from "../components/Cabecalho";
import { Contribuir, type Contribuicao } from "../components/Contribuir";
import { DiaDeHoje } from "../components/DiaDeHoje";
import { Moldura } from "../components/Moldura";
import { Mural, type Aviso } from "../components/Mural";
import { Padroeiros, type Padroeiro } from "../components/Padroeiros";
import { UltimasPostagens } from "../components/UltimasPostagens";
import { Vazia } from "../components/Vazia";
import type { Bloco } from "../data/tipos";
import { Elo } from "../routes/Elo";
import { Seta } from "../components/Seta";

interface PaginaInicial {
  titulo: string;
  descricao: string;
  avisos: Aviso[];
  sobre: { titulo: string; emPreparacao?: boolean; blocos: Bloco[] };
  contribuicao: Contribuicao;
  padroeiros: Padroeiro[];
}

const inicio = bruto as unknown as PaginaInicial;

export default function Inicio() {
  return (
    <Moldura titulo="Início">
      <Cabecalho titulo={inicio.titulo} descricao={inicio.descricao} />

      <Mural avisos={inicio.avisos} />

      <DiaDeHoje />

      <UltimasPostagens />

      <nav
        className="cartoes cartoes--ilustrados"
        aria-label="Seções principais"
      >
        <Cartao
          para="/missa/guia"
          imagem="/cartoes/missa-4c2b9f3f.webp"
          titulo="Guia prático da Missa"
          texto="Cada peça da Missa em ordem: o que é dito, quem diz e o que muda conforme o dia."
        />
        <Cartao
          para="/calendario"
          imagem="/cartoes/calendario-8b43148b.webp"
          titulo="Calendário litúrgico"
          texto="O calendário tradicional, dia a dia."
        />
        <Cartao
          para="/indulgencias"
          imagem="/cartoes/indulgencias-931d7d10.webp"
          titulo="Indulgências"
          texto="O que são, como se obtêm e em que dias."
        />
      </nav>

      <section className="sobre" aria-labelledby="sobre-titulo">
        <h2 className="sobre__titulo" id="sobre-titulo">
          {inicio.sobre.titulo}
        </h2>
        {inicio.sobre.emPreparacao ? (
          <Vazia o_que="A apresentação do apostolado ainda será escrita." />
        ) : (
          <ListaDeBlocos blocos={inicio.sobre.blocos} />
        )}
        <Elo para="/apostolado" className="sobre__mais">
          Saber mais sobre o Apostolado
        </Elo>
      </section>

      <Contribuir dados={inicio.contribuicao} />
      <Padroeiros padroeiros={inicio.padroeiros} />
    </Moldura>
  );
}

/**
 * Cartão ilustrado: a estampa ocupa o cartão inteiro e o texto fica por cima,
 * sobre um véu que escurece só a parte de baixo. Sem o véu o título some em
 * qualquer pintura clara, e escurecer a imagem toda apagaria a pintura.
 */
function Cartao({
  para,
  imagem,
  titulo,
  texto,
}: {
  para: string;
  imagem: string;
  titulo: string;
  texto: string;
}) {
  return (
    <Elo para={para} className="cartao cartao--ilustrado">
      <img
        className="cartao__estampa"
        src={imagem}
        alt=""
        width={1100}
        height={619}
        loading="lazy"
      />
      <span className="cartao__veu">
        <span className="cartao__titulo">{titulo}</span>
        <span className="cartao__texto">{texto}</span>
        <span className="cartao__ir">
          Ver
          <Seta className="cartao__seta" />
        </span>
      </span>
    </Elo>
  );
}
