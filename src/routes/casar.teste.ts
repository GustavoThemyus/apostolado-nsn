/**
 * Suíte do casamento de rotas. Roda junto com `npm test`.
 *
 * A regra que mais importa aqui é a última: segmento fixo tem de vencer
 * segmento curinga, senão /calendario/santos seria engolido por uma rota
 * que captura parâmetro na mesma posição.
 */

import { casar, resolver } from "./casar";

let passaram = 0;
const falhas: string[] = [];

const conferir = (rotulo: string, obtido: unknown, esperado: unknown) => {
  if (JSON.stringify(obtido) === JSON.stringify(esperado)) passaram += 1;
  else falhas.push(`${rotulo}: ${JSON.stringify(obtido)} != ${JSON.stringify(esperado)}`);
};

conferir("raiz", casar("/", "/"), {});
conferir("raiz sem barra", casar("/", ""), {});
conferir("literal casa", casar("/missa/guia", "/missa/guia"), {});
conferir("literal diferente", casar("/missa/guia", "/missa/partes"), null);
conferir("tamanhos diferentes", casar("/missa", "/missa/guia"), null);
conferir("parâmetro", casar("/postagens/:id", "/postagens/sao-jose"), { id: "sao-jose" });
conferir(
  "parâmetro com acento",
  casar("/postagens/:id", "/postagens/s%C3%A3o-jos%C3%A9"),
  { id: "são-josé" }
);
conferir("barra final ignorada", casar("/missa/guia", "/missa/guia/"), {});

const rotas = [{ padrao: "/calendario/:que" }, { padrao: "/calendario/santos" }];
conferir("fixo vence curinga", resolver(rotas, "/calendario/santos")?.rota.padrao, "/calendario/santos");
conferir("curinga pega o resto", resolver(rotas, "/calendario/brasil")?.rota.padrao, "/calendario/:que");
conferir("nada casa", resolver(rotas, "/outro"), null);

const total = passaram + falhas.length;
console.log(`\ncasamento de rotas: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
