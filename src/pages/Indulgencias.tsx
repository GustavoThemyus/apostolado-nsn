import bruto from "../data/indulgencias.json";
import { comoConteudo } from "../data/carregar";
import { CalendarioDasIndulgencias } from "../components/CalendarioDasIndulgencias";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

/**
 * A página geral das indulgências: o texto, com a grade do mês em cima.
 *
 * A grade estava na página filha, e a filha trazia só o dia escolhido. O
 * Perez pediu a troca: "o calendário que está lá, colocava na página geral
 * das indulgências; seria invertido". Faz sentido — quem chega em
 * "Indulgências" quer saber se hoje tem uma, e tinha de abrir outra página
 * para descobrir.
 *
 * Antes do texto, e não depois: o texto responde o que é e como se obtém, e
 * isso se lê uma vez; a grade se consulta toda semana.
 */
export default function Indulgencias() {
  return (
    <PaginaDeDocumento
      conteudo={comoConteudo(bruto)}
      antes={<CalendarioDasIndulgencias caminho="/indulgencias" />}
    />
  );
}
