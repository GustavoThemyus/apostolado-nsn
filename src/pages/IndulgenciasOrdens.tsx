import bruto from "../data/indulgencias-ordens.json";
import { AssinarAgenda } from "../components/AssinarAgenda";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

export default function IndulgenciasOrdens() {
  return (
    <PaginaDeDocumento conteudo={comoConteudo(bruto)}>
      <AssinarAgenda
        grupo="indulgencias"
        titulo="Calendários das ordens e confrarias"
        explicacao="Cada um destes calendários traz os dias de indulgência próprios de uma associação. Vincule ao seu celular o da que você pertence, para não perder as datas."
      />
    </PaginaDeDocumento>
  );
}
