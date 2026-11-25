import { Cabecalho } from "../components/Cabecalho";
import { ListaDeFolhetos } from "../components/ListaDeFolhetos";
import { Moldura } from "../components/Moldura";
import { rotaPorPadrao } from "../routes/rotas";

export default function FolhetosIndulgencias() {
  const rota = rotaPorPadrao("/folhetos/indulgencias");
  return (
    <Moldura titulo={rota?.titulo ?? "Folhetos"}>
      <Cabecalho titulo={rota?.titulo ?? "Folhetos"} descricao={rota?.descricao} />
      <ListaDeFolhetos categoria="indulgencia" />
    </Moldura>
  );
}
