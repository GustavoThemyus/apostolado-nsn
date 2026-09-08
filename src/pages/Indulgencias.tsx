import bruto from "../data/indulgencias.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function Indulgencias() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
