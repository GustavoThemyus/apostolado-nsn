import bruto from "./folhetos.json";
import type { ColecaoDeFolhetos, Folheto } from "./tipos";

/**
 * A coleção de folhetos, já filtrada.
 *
 * Mesmo critério das postagens: tudo num arquivo enquanto couber, e, passando
 * de ~120 KB crus, quebrar em src/data/folhetos/<id>.json. Aqui o limite chega
 * mais cedo que lá — um próprio de Missa inteiro é muito texto, e o Perez
 * falou em próprios, cantos de procissão, vésperas e ofícios de Semana Santa.
 *
 * Com os sete próprios do Advento o arquivo passou de 41 KB para 163 KB, e
 * portanto do limite. Medido o que isso custa: o Vite já separa estes dados
 * num pedaço só deles, de 138 KB — 36 KB comprimidos —, baixado apenas nas
 * duas páginas de folheto, e o Enchiridion, que está no ar, pesa o dobro.
 * Então não é agora que se quebra.
 *
 * É na próxima remessa. O desperdício que a quebra conserta não é o da folha,
 * é o da lista: `/folhetos` baixa a coleção inteira para mostrar catorze
 * cartões, e um ano de próprios — sessenta e tantos — faria disso meio mega.
 * Quando vier o Natal, o molde é `src/data/ordo/indice.ts`, que já carrega o
 * ano do Ordo sob demanda.
 */
export const colecao = bruto as unknown as ColecaoDeFolhetos;

/*
 * Na ordem em que estão no arquivo: folha não tem data, tem assunto.
 *
 * Dentro das obras indulgenciadas essa ordem é a do calendário — 1.º de
 * janeiro, Quaresma, Semana Santa, até 31 de dezembro —, porque é a ordem em
 * que o fiel vai precisar delas, e a mesma do quadro das indulgências. Nos
 * outros gêneros ela será outra: um ofício de Semana Santa não tem data
 * única, e um canto de procissão não tem nenhuma.
 */
export function publicados(): Folheto[] {
  return colecao.folhetos.filter((f) => f.publicado !== false);
}

export function porId(id: string | undefined): Folheto | undefined {
  return id ? publicados().find((f) => f.id === id) : undefined;
}

/**
 * As condições ordinárias, que o folheto pede por `condicoes: true`.
 *
 * Escritas uma vez na raiz da coleção. São as mesmas em toda obra
 * indulgenciada, e o impresso as repete em cada folha porque papel não tem
 * como fazer diferente — aqui tem, e repeti-las faria corrigir uma vírgula
 * custar uma edição por folheto.
 */
export const condicoes = colecao.condicoes;
