/**
 * Suíte do casamento de rotas. Roda junto com `npm test`.
 *
 * A regra que mais importa aqui é a última: segmento fixo tem de vencer
 * segmento curinga, senão /calendario/santos seria engolido por uma rota
 * que captura parâmetro na mesma posição.
 */

import { casar, resolver } from "./casar";
import { PADROES } from "./padroes";
import { ROTAS } from "./rotas";

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

/*
 * As duas listas de caminhos têm de ser a mesma. `Rota.padrao` é tipado como
 * `Padrao`, o que já impede rota com caminho de fora; falta o contrário, que
 * o tipo não pega: caminho listado em `padroes.ts` sem rota nenhuma por trás.
 * Esse é o que machuca de verdade — o Worker trataria o endereço como válido
 * e devolveria 200 numa página que não existe.
 */
{
  const comRota = new Set(ROTAS.map((r) => r.padrao as string));
  const orfaos = PADROES.filter((p) => !comRota.has(p));
  conferir(`todo padrão tem rota${orfaos.length ? `: ${orfaos.join(", ")}` : ""}`, orfaos, []);
  conferir("nenhum padrão repetido", PADROES.length, new Set(PADROES).size);
}

const total = passaram + falhas.length;
console.log(`\ncasamento de rotas: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
