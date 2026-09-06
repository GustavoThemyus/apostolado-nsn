import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";

export default function Santos() {
  return (
    <Moldura titulo="As festas do calendário">
      <header className="pagina__topo">
        <h1 className="pagina__titulo">As festas do calendário</h1>
      </header>
      <Vazia o_que="Ainda não há postagens publicadas." />
    </Moldura>
  );
}
