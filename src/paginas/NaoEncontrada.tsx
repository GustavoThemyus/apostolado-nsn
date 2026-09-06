import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Elo } from "../rotas/Elo";

export default function NaoEncontrada() {
  return (
    <Moldura titulo="Página não encontrada">
      <Cabecalho titulo="Página não encontrada" descricao="Este endereço não existe, ou deixou de existir." />
      <p className="paragrafo">
        Volte ao <Elo para="/">início</Elo>, ou vá direto ao{" "}
        <Elo para="/missa/guia">guia da Missa</Elo>.
      </p>
    </Moldura>
  );
}
