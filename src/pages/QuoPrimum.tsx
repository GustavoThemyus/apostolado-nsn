import bruto from "../data/quo-primum.json";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function QuoPrimum() {
  return <PaginaDeDocumento conteudo={comoConteudo(bruto)} />;
}
