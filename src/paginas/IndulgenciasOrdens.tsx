import bruto from "../data/indulgencias-ordens.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function IndulgenciasOrdens() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
