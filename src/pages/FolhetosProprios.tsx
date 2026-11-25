import { Cabecalho } from "../components/Cabecalho";
import { ListaDeFolhetos } from "../components/ListaDeFolhetos";
import { Moldura } from "../components/Moldura";
import { rotaPorPadrao } from "../routes/rotas";

export default function FolhetosProprios() {
  const rota = rotaPorPadrao("/folhetos/proprios");
  return (
    <Moldura titulo={rota?.titulo ?? "Folhetos"}>
      <Cabecalho titulo={rota?.titulo ?? "Folhetos"} descricao={rota?.descricao} />
      <ListaDeFolhetos categoria="proprio" />
    </Moldura>
  );
}
