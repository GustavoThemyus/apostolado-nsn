import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";

export default function IndulgenciasCalendario() {
  return (
    <Moldura titulo="Dias de indulgência plenária">
      <header className="pagina__topo">
        <h1 className="pagina__titulo">Dias de indulgência plenária</h1>
      </header>
      <Vazia o_que="Este calendário está sendo montado." />
    </Moldura>
  );
}
