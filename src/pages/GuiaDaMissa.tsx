import bruto from "../data/guia.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function GuiaDaMissa() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
