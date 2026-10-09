import type { Bloco, Secao } from "../data/tipos";
import { Bloco as Renderizar } from "../components/Bloco";
import { ProvedorDeSecoes } from "../components/IndiceDoDocumento";
import { ProvedorDeNotas } from "../components/Notas";
import { ProvedorDeNumeracao } from "../components/NumeracaoDePassos";
import { TIPOS, blocoVazio, type NomeDeTipo } from "./tiposDeBloco";

/**
 * A paleta de tipos de bloco, cada um mostrando como fica.
 *
 * A amostra não é desenho nem descrição: é o bloco de verdade, passado pelo
 * mesmo `<Bloco>` que monta o site, debaixo do mesmo `base.css`. Então a
 * rubrica aparece vermelha porque a rubrica é vermelha, e o dia em que
 * alguém mudar essa cor a paleta muda junto. Uma amostra pintada à mão
 * começaria certa e terminaria mentindo.
 *
 * O preço é o contexto: alguns blocos leem coisas de cima — a nota precisa do
 * mapa de notas, o passo da numeração, o índice das seções. Aqui eles recebem
 * um exemplo mínimo, só para a amostra ter o que mostrar.
 */

/** O que cada tipo mostra na paleta. Texto curto, que caiba no cartão. */
const AMOSTRAS: Record<NomeDeTipo, Bloco> = {
  paragrafo: { tipo: "paragrafo", texto: "O texto corrido do documento, com [b]destaque[/b], [i]itálico[/i] e [lat]latim[/lat]." },
  rubrica: { tipo: "rubrica", texto: "O sacerdote beija o altar." },
  assembleia: { tipo: "assembleia", texto: "Todos se ajoelham." },
  subtitulo: { tipo: "subtitulo", texto: "Um tópico dentro da seção" },
  lista: { tipo: "lista", ordenada: true, itens: ["Primeiro item", "Segundo item"] },
  oracao: {
    tipo: "oracao",
    versos: [{ latim: "Dóminus vobíscum.", portugues: "O Senhor esteja convosco." }],
  },
  nota: {
    tipo: "nota",
    titulo: "Nota",
    paragrafos: ["Uma caixa destacada, para o que sai do texto corrido."],
  },
  tabela: {
    tipo: "tabela",
    colunas: ["Data", "Festa"],
    linhas: [["5 de agosto", "Nossa Senhora das Neves"]],
  },
  legenda: {
    tipo: "legenda",
    itens: [
      { chave: "Próprio", etiqueta: "proprio", texto: "Muda conforme o dia." },
      { chave: "Ordinário", etiqueta: "ordinario", texto: "É igual em toda Missa." },
    ],
  },
  separador: { tipo: "separador" },
  bilingue: {
    tipo: "bilingue",
    latim: [{ tipo: "paragrafo", texto: "Ite, missa est." }],
    portugues: [{ tipo: "paragrafo", texto: "Ide, a Missa está terminada." }],
  },
  indice: { tipo: "indice" },
  passo: {
    tipo: "passo",
    etiqueta: "ordinario",
    titulo: "Nome da peça",
    tituloLatim: "Nomen",
    corpo: [{ tipo: "paragrafo", texto: "O que se diz e o que se faz." }],
  },
};

/** Seções de mentira, só para o índice e a numeração terem o que mostrar. */
const SECOES_DE_AMOSTRA: Secao[] = [
  { id: "amostra-1", titulo: "Primeira seção", blocos: [] },
  { id: "amostra-2", titulo: "Segunda seção", blocos: [] },
];

export function Amostra({ bloco }: { bloco: Bloco }) {
  return (
    <ProvedorDeNotas notas={{ "1": "O texto da nota aparece aqui." }}>
      <ProvedorDeSecoes secoes={SECOES_DE_AMOSTRA}>
        <ProvedorDeNumeracao secoes={SECOES_DE_AMOSTRA}>
          <div className="amostra" aria-hidden="true">
            <Renderizar bloco={bloco} />
          </div>
        </ProvedorDeNumeracao>
      </ProvedorDeSecoes>
    </ProvedorDeNotas>
  );
}

export function Paleta({
  aoEscolher,
  aoCancelar,
  excluir = [],
}: {
  aoEscolher: (bloco: Bloco) => void;
  aoCancelar: () => void;
  /** Tipos que não cabem aqui. Dentro de um passo, outro passo não cabe. */
  excluir?: NomeDeTipo[];
}) {
  const oferecidos = TIPOS.filter((t) => !excluir.includes(t.tipo));

  return (
    <div className="paleta">
      <p className="paleta__guia">
        Escolha o tipo do bloco. A amostra de cada um é o bloco de verdade, com
        a formatação que ele terá na página.
      </p>
      <ul className="paleta__grade">
        {oferecidos.map((t) => (
          <li key={t.tipo}>
            <button
              type="button"
              className="paleta__tipo"
              onClick={() => aoEscolher(blocoVazio(t.tipo))}
            >
              <span className="paleta__nome">{t.rotulo}</span>
              <span className="paleta__descricao">{t.descricao}</span>
              <Amostra bloco={AMOSTRAS[t.tipo]} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="botao botao--normal" onClick={aoCancelar}>
        cancelar
      </button>
    </div>
  );
}
