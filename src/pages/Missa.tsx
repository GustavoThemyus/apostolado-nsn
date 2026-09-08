import bruto from "../data/missa.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function Missa() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
