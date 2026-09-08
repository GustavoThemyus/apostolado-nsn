import bruto from "../data/indulgencias-enchiridion.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function IndulgenciasEnchiridion() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
