import bruto from "../data/apostolado.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function Apostolado() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
