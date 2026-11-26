import bruto from "../data/indulgencias.json";
import { comoConteudo } from "../data/carregar";
import { CalendarioDasIndulgencias } from "../components/CalendarioDasIndulgencias";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function Indulgencias() {
  return (
    <PaginaDeDocumento
      conteudo={comoConteudo(bruto)}
      antes={<CalendarioDasIndulgencias caminho="/indulgencias" />}
    />
  );
}
