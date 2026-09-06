import { DiaDeHoje } from "../components/DiaDeHoje";
import { Moldura } from "../components/Moldura";
import { Elo } from "../rotas/Elo";
import bruto from "../data/inicio.json";

const inicio = bruto as { titulo: string; descricao: string };

export default function Inicio() {
  return (
    <Moldura titulo="Início">
      <header className="pagina__topo pagina__topo--capa">
        <h1 className="pagina__titulo">{inicio.titulo}</h1>
        <p className="pagina__resumo">{inicio.descricao}</p>
      </header>

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
          <span className="cartao__texto">O calendário de 1962, dia a dia.</span>
        </Elo>
        <Elo para="/indulgencias" className="cartao">
          <span className="cartao__titulo">Indulgências</span>
          <span className="cartao__texto">O que são, como se obtêm e em que dias.</span>
        </Elo>
      </nav>
    </Moldura>
  );
}
