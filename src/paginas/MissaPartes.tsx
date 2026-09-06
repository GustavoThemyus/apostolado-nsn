import bruto from "../data/missa-partes.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function MissaPartes() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
