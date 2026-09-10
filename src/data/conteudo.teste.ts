/**
 * Integridade dos documentos de conteúdo. Roda junto com `npm test`.
 *
 * Guarda três coisas que quebram calado: chamada de nota sem nota, link de
 * âncora sem destino e nota que se cita dentro de si mesma. As três nascem de
 * edição pelo painel, e a terceira já derrubou o navegador uma vez, por
 * recursão, antes desta suíte existir.
 */

import apostolado from "./apostolado.json";
import arquidiocese from "./calendario-arquidiocese.json";
import brasil from "./calendario-brasil.json";
import canonica from "./missa-canonica.json";
import dias from "./indulgencias-dias.json";
import enchiridion from "./indulgencias-enchiridion.json";
import guia from "./guia.json";
import indulgencias from "./indulgencias.json";
import missa from "./missa.json";
import ordens from "./indulgencias-ordens.json";
import partes from "./missa-partes.json";
import raccolta from "./indulgencias-raccolta.json";
import { ESTADO_DA_ROTA } from "../routes/rotas";
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
  if ("latim" in bloco) for (const filho of bloco.latim) saida.push(...textosDoBloco(filho));
  if ("portugues" in bloco) for (const filho of bloco.portugues) saida.push(...textosDoBloco(filho));
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

/*
 * Os dias de indulgência apontam para a concessão exata do Enchiridion, e é um
 * link que atravessa página: nada na tela avisa quando ele apodrece, porque o
 * navegador simplesmente não rola. Aqui ele é conferido contra as âncoras que
 * o Enchiridion de fato tem.
 */
{
  const ancoras = ancorasDe(ench.secoes);
  const registro = dias as unknown as {
    dias: { id: string; fonte?: string; obra: Bloco[] }[];
    semDiaFixo: { id: string; fonte?: string; obra: Bloco[] }[];
  };
  const todos = [...registro.dias, ...registro.semDiaFixo];

  const quebrados: string[] = [];
  for (const entrada of todos) {
    const textos = [entrada.fonte ?? "", ...entrada.obra.flatMap(textosDoBloco)];
    for (const m of textos.join("\n").matchAll(/\[elo:([^\]]+)\]/g)) {
      const destino = m[1];
      if (/^https?:/.test(destino)) continue;
      const [caminho, ancora] = destino.split("#");
      if (caminho === "/indulgencias/enchiridion" && ancora && !ancoras.has(ancora)) {
        quebrados.push(`${entrada.id} -> ${destino}`);
      }
    }
  }
  conferir("dias de indulgência: todo elo cai numa âncora do Enchiridion",
    quebrados.length === 0, quebrados.join(", "));

  const semId = todos.filter((e) => !e.id).length;
  conferir("dias de indulgência: toda entrada tem id", semId === 0);
  const repetidos = todos.map((e) => e.id).filter((id, i, t) => t.indexOf(id) !== i);
  conferir("dias de indulgência: ids sem repetição", repetidos.length === 0, repetidos.join(", "));
}

/*
 * A etiqueta "Em preparação" / "Rascunho" que o menu e os cartões mostram sai
 * de uma lista à mão em rotas.ts, porque a tabela de rotas não pode importar
 * os JSON sem trazer todos para o pacote inicial. Lista à mão apodrece: esta
 * já dizia "em preparação" de um documento de catorze seções publicadas.
 * Aqui ela é conferida contra o que cada página diz de si.
 */
{
  const paginas: [string, Conteudo][] = [
    ["/missa", missa as unknown as Conteudo],
    ["/missa/guia", guia as unknown as Conteudo],
    ["/missa/partes", partes as unknown as Conteudo],
    ["/missa/situacao-canonica", canonica as unknown as Conteudo],
    ["/calendario/brasil", brasil as unknown as Conteudo],
    ["/calendario/arquidiocese", arquidiocese as unknown as Conteudo],
    ["/indulgencias", indulgencias as unknown as Conteudo],
    ["/indulgencias/raccolta", raccolta as unknown as Conteudo],
    ["/indulgencias/enchiridion", enchiridion as unknown as Conteudo],
    ["/indulgencias/ordens", ordens as unknown as Conteudo],
    ["/apostolado", apostolado as unknown as Conteudo],
  ];

  const divergem: string[] = [];
  for (const [rota, doc] of paginas) {
    const esperado = doc.emPreparacao ? "preparacao" : doc.rascunho ? "rascunho" : undefined;
    const anunciado = ESTADO_DA_ROTA[rota];
    if (esperado !== anunciado) {
      divergem.push(`${rota}: a rota diz ${anunciado ?? "pronta"}, o JSON diz ${esperado ?? "pronta"}`);
    }
  }
  conferir("a etiqueta da rota bate com o que a página diz de si",
    divergem.length === 0, divergem.join(" | "));

  const semPagina = Object.keys(ESTADO_DA_ROTA).filter(
    (r) => !paginas.some(([p]) => p === r),
  );
  conferir("nenhuma rota marcada ficou de fora desta conferência",
    semPagina.length === 0, semPagina.join(", "));
}

const total = passaram + falhas.length;
console.log(`\nintegridade do conteúdo: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
