/**
 * A marcação mínima do conteúdo. Roda junto com `npm test`.
 *
 * O que se guarda aqui é o aninhamento de marcas iguais. A busca não-gulosa
 * parava no primeiro fecho, e a linha da concessão de São Pedro e São Paulo
 * — itálico por fora, com o nome da [i]Indulgentiarum Doctrina[/i] em
 * itálico por dentro — saía com "[/i]" escrito em letras na tela.
 */

import { interpretar } from "./TextoRico";
import type { ReactNode } from "react";

let passaram = 0;
const falhas: string[] = [];

const conferir = (rotulo: string, condicao: boolean, detalhe = "") => {
  if (condicao) passaram += 1;
  else falhas.push(`${rotulo}${detalhe ? `: ${detalhe}` : ""}`);
};

/** Só o texto que chega à tela: é nele que a marca crua apareceria. */
function plano(no: ReactNode): string {
  if (typeof no === "string") return no;
  if (typeof no === "number") return String(no);
  if (Array.isArray(no)) return no.map(plano).join("");
  if (no && typeof no === "object" && "props" in no) {
    return plano((no as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

const comoTexto = (cru: string) => plano(interpretar(cru));

conferir("marca dentro de outra igual fecha no de fora",
  comoTexto("[i]a [i]b[/i] c[/i]") === "a b c",
  comoTexto("[i]a [i]b[/i] c[/i]"));

conferir("a fonte do calendário não vaza colchete",
  !comoTexto(
    "[i]Concessão n.º 14, §1 do Enchiridion e [elo:/x]norma n.º 17 da [i]Indulgentiarum Doctrina[/i][/elo][/i]",
  ).includes("["));

conferir("três níveis da mesma marca",
  comoTexto("[b]a[b]b[b]c[/b]d[/b]e[/b]") === "abcde",
  comoTexto("[b]a[b]b[b]c[/b]d[/b]e[/b]"));

conferir("marcas diferentes continuam aninhando",
  comoTexto("[i]x [elo:/a]y[/elo] z[/i]") === "x y z");

conferir("irmãs seguidas não viram uma só",
  comoTexto("[i]a[/i] e [i]b[/i]") === "a e b");

conferir("abertura sem fecho fica como texto",
  comoTexto("[i]sem fecho") === "[i]sem fecho",
  comoTexto("[i]sem fecho"));

// o fecho sobrando é texto solto, e não motivo para engolir o resto da frase
conferir("fecho sem abertura não come o que vem depois",
  comoTexto("a[/i] e depois b") === "a[/i] e depois b",
  comoTexto("a[/i] e depois b"));

conferir("elo com parâmetro vazio não se perde",
  comoTexto("[elo:]nada[/elo]") === "nada");

conferir("a nota não interpreta o próprio corpo",
  comoTexto("antes[nota]7[/nota]depois").startsWith("antes"));

console.log(`\nmarcação do conteúdo: ${passaram}/${passaram + falhas.length}`);
if (falhas.length) {
  console.error(falhas.map((f) => `  ✗ ${f}`).join("\n"));
  process.exit(1);
}
