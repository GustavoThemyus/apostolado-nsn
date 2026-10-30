/**
 * Integridade dos documentos de conteúdo. Roda junto com `npm test`.
 *
 * Guarda três coisas que quebram calado: chamada de nota sem nota, link de
 * âncora sem destino e nota que se cita dentro de si mesma. As três nascem de
 * edição pelo painel, e a terceira já derrubou o navegador uma vez, por
 * recursão, antes desta suíte existir.
 */

import apostolado from "./apostolado.json";
import brasao from "./brasao.json";
import arquidiocese from "./calendario-arquidiocese.json";
import brasil from "./calendario-brasil.json";
import canonica from "./missa-canonica.json";
import dias from "./indulgencias-dias.json";
import arquidioceseIndulgencias from "./indulgencias-arquidiocese.json";
import calendarioDasIndulgencias from "./indulgencias-calendario.json";
import enchiridion from "./indulgencias-enchiridion.json";
import guia from "./guia.json";
import indulgencias from "./indulgencias.json";
import missa from "./missa.json";
import ordens from "./indulgencias-ordens.json";
import partes from "./missa-partes.json";
import raccolta from "./indulgencias-raccolta.json";
import { existsSync, readFileSync } from "node:fs";
import folhetos from "./folhetos.json";
import postagens from "./postagens.json";
import { casar } from "../routes/casar";
import { ESTADO_DA_ROTA, ROTAS } from "../routes/rotas";
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
      // o subtítulo abre a concessão; o parágrafo é o §1, 3.º dentro dela
      if ("ancora" in bloco && bloco.ancora) saida.add(bloco.ancora);
    }
  }
  return saida;
};

const CAMINHOS_DE_ROTA = new Set(ROTAS.map((r) => r.padrao));

/*
 * O destino de um elo pode cair num padrão com curinga.
 *
 * "/folhetos/cristo-rei" não está na lista de rotas — quem está é
 * "/folhetos/:id". Comparar só por igualdade reprovava todo link para um
 * folheto ou uma postagem, que são justamente os destinos que mais se
 * escrevem à mão. Aqui o caminho passa pelo mesmo `casar` do Roteador, e é a
 * conferência de id logo abaixo que diz se o folheto existe de fato.
 */
const ehRotaConhecida = (caminho: string): boolean =>
  CAMINHOS_DE_ROTA.has(caminho) || ROTAS.some((r) => casar(r.padrao, caminho) !== null);

/**
 * A estampa existe mesmo em /public?
 *
 * Caminho errado numa imagem não dá erro nenhum: o navegador mostra o alt
 * vazio e a folha fica sem a figura, que é a parte que o Perez mais quer ver
 * publicada. O nome leva a impressão do conteúdo, então um arquivo
 * regenerado troca de nome e deixa o JSON apontando para o antigo.
 *
 * Caminho relativo à raiz: a suíte é empacotada em CJS e rodada de lá pelo
 * `npm test`, onde `import.meta.url` não existe.
 */
const existeEmPublico = (caminho: string): boolean => existsSync(`public${caminho}`);

/**
 * As medidas reais de um WebP, lidas do cabeçalho.
 *
 * O folheto declara `largura` e `altura` ao lado de `imagem`, e é delas que o
 * navegador tira a proporção antes de a figura chegar. Declaradas erradas,
 * nada falha: a folha abre com um buraco de proporção errada e o texto salta
 * quando a imagem carrega. Como o nome do arquivo leva a impressão do
 * conteúdo, trocar a figura troca o nome — e é fácil copiar o caminho novo
 * esquecendo as duas linhas de baixo. Aqui as três são conferidas juntas.
 *
 * Só o VP8 com perdas, que é o que `ferramentas/folhetos/gerar.py` grava.
 * Outro formato devolve `null` e a conferência o deixa passar, em vez de
 * reprovar um arquivo que o teste é que não sabe ler.
 */
function medidasDoWebp(caminho: string): { largura: number; altura: number } | null {
  const dados = readFileSync(`public${caminho}`);
  if (dados.length < 30) return null;
  if (dados.toString("ascii", 0, 4) !== "RIFF") return null;
  if (dados.toString("ascii", 8, 12) !== "WEBP") return null;
  if (dados.toString("ascii", 12, 16) !== "VP8 ") return null;
  return {
    largura: dados.readUInt16LE(26) & 0x3fff,
    altura: dados.readUInt16LE(28) & 0x3fff,
  };
}

/**
 * Três destinos, e os três se quebram calados.
 *
 * Âncora desta página, caminho de outra página do site e endereço externo. O
 * caminho é conferido contra a tabela de rotas, e a âncora dele contra o
 * documento de destino quando temos como saber — hoje, o Enchiridion, que é
 * para onde o calendário arquidiocesano aponta as 33 concessões.
 */
function destinoExiste(destino: string, ancoras: Set<string>): boolean {
  if (/^(https?:|mailto:)/.test(destino)) return true;
  if (!destino.startsWith("/")) return ancoras.has(destino);

  const [caminho, ancora] = destino.split("#");
  if (!ehRotaConhecida(caminho)) return false;
  if (!ancora) return true;
  if (caminho === "/indulgencias/enchiridion") {
    return ancorasDe((enchiridion as unknown as Conteudo).secoes).has(ancora);
  }
  return true;
}

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
  const quebrados = [...new Set(destinos)].filter((d) => !destinoExiste(d, ancoras));
  conferir(`${nome}: todo elo tem destino`, quebrados.length === 0, quebrados.join(", "));

  const semConsulta = [...corpo.matchAll(/\[mapa:([^\]]*)\]/g)]
    .map((m) => m[1])
    .filter((c) => c.trim() === "");
  conferir(`${nome}: todo mapa tem o que procurar`, semConsulta.length === 0);

  const vazias = Object.entries(notas).filter(([, t]) => !t.trim()).map(([c]) => c);
  conferir(`${nome}: nenhuma nota vazia`, vazias.length === 0, vazias.join(", "));

  const repetidas = doc.secoes.map((s) => s.id).filter((id, i, todos) => todos.indexOf(id) !== i);
  conferir(`${nome}: ids de seção sem repetição`, repetidas.length === 0, repetidas.join(", "));
}

examinar("arquidiocese (indulgências)", arquidioceseIndulgencias);
examinar("calendário das indulgências", calendarioDasIndulgencias);
examinar("próprio do Brasil", brasil);
examinar("próprio arquidiocesano", arquidiocese);
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

  /*
   * As condições e as observações citam cânones por chamada de nota, e a
   * chamada sem nota vira um número solto grudado na frase — "oito dias
   * antes ou depois.1" — sem nada que o explique. São vinte e tantas
   * citações; conferi-las a olho é o que não se faz duas vezes.
   */
  const prefacio = dias as unknown as {
    condicoes: { blocos: Bloco[] };
    observacoes: { blocos: Bloco[] };
    notas: Record<string, string>;
  };
  const textoDoPrefacio = [
    ...prefacio.condicoes.blocos.flatMap(textosDoBloco),
    ...prefacio.observacoes.blocos.flatMap(textosDoBloco),
  ].join("\n");
  const orfas = [...textoDoPrefacio.matchAll(/\[nota\]([^[]*)\[\/nota\]/g)]
    .map((m) => m[1].trim())
    .filter((c) => !(c in prefacio.notas));
  conferir("dias de indulgência: toda citação das condições tem nota",
    orfas.length === 0, [...new Set(orfas)].join(", "));

  const naoCitadas = Object.keys(prefacio.notas)
    .filter((c) => !textoDoPrefacio.includes(`[nota]${c}[/nota]`));
  conferir("dias de indulgência: nenhuma nota sobra sem quem a chame",
    naoCitadas.length === 0, naoCitadas.join(", "));

  const semId = todos.filter((e) => !e.id).length;
  conferir("dias de indulgência: toda entrada tem id", semId === 0);
  const repetidos = todos.map((e) => e.id).filter((id, i, t) => t.indexOf(id) !== i);
  conferir("dias de indulgência: ids sem repetição", repetidos.length === 0, repetidos.join(", "));
}

/*
 * Os folhetos.
 *
 * O invariante que é só deles: no bloco bilíngue, as duas colunas casam faixa
 * a faixa pelo subgrid, e quem decide quantas faixas são é o lado mais
 * comprido. Um parágrafo a mais de um lado não quebra nada à vista — ele
 * desencontra a oração dali para baixo, e o leitor passa a rezar o latim de
 * uma estrofe ao lado da tradução de outra. Em 390px, onde as colunas vêm
 * empilhadas, nem isso aparece: o erro só se revela no computador.
 */
{
  const colecao = folhetos as unknown as {
    condicoes: { titulo: string; blocos: Bloco[] };
    folhetos: {
      id: string;
      titulo: string;
      imagem?: string;
      largura?: number;
      altura?: number;
      obra?: string;
      concessao?: string;
      arquivo?: string;
      blocos: Bloco[];
    }[];
  };

  const desencontrados: string[] = [];
  const conferirPares = (onde: string, blocos: Bloco[]) => {
    for (const bloco of blocos) {
      if (bloco.tipo === "bilingue") {
        if (bloco.latim.length !== bloco.portugues.length) {
          desencontrados.push(
            `${onde}: ${bloco.latim.length} de latim para ${bloco.portugues.length} de português`,
          );
        }
        conferirPares(onde, bloco.latim);
        conferirPares(onde, bloco.portugues);
      }
      if ("corpo" in bloco) conferirPares(onde, bloco.corpo);
    }
  };

  const quebrados: string[] = [];
  const semImagem: string[] = [];
  const medidasErradas: string[] = [];
  const arquivosTortos: string[] = [];
  for (const f of colecao.folhetos) {
    conferirPares(f.id, f.blocos);
    /*
     * O arquivo no Drive é endereço de fora, e tem de vir inteiro. Escrito
     * como caminho — "/folhetos/cristo-rei.pdf" — o navegador o lê como
     * página deste site, e o leitor que clicasse em "baixar" cairia num 404
     * em vez de no PDF.
     */
    if (f.arquivo && !/^https:\/\//.test(f.arquivo)) {
      arquivosTortos.push(`${f.id} -> ${f.arquivo}`);
    }
    /*
     * A obra e a concessão entram junto com os blocos.
     *
     * A concessão inteira virou elo para o ponto exato dentro do Enchiridion,
     * e é link que atravessa página: quando a âncora some, nada na tela
     * avisa, porque o navegador simplesmente não rola.
     */
    const corpo = [f.obra ?? "", f.concessao ?? "", ...f.blocos.flatMap(textosDoBloco)].join("\n");
    for (const m of corpo.matchAll(/\[elo:([^\]]+)\]/g)) {
      if (!destinoExiste(m[1], new Set())) quebrados.push(`${f.id} -> ${m[1]}`);
    }
    if (f.imagem && !existeEmPublico(f.imagem)) {
      semImagem.push(`${f.id} -> ${f.imagem}`);
    } else if (f.imagem) {
      const reais = medidasDoWebp(f.imagem);
      if (!f.largura || !f.altura) {
        medidasErradas.push(`${f.id}: estampa sem largura e altura`);
      } else if (reais && (reais.largura !== f.largura || reais.altura !== f.altura)) {
        medidasErradas.push(
          `${f.id}: diz ${f.largura}x${f.altura}, o arquivo tem ${reais.largura}x${reais.altura}`,
        );
      }
    }
  }

  const condicoes = colecao.condicoes.blocos.flatMap(textosDoBloco).join("\n");
  for (const m of condicoes.matchAll(/\[elo:([^\]]+)\]/g)) {
    if (!destinoExiste(m[1], new Set())) quebrados.push(`condições -> ${m[1]}`);
  }

  conferir("folhetos: a oração bilíngue casa faixa a faixa",
    desencontrados.length === 0, desencontrados.join("; "));
  conferir("folhetos: todo elo tem destino", quebrados.length === 0, quebrados.join(", "));
  conferir("folhetos: toda estampa existe em /public",
    semImagem.length === 0, semImagem.join(", "));
  conferir("folhetos: a estampa declara as medidas que o arquivo tem",
    medidasErradas.length === 0, medidasErradas.join("; "));
  conferir("folhetos: o arquivo do Drive é endereço inteiro",
    arquivosTortos.length === 0, arquivosTortos.join(", "));

  const ids = colecao.folhetos.map((f) => f.id);
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  conferir("folhetos: endereços sem repetição", repetidos.length === 0, repetidos.join(", "));
  conferir("folhetos: as condições ordinárias não estão vazias",
    colecao.condicoes.blocos.length > 0);
}

/*
 * As postagens.
 *
 * Mesmas três armadilhas dos folhetos, e por isso mesmas conferências: elo
 * que não leva a lugar nenhum, estampa que não existe, medida que não é a do
 * arquivo. A quarta é delas: a vida de santo cita encíclicas, e a chamada de
 * nota sem nota vira um número solto na frase, sem nada que o explique — o
 * leitor vê a afirmação e não vê a fonte, que é exatamente o contrário do
 * que a nota existe para fazer.
 */
{
  const colecao = postagens as unknown as {
    postagens: {
      id: string;
      titulo: string;
      imagem?: string;
      largura?: number;
      altura?: number;
      notas?: Record<string, string>;
      blocos: Bloco[];
    }[];
  };

  const quebrados: string[] = [];
  const semImagem: string[] = [];
  const medidasErradas: string[] = [];
  const semNota: string[] = [];

  for (const p of colecao.postagens) {
    const corpo = p.blocos.flatMap(textosDoBloco).join("\n");
    for (const m of corpo.matchAll(/\[elo:([^\]]+)\]/g)) {
      if (!destinoExiste(m[1], new Set())) quebrados.push(`${p.id} -> ${m[1]}`);
    }
    for (const m of corpo.matchAll(/\[botao:([^\]]+)\]/g)) {
      if (!destinoExiste(m[1], new Set())) quebrados.push(`${p.id} -> ${m[1]}`);
    }
    for (const m of corpo.matchAll(/\[nota\]([^[]*)\[\/nota\]/g)) {
      const chave = m[1].trim();
      if (!p.notas || !(chave in p.notas)) semNota.push(`${p.id} -> ${chave}`);
    }
    if (p.imagem && !existeEmPublico(p.imagem)) {
      semImagem.push(`${p.id} -> ${p.imagem}`);
    } else if (p.imagem) {
      const reais = medidasDoWebp(p.imagem);
      if (p.largura && p.altura && reais) {
        if (reais.largura !== p.largura || reais.altura !== p.altura) {
          medidasErradas.push(
            `${p.id}: diz ${p.largura}x${p.altura}, o arquivo tem ${reais.largura}x${reais.altura}`,
          );
        }
      }
    }
  }

  conferir("postagens: todo elo tem destino", quebrados.length === 0, quebrados.join(", "));
  conferir("postagens: toda chamada de nota tem nota", semNota.length === 0, semNota.join(", "));
  conferir("postagens: toda estampa existe em /public",
    semImagem.length === 0, semImagem.join(", "));
  conferir("postagens: a estampa declara as medidas que o arquivo tem",
    medidasErradas.length === 0, medidasErradas.join("; "));

  const ids = colecao.postagens.map((p) => p.id);
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  conferir("postagens: endereços sem repetição", repetidos.length === 0, repetidos.join(", "));
}

/*
 * O elo que aponta para um folheto ou uma postagem aponta para um id, e o id
 * não está na tabela de rotas: `/folhetos/:id` casa com qualquer coisa. Então
 * `/folhetos/credo` passa por rota boa e abre a página de "não encontrado".
 *
 * Isso importa agora porque o calendário das indulgências manda o leitor ao
 * folheto da oração — foi o que o Perez pediu: "basta clicar no texto
 * explicando qual obra precisa ser realizada que você será direcionado para
 * a transcrição da oração". Sete entradas do calendário fazem esse salto, e
 * nenhuma delas avisa quando ele cai no vazio.
 */
{
  const fol = folhetos as unknown as { folhetos: { id: string; publicado?: boolean }[] };
  const pos = postagens as unknown as { postagens: { id: string; publicado?: boolean }[] };
  const vivos = new Map<string, Set<string>>([
    ["/folhetos", new Set(fol.folhetos.filter((f) => f.publicado !== false).map((f) => f.id))],
    ["/postagens", new Set(pos.postagens.filter((p) => p.publicado !== false).map((p) => p.id))],
  ]);

  const dadosDosDias = dias as unknown as {
    dias: { id: string; fonte?: string; obra: Bloco[] }[];
    semDiaFixo: { id: string; fonte?: string; obra: Bloco[] }[];
  };

  const fontes: [string, string][] = [];
  const juntar = (onde: string, textos: string[]) =>
    fontes.push([onde, textos.join("\n")]);

  for (const [nome, bruto] of [
    ["arquidiocese (indulgências)", arquidioceseIndulgencias],
    ["calendário das indulgências", calendarioDasIndulgencias],
    ["próprio do Brasil", brasil],
    ["próprio arquidiocesano", arquidiocese],
    ["enchiridion", enchiridion],
    ["guia", guia],
    ["indulgências", indulgencias],
    ["missa", missa],
  ] as [string, unknown][]) {
    const doc = bruto as Conteudo;
    juntar(nome, [
      ...doc.secoes.flatMap((s) => s.blocos.flatMap(textosDoBloco)),
      ...Object.values(doc.notas ?? {}),
    ]);
  }
  for (const f of (folhetos as unknown as { folhetos: { id: string; blocos: Bloco[] }[] }).folhetos) {
    juntar(`folheto ${f.id}`, f.blocos.flatMap(textosDoBloco));
  }
  for (const p of (postagens as unknown as { postagens: { id: string; blocos: Bloco[] }[] }).postagens) {
    juntar(`postagem ${p.id}`, p.blocos.flatMap(textosDoBloco));
  }
  for (const e of [...dadosDosDias.dias, ...dadosDosDias.semDiaFixo]) {
    juntar(`indulgência ${e.id}`, [e.fonte ?? "", ...e.obra.flatMap(textosDoBloco)]);
  }

  const mortos: string[] = [];
  for (const [onde, corpo] of fontes) {
    for (const m of corpo.matchAll(/\[(?:elo|botao):(\/[^\]]+)\]/g)) {
      const [caminho] = m[1].split("#");
      const barra = caminho.lastIndexOf("/");
      const colecao = caminho.slice(0, barra);
      const id = caminho.slice(barra + 1);
      const existentes = vivos.get(colecao);
      if (existentes && !existentes.has(id)) mortos.push(`${onde} -> ${caminho}`);
    }
  }
  conferir("todo elo para folheto ou postagem aponta para um que existe",
    mortos.length === 0, mortos.join(", "));
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
    ["/indulgencias/arquidiocese", arquidioceseIndulgencias as unknown as Conteudo],
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

/*
 * A página do brasão. Não é um `Conteudo` de seções, e por isso tem conferência
 * própria: os quatro elementos, cada um com o seu texto, e os números sobre a
 * imagem na mesma ordem das caixas à direita. Essa ordem não é gosto: é ela
 * que impede as linhas de se cruzarem, porque cada linha sai do número e vai
 * para a caixa de mesma posição.
 */
{
  const partes = brasao.partes;
  const ids = partes.map((p) => p.id).join(",");
  conferir("o brasão tem os quatro elementos, na ordem",
    ids === "fundo,lirio,flecha,lema", ids);

  const semTexto = partes.filter(
    (p) => !p.rotulo.trim() || p.paragrafos.length === 0 || p.paragrafos.some((t) => !t.trim()));
  conferir("todo elemento tem nome e texto", semTexto.length === 0,
    semTexto.map((p) => p.id).join(", "));

  const fora = partes.filter((p) => !(p.x > 0 && p.x < 100 && p.y > 0 && p.y < 100));
  conferir("os números ficam dentro da imagem", fora.length === 0,
    fora.map((p) => p.id).join(", "));

  const foraDeOrdem = partes.filter((p, i) => i > 0 && p.y <= partes[i - 1].y);
  conferir("os números descem na ordem das caixas, e as linhas não se cruzam",
    foraDeOrdem.length === 0, foraDeOrdem.map((p) => p.id).join(", "));

  const textos = [brasao.abertura, brasao.fecho, ...partes.flatMap((p) => p.paragrafos)];
  const desbalanceados = textos.filter((t) =>
    (t.match(/\[lat\]/g) ?? []).length !== (t.match(/\[\/lat\]/g) ?? []).length);
  conferir("toda marcação de latim no brasão abre e fecha",
    desbalanceados.length === 0, desbalanceados.map((t) => t.slice(0, 40)).join(" | "));
}

const total = passaram + falhas.length;
console.log(`\nintegridade do conteúdo: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
