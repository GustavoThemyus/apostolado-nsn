import type { Forma } from "../data/registro";

/**
 * As formas que já têm editor próprio no painel.
 *
 * Fica à parte para o seletor poder desabilitar, com todas as letras, o que
 * ainda não dá para editar. O contrário — oferecer e quebrar ao abrir — faz
 * quem edita achar que estragou alguma coisa.
 *
 * Falta `diasDeIndulgencia`: cada dia tem uma regra de quando (fixa, presa a
 * uma festa, intervalo, móvel, mensal), e um editor que não entenda a
 * diferença entre data fixa e festa transferida estragaria o cânon 922 em
 * silêncio. Esse merece tela própria, e não um formulário genérico.
 */
export const TEM_EDITOR: ReadonlySet<Forma> = new Set<Forma>([
  "documento",
  "postagens",
  "inicio",
  "site",
]);
