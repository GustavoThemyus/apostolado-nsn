import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";
import { usarParametros } from "../rotas/usarRota";

export default function Postagem() {
  const { id } = usarParametros();
  return (
    <Moldura titulo="Postagem">
      <header className="pagina__topo">
        <h1 className="pagina__titulo">Postagem</h1>
      </header>
      <Vazia o_que={`A postagem "${id}" ainda não foi publicada.`} />
    </Moldura>
  );
}
