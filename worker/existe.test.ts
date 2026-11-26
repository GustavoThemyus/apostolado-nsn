import { existe } from "./existe";
import { publicados as folhetos } from "../src/data/folhetos";
import { publicadas as postagens } from "../src/data/postagens";
import { REGISTRO } from "../src/data/registro";

let passaram = 0;
const falhas: string[] = [];

const conferir = (rotulo: string, obtido: unknown, esperado: unknown) => {
  if (JSON.stringify(obtido) === JSON.stringify(esperado)) passaram += 1;
  else falhas.push(`${rotulo}: ${JSON.stringify(obtido)} != ${JSON.stringify(esperado)}`);
};

conferir("a raiz existe", existe("/"), true);
conferir("uma página fixa existe", existe("/indulgencias/enchiridion"), true);
conferir("endereço inventado não existe", existe("/nao-existe"), false);
conferir("subcaminho inventado não existe", existe("/missa/inventado"), false);
conferir("barra final não muda nada", existe("/folhetos/"), true);

conferir("folheto publicado existe", existe(`/folhetos/${folhetos()[0].id}`), true);
conferir("folheto inventado não existe", existe("/folhetos/inventado"), false);
conferir("postagem publicada existe", existe(`/postagens/${postagens()[0].id}`), true);
conferir("postagem inventada não existe", existe("/postagens/inventada"), false);
conferir("documento do painel existe", existe(`/admin/${REGISTRO[0].id}`), true);
conferir("documento inventado não existe", existe("/admin/inventado"), false);

{
  const mortos = REGISTRO.filter((d) => !existe(`/admin/${d.id}`)).map((d) => d.id);
  conferir("todo documento do registro abre no painel", mortos, []);
}

{
  const mortos = folhetos().filter((f) => !existe(`/folhetos/${f.id}`)).map((f) => f.id);
  conferir("todo folheto publicado tem endereço vivo", mortos, []);
}

const total = passaram + falhas.length;
console.log(`\n404 do Worker: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
