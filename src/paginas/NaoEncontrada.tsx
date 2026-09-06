import { Moldura } from "../components/Moldura";
import { Elo } from "../rotas/Elo";

export default function NaoEncontrada() {
  return (
    <Moldura titulo="Página não encontrada">
      <header className="pagina__topo">
        <h1 className="pagina__titulo">Página não encontrada</h1>
        <p className="pagina__resumo">
          Este endereço não existe, ou deixou de existir.
        </p>
      </header>
      <p className="paragrafo">
        Volte ao <Elo para="/">início</Elo>, ou vá direto ao{" "}
        <Elo para="/missa/guia">guia da Missa</Elo>.
      </p>
    </Moldura>
  );
}
