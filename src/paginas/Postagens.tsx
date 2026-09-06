import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";

export default function Postagens() {
  return (
    <Moldura titulo="Postagens">
      <header className="pagina__topo">
        <h1 className="pagina__titulo">Postagens</h1>
      </header>
      <Vazia o_que="Ainda não há postagens publicadas." />
    </Moldura>
  );
}
