import bruto from "../data/calendario-brasil.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function CalendarioBrasil() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
