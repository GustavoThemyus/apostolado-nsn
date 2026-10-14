/**
 * Os caminhos que o site atende, e nada mais.
 *
 * Existe à parte de `rotas.ts` porque o **Worker** precisa desta lista para
 * saber o que é rota e o que é endereço inventado, e `rotas.ts` carrega os
 * componentes de cada página por import dinâmico: importá-lo no Worker
 * arrastaria o site inteiro para dentro dele.
 *
 * As duas listas não podem divergir, e não é a disciplina de quem edita que
 * garante isso: `Rota.padrao` é tipado como `Padrao`, então rota com caminho
 * que não esteja aqui não compila, e `casar.teste.ts` confere o contrário —
 * caminho aqui que não tenha rota.
 */
export const PADROES = [
  "/",
  "/missa",
  "/missa/guia",
  "/missa/partes",
  "/missa/situacao-canonica",
  "/calendario",
  "/calendario/santos",
  "/calendario/brasil",
  "/calendario/arquidiocese",
  "/indulgencias",
  "/indulgencias/calendario",
  "/indulgencias/arquidiocese",
  "/indulgencias/raccolta",
  "/indulgencias/enchiridion",
  "/indulgencias/ordens",
  "/apostolado",
  "/apostolado/brasao",
  "/postagens",
  "/postagens/:id",
  "/admin",
  "/admin/:documento",
] as const;

export type Padrao = (typeof PADROES)[number];
