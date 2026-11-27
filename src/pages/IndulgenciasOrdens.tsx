import bruto from "../data/indulgencias-ordens.json";
import { AssinarEsta } from "../components/AssinarAgenda";
import { comoConteudo } from "../data/carregar";
import { FOLHETO_DA_AGENDA } from "../data/folhetosDasIndulgencias";
import { Elo } from "../routes/Elo";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

const AGENDA_DA_SECAO: Record<string, string> = {
  "apostolado-da-oracao": "apostolado-oracao",
  "confraria-do-escapulario-do-carmo": "escapulario",
  "arquiconfraria-do-cordao-de-sao-francisco": "cordao",
  "ordem-terceira-franciscana": "franciscana",
  "ordem-terceira-dominicana": "dominicana",
};

function fechoDaSecao(id: string) {
  const agenda = AGENDA_DA_SECAO[id];
  if (!agenda) return null;
  const folheto = FOLHETO_DA_AGENDA[agenda];
  return (
    <>
      {folheto && (
        <p className="paragrafo">
          <Elo para={folheto} className="elo-texto">
            Folheto com a oração da renovação
          </Elo>
        </p>
      )}
      <AssinarEsta id={agenda} />
    </>
  );
}

export default function IndulgenciasOrdens() {
  return (
    <PaginaDeDocumento conteudo={comoConteudo(bruto)} depoisDaSecao={fechoDaSecao} />
  );
}
