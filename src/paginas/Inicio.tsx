import bruto from "../data/inicio.json";
import { ListaDeBlocos } from "../components/Bloco";
import { Cabecalho } from "../components/Cabecalho";
import { Contribuir, type Contribuicao } from "../components/Contribuir";
import { DiaDeHoje } from "../components/DiaDeHoje";
import { Moldura } from "../components/Moldura";
import { Mural, type Aviso } from "../components/Mural";
import { Padroeiros, type Padroeiro } from "../components/Padroeiros";
import { Vazia } from "../components/Vazia";
import type { Bloco } from "../data/tipos";
import { Elo } from "../rotas/Elo";

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
      <Cabecalho
        variante="capa"
        titulo={inicio.titulo}
        descricao={inicio.descricao}
        chamada="Rito Romano na forma do Missal de São Pio V"
        epigrafe="Iter para tutum"
      />

      <Mural avisos={inicio.avisos} />

      <DiaDeHoje />

      <nav className="cartoes" aria-label="Seções principais">
        <Elo para="/missa/guia" className="cartao cartao--destaque">
          <span className="cartao__titulo">Guia prático da Missa</span>
          <span className="cartao__texto">
            Cada peça da Missa em ordem: o que é dito, quem diz e o que muda conforme o dia.
          </span>
        </Elo>
        <Elo para="/calendario" className="cartao">
          <span className="cartao__titulo">Calendário litúrgico</span>
          <span className="cartao__texto">O calendário tradicional, dia a dia.</span>
        </Elo>
        <Elo para="/indulgencias" className="cartao">
          <span className="cartao__titulo">Indulgências</span>
          <span className="cartao__texto">O que são, como se obtêm e em que dias.</span>
        </Elo>
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
