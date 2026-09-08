import bruto from "../data/indulgencias-raccolta.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function IndulgenciasRaccolta() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
