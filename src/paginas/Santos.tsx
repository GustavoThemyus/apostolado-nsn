import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";

export default function Santos() {
  return (
    <Moldura titulo="As festas do calendário">
      <Cabecalho titulo="As festas do calendário" />
      <Vazia o_que="Ainda não há postagens publicadas." />
    </Moldura>
  );
}
