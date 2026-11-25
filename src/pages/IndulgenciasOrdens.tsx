import bruto from "../data/indulgencias-ordens.json";
import { AssinarEsta } from "../components/AssinarAgenda";
import { comoConteudo } from "../data/carregar";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

/** A agenda de cada associação, pelo id da seção que fala dela. */
const AGENDA_DA_SECAO: Record<string, string> = {
  "apostolado-da-oracao": "apostolado-oracao",
  "confraria-do-escapulario-do-carmo": "escapulario",
  "arquiconfraria-do-cordao-de-sao-francisco": "cordao",
  "ordem-terceira-franciscana": "franciscana",
  "ordem-terceira-dominicana": "dominicana",
};

const agendaDaSecao = (id: string) =>
  AGENDA_DA_SECAO[id] ? <AssinarEsta id={AGENDA_DA_SECAO[id]} /> : null;

export default function IndulgenciasOrdens() {
  return (
    <PaginaDeDocumento conteudo={comoConteudo(bruto)} depoisDaSecao={agendaDaSecao} />
  );
}
