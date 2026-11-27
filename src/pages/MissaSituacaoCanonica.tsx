import bruto from "../data/missa-canonica.json";
import { comoConteudo } from "../data/carregar";
import { NOME_DO_ESTADO } from "../routes/rotas";
import { PaginaDeDocumento } from "./PaginaDeDocumento";

const A_PUBLICAR = [
  { nome: "Divino afflatu", data: "1º de novembro de 1911" },
  { nome: "Ecclesia Dei", data: "2 de julho de 1988" },
  { nome: "Summorum Pontificum", data: "7 de julho de 2007" },
  { nome: "Traditionis custodes", data: "16 de julho de 2021" },
];

export default function MissaSituacaoCanonica() {
  return (
    <PaginaDeDocumento conteudo={comoConteudo(bruto)}>
      <ul className="cartoes cartoes--secao cartoes--inertes" aria-label="Documentos em preparação">
        {A_PUBLICAR.map((d) => (
          <li className="cartao cartao--inerte" key={d.nome}>
            <span className="cartao__titulo" lang="la">{d.nome}</span>
            <span className="cartao__texto">{d.data}</span>
            <span className="cartao__preparo">{NOME_DO_ESTADO.preparacao}</span>
          </li>
        ))}
      </ul>
    </PaginaDeDocumento>
  );
}
