import bruto from "../data/missa-canonica.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function MissaSituacaoCanonica() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
