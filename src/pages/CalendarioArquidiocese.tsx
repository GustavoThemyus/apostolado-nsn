import bruto from "../data/calendario-arquidiocese.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function CalendarioArquidiocese() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
