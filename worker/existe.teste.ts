/**
 * A regra do 404, conferida sem subir o Worker.
 *
 * Esta regra nasceu de um defeito e nunca teve teste: o único jeito de saber
 * se ela valia era pedir o endereço no site publicado. Com `existe` fora do
 * `index.ts`, ela se confere aqui — e o que o teste guarda não é o 404 do
 * endereço inventado, que é fácil, e sim o 200 que **não** pode acontecer no
 * caminho com parâmetro, que é o que se compartilha no WhatsApp.
 */

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

// os três caminhos com parâmetro, que casam com qualquer palavra
conferir("folheto publicado existe", existe(`/folhetos/${folhetos()[0].id}`), true);
conferir("folheto inventado não existe", existe("/folhetos/inventado"), false);
conferir("postagem publicada existe", existe(`/postagens/${postagens()[0].id}`), true);
conferir("postagem inventada não existe", existe("/postagens/inventada"), false);
conferir("documento do painel existe", existe(`/admin/${REGISTRO[0].id}`), true);
conferir("documento inventado não existe", existe("/admin/inventado"), false);

/*
 * Todo documento do registro tem de abrir no painel. O registro é a lista de
 * tudo o que se edita, e um id que não case com `/admin/:documento` deixaria
 * o painel dando 404 na própria página dele.
 */
{
  const mortos = REGISTRO.filter((d) => !existe(`/admin/${d.id}`)).map((d) => d.id);
  conferir("todo documento do registro abre no painel", mortos, []);
}

/*
 * E todo folheto publicado tem de ter endereço vivo: é esse link que vai no
 * rodapé do impresso, e impresso não se corrige depois de distribuído.
 */
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
