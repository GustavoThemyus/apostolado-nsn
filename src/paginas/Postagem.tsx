import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";
import { usarParametros } from "../rotas/usarRota";

export default function Postagem() {
  const { id } = usarParametros();
  return (
    <Moldura titulo="Postagem">
      <Cabecalho titulo="Postagem" />
      <Vazia o_que={`A postagem "${id}" ainda não foi publicada.`} />
    </Moldura>
  );
}
