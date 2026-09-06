import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";

export default function IndulgenciasCalendario() {
  return (
    <Moldura titulo="Dias de indulgência plenária">
      <Cabecalho titulo="Dias de indulgência plenária" />
      <Vazia o_que="Este calendário está sendo montado." />
    </Moldura>
  );
}
