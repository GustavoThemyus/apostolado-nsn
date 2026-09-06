import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";

export default function Postagens() {
  return (
    <Moldura titulo="Postagens">
      <Cabecalho titulo="Postagens" />
      <Vazia o_que="Ainda não há postagens publicadas." />
    </Moldura>
  );
}
