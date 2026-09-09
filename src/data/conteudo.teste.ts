/**
 * Integridade dos documentos de conteúdo. Roda junto com `npm test`.
 *
 * Guarda três coisas que quebram calado: chamada de nota sem nota, link de
 * âncora sem destino e nota que se cita dentro de si mesma. As três nascem de
 * edição pelo painel, e a terceira já derrubou o navegador uma vez, por
 * recursão, antes desta suíte existir.
 */

import enchiridion from "./indulgencias-enchiridion.json";
import guia from "./guia.json";
import indulgencias from "./indulgencias.json";
import missa from "./missa.json";
import type { Bloco, Conteudo, Secao } from "./tipos";

let passaram = 0;
const falhas: string[] = [];

const conferir = (rotulo: string, condicao: boolean, detalhe = "") => {
  if (condicao) passaram += 1;
  else falhas.push(`${rotulo}${detalhe ? `: ${detalhe}` : ""}`);
};

function textosDoBloco(bloco: Bloco): string[] {
  const saida: string[] = [];
  if ("texto" in bloco && bloco.texto) saida.push(bloco.texto);
  if ("titulo" in bloco && bloco.titulo) saida.push(bloco.titulo);
  if ("itens" in bloco)
    for (const item of bloco.itens) saida.push(typeof item === "string" ? item : item.texto);
  if ("paragrafos" in bloco) saida.push(...bloco.paragrafos);
  if ("linhas" in bloco) for (const linha of bloco.linhas) saida.push(...linha);
  if ("colunas" in bloco) saida.push(...bloco.colunas);
  if ("versos" in bloco)
    for (const v of bloco.versos) saida.push(v.latim ?? "", v.portugues ?? "");
  if ("corpo" in bloco) for (const filho of bloco.corpo) saida.push(...textosDoBloco(filho));
  return saida;
}

const ancorasDe = (secoes: Secao[]): Set<string> => {
  const saida = new Set<string>();
  for (const secao of secoes) {
    saida.add(secao.id);
    for (const bloco of secao.blocos) {
      if (bloco.tipo === "subtitulo" && bloco.ancora) saida.add(bloco.ancora);
    }
  }
  return saida;
};

function examinar(nome: string, bruto: unknown) {
  const doc = bruto as Conteudo;
  const notas = doc.notas ?? {};
  const ancoras = ancorasDe(doc.secoes);

  const textos: string[] = [];
  for (const secao of doc.secoes) {
    for (const bloco of secao.blocos) textos.push(...textosDoBloco(bloco));
  }
  const corpo = [...textos, ...Object.values(notas)].join("\n");

  const chamadas = [...corpo.matchAll(/\[nota\]([^[]*)\[\/nota\]/g)].map((m) => m[1].trim());
  const semNota = [...new Set(chamadas)].filter((c) => !(c in notas));
  conferir(`${nome}: toda chamada de nota tem nota`, semNota.length === 0, semNota.join(", "));

  const seCitam = Object.entries(notas)
    .filter(([chave, texto]) => texto.includes(`[nota]${chave}[/nota]`))
    .map(([chave]) => chave);
  conferir(`${nome}: nenhuma nota se cita a si mesma`, seCitam.length === 0, seCitam.join(", "));

  const destinos = [...corpo.matchAll(/\[elo:([^\]]+)\]/g)].map((m) => m[1]);
  const quebrados = [...new Set(destinos)].filter(
    (d) => !/^(https?:|mailto:)/.test(d) && !ancoras.has(d),
  );
  conferir(`${nome}: todo elo tem destino`, quebrados.length === 0, quebrados.join(", "));

  const vazias = Object.entries(notas).filter(([, t]) => !t.trim()).map(([c]) => c);
  conferir(`${nome}: nenhuma nota vazia`, vazias.length === 0, vazias.join(", "));

  const repetidas = doc.secoes.map((s) => s.id).filter((id, i, todos) => todos.indexOf(id) !== i);
  conferir(`${nome}: ids de seção sem repetição`, repetidas.length === 0, repetidas.join(", "));
}

examinar("enchiridion", enchiridion);
examinar("guia", guia);
examinar("indulgências", indulgencias);
examinar("missa", missa);

// o enchiridion é o caso extremo: vale afirmar o que ele tem de ter
const ench = enchiridion as unknown as Conteudo;
conferir("enchiridion: 123 notas mais o asterisco", Object.keys(ench.notas ?? {}).length === 124);
conferir("enchiridion: as 33 concessões têm âncora",
  [...Array(33)].every((_, i) => ancorasDe(ench.secoes).has(`concessao-${i + 1}`)));

const total = passaram + falhas.length;
console.log(`\nintegridade do conteúdo: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
