import prosa from "../data/indulgencias-calendario.json";
import { AssinarAgenda } from "../components/AssinarAgenda";
import { comoConteudo } from "../data/carregar";
import { indulgencias } from "../data/indulgenciasDias";
import { PaginaDeDocumento } from "./PaginaDeDocumento";
import type { Bloco, Conteudo } from "../data/tipos";

/**
 * O calendário das indulgências plenárias universais, em quadro.
 *
 * "O calendário corrido das Indulgências tem que ser no mesmo estilo das da
 * Arquidiocese, em formato de tabela, com introdução, conclusão, explicações,
 * porque fica melhor organizado tanto no celular como no computador", pediu o
 * Perez. É a mesma forma do [elo:/indulgencias/arquidiocese]calendário
 * arquidiocesano: página de documento, com seções numeradas e sumário, e o
 * quadro de três colunas no meio.
 *
 * A grade do mês não está aqui: ela mora na página geral das indulgências, e
 * responde "o que tem hoje". Esta página responde "quais são", que é a
 * pergunta de quem quer planejar o ano ou conferir uma data.
 */

/** O texto corrido de um bloco, para a célula do quadro. */
function comoTexto(blocos: Bloco[]): string {
  const partes: string[] = [];
  for (const b of blocos) {
    if (b.tipo === "paragrafo") partes.push(b.texto);
    else if (b.tipo === "lista") partes.push(b.itens.map((i) => `• ${i}`).join("\n"));
    /*
     * A ressalva vira título em negrito e os parágrafos embaixo dele, e não
     * caixa dentro da célula. São doze, e a da Cátedra de São Pedro tem
     * dezoito linhas: encaixotada dentro de uma coluna, ela some de vista por
     * estreiteza. É o mesmo que o impresso do Perez faz.
     */
    else if (b.tipo === "nota") partes.push(`[b]${b.titulo}[/b]\n${b.paragrafos.join("\n\n")}`);
  }
  return partes.join("\n\n");
}

/** A obra e, por último, a concessão de onde ela sai. */
const obraEFonte = (i: { obra: Bloco[]; fonte?: string }): string =>
  i.fonte ? `${comoTexto(i.obra)}\n\n[i]${i.fonte}[/i]` : comoTexto(i.obra);

const OBRA = "Obra indulgenciada prescrita";

const quadroDosDias = (): Bloco => ({
  tipo: "tabela",
  colunas: ["Data", "Festividade litúrgica", OBRA],
  linhas: indulgencias.dias.map((i) => [i.quandoPorExtenso, i.titulo, obraEFonte(i)]),
});

/* sem a coluna da data, que para estas seria a mesma frase vinte e uma vezes */
const quadroSemDiaFixo = (): Bloco => ({
  tipo: "tabela",
  colunas: ["Indulgência", OBRA],
  linhas: indulgencias.semDiaFixo.map((i) => [i.titulo, obraEFonte(i)]),
});

/**
 * O que a prosa não escreve, e por quê.
 *
 * As condições e as observações vivem em `indulgencias-dias.json`, ao lado
 * dos dias que governam, e são as mesmas que a página geral mostra. Escritas
 * de novo aqui, divergiriam na primeira correção do Perez — e é ele quem as
 * corrige, uma vírgula por vez. Os dois quadros, pela mesma razão, se derivam
 * dos dias em vez de serem digitados.
 */
const ENXERTOS: Record<string, Bloco[]> = {
  condicoes: indulgencias.condicoes.blocos,
  observacoes: indulgencias.observacoes.blocos,
  "os-dias-do-ano": [quadroDosDias()],
  "em-qualquer-dia": [quadroSemDiaFixo()],
};

const conteudo: Conteudo = {
  ...comoConteudo(prosa),
  /* as chamadas das condições e das observações apontam para estas */
  notas: indulgencias.notas,
  secoes: comoConteudo(prosa).secoes.map((s) => ({
    ...s,
    blocos: [...s.blocos, ...(ENXERTOS[s.id] ?? [])],
  })),
};

export default function IndulgenciasCalendario() {
  return (
    <PaginaDeDocumento conteudo={conteudo}>
      {/*
        Só o calendário do Apostolado. "Tira o link das Indulgências das
        confrarias e deixa só do meu calendário universal pra linkar com a
        agenda do celular", pediu o Perez — e com razão: as confrarias não são
        o assunto desta página, e o bloco delas continua em
        /indulgencias/ordens, que é a página de que são.
      */}
      <AssinarAgenda
        grupo="indulgencias-apostolado"
        titulo="Levar as indulgências no celular"
        explicacao="O calendário que o Apostolado mantém, com os dias que ele marca."
      />
    </PaginaDeDocumento>
  );
}
