import bruto from "../data/indulgencias-arquidiocese.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function IndulgenciasArquidiocese() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
