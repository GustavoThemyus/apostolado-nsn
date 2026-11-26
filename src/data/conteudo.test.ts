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
import { existsSync, readdirSync, readFileSync } from "node:fs";
import folhetos from "./folhetos.json";
import postagens from "./postagens.json";
import { casar } from "../routes/casar";
import {
  SECOES,
  aberturaDoEvangelho,
  comEvangelhoDoDia,
  pecasDoProprio,
  semAberturaDoEvangelho,
} from "./ordinario";
import { ESTADO_DA_ROTA, ROTAS } from "../routes/rotas";
import type { Bloco, Conteudo, Folheto, Secao } from "./tipos";

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
      if ("ancora" in bloco && bloco.ancora) saida.add(bloco.ancora);
    }
  }
  return saida;
};

const CAMINHOS_DE_ROTA = new Set(ROTAS.map((r) => r.padrao));

const ehRotaConhecida = (caminho: string): boolean =>
  CAMINHOS_DE_ROTA.has(caminho) || ROTAS.some((r) => casar(r.padrao, caminho) !== null);

const existeEmPublico = (caminho: string): boolean => existsSync(`public${caminho}`);

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

const ench = enchiridion as unknown as Conteudo;
conferir("enchiridion: 123 notas mais o asterisco", Object.keys(ench.notas ?? {}).length === 124);
conferir("enchiridion: as 33 concessões têm âncora",
  [...Array(33)].every((_, i) => ancorasDe(ench.secoes).has(`concessao-${i + 1}`)));

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

{
  const colecao = folhetos as unknown as {
    condicoes: { titulo: string; blocos: Bloco[] };
    folhetos: {
      id: string;
      titulo: string;
      categoria?: string;
      cabecalho?: { data?: string; nome: string; grau: string };
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
    if (f.arquivo && !/^https:\/\//.test(f.arquivo)) {
      arquivosTortos.push(`${f.id} -> ${f.arquivo}`);
    }
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

  const semCabecalho = colecao.folhetos
    .filter((f) => f.categoria === "proprio")
    .filter((f) => !f.cabecalho?.nome?.trim() || !f.cabecalho?.grau?.trim())
    .map((f) => f.id);
  conferir("folhetos: todo próprio traz nome e grau do impresso",
    semCabecalho.length === 0, semCabecalho.join(", "));

  const ids = colecao.folhetos.map((f) => f.id);
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  conferir("folhetos: endereços sem repetição", repetidos.length === 0, repetidos.join(", "));
  conferir("folhetos: as condições ordinárias não estão vazias",
    colecao.condicoes.blocos.length > 0);
}

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

{
  type SecaoCrua = { id: string; titulo: string; blocos: Bloco[] };
  const secoes: SecaoCrua[] = [];
  const faltando: string[] = [];
  for (const s of SECOES) {
    const caminho = `src/data/ordinario/${s.id}.json`;
    if (!existsSync(caminho)) {
      faltando.push(s.id);
      continue;
    }
    secoes.push(JSON.parse(readFileSync(caminho, "utf-8")) as SecaoCrua);
  }
  conferir("as treze seções do Ordinário estão gravadas",
    faltando.length === 0 && secoes.length === 13, faltando.join(", "));

  const vazias = secoes.filter((s) => s.blocos.length === 0);
  conferir("nenhuma seção do Ordinário saiu vazia", vazias.length === 0,
    vazias.map((s) => s.id).join(", "));

  const desencontrados: string[] = [];
  const casar_ = (id: string, blocos: Bloco[]) => {
    for (const b of blocos) {
      if (b.tipo !== "bilingue") continue;
      if (b.latim.length !== b.portugues.length) {
        desencontrados.push(`${id}: ${b.latim.length} latim, ${b.portugues.length} português`);
      }
      casar_(id, b.latim);
      casar_(id, b.portugues);
    }
  };
  for (const s of secoes) casar_(s.id, s.blocos);
  conferir("todo bilíngue do Ordinário tem os dois lados do mesmo tamanho",
    desencontrados.length === 0, desencontrados.join(" | "));

  const DA_MISSA = ["preparacao", "asperges", "pe-altar", "catecumenos", "ofertorio",
    "canon", "comunhao", "conclusao", "leoninas", "acao-de-gracas"];
  const POSTURAS = ["pe", "sentado", "joelhos"];
  const postura_ok = (p: unknown) =>
    typeof p === "string"
      ? POSTURAS.includes(p)
      : !!p && typeof p === "object"
        && POSTURAS.includes((p as { rezada: string }).rezada)
        && POSTURAS.includes((p as { cantada: string }).cantada);
  const QUANDO = ["asperges", "vidi-aquam", "salmo-42", "gloria", "credo", "incenso",
    "ite", "benedicamus", "requiescant"];
  const sem_voz: string[] = [];
  const postura_ruim: string[] = [];
  const quando_ruim: string[] = [];
  const sem_partida: string[] = [];
  for (const s of secoes.filter((x) => DA_MISSA.includes(x.id))) {
    s.blocos.forEach((b, i) => {
      if (b.voz !== "alta" && b.voz !== "baixa") sem_voz.push(`${s.id}[${i}]`);
      if (b.postura !== undefined && !postura_ok(b.postura)) postura_ruim.push(`${s.id}[${i}]`);
      if (b.quando !== undefined && !QUANDO.includes(b.quando)) quando_ruim.push(`${s.id}[${i}]`);
    });
    if (s.id !== "asperges" && !s.blocos.some((b) => b.postura !== undefined)) sem_partida.push(s.id);
  }
  conferir("todo bloco da Missa tem voz, alta ou baixa", sem_voz.length === 0, sem_voz.slice(0, 8).join(", "));
  conferir("toda postura é de pé, sentado, de joelhos ou o par rezada/cantada",
    postura_ruim.length === 0, postura_ruim.join(", "));
  conferir("toda condição do Ordinário é uma que o calendário sabe decidir",
    quando_ruim.length === 0, quando_ruim.join(", "));
  conferir("toda seção da Missa abre com uma postura", sem_partida.length === 0, sem_partida.join(", "));

  const rotulo_sobrando: string[] = [];
  const resposta_sem_negrito: string[] = [];
  for (const s of secoes) {
    for (const b of s.blocos) {
      if (b.tipo !== "bilingue") continue;
      for (const p of [...b.latim, ...b.portugues]) {
        if (p.tipo !== "paragrafo") continue;
        if (/^(℣|S\.|M\.)/.test(p.texto)) rotulo_sobrando.push(`${s.id}: ${p.texto.slice(0, 30)}`);
        if (p.texto.startsWith("℟")) resposta_sem_negrito.push(`${s.id}: ${p.texto.slice(0, 30)}`);
      }
    }
  }
  conferir("nenhum ℣, S. ou M. sobra no começo de parágrafo do Ordinário",
    rotulo_sobrando.length === 0, rotulo_sobrando.slice(0, 5).join(" | "));
  conferir("toda resposta ℟ do Ordinário vem em negrito",
    resposta_sem_negrito.length === 0, resposta_sem_negrito.slice(0, 5).join(" | "));

  {
    const advento = (folhetos as unknown as { folhetos: Folheto[] }).folhetos
      .find((f) => f.id === "proprio-advento-i")!;
    const abertura = aberturaDoEvangelho(advento);
    conferir("a fórmula do Evangelho do dia sai do próprio",
      /^Sequéntia sancti Evangélii sec[uú]ndum Lucam/.test(abertura?.latim ?? "")
        && abertura?.portugues.endsWith("Lucas.") === true,
      JSON.stringify(abertura));

    const catecumenos = secoes.find((s) => s.id === "catecumenos")!;
    const trocado = comEvangelhoDoDia(catecumenos.blocos, abertura!);
    const linha = trocado.blocos
      .flatMap((b) => (b.tipo === "bilingue" ? b.latim : []))
      .find((p) => p.tipo === "paragrafo" && /sec[uú]ndum Lucam/.test(p.texto));
    conferir("a fórmula do dia entra no lugar do N. no Ordinário",
      trocado.substituiu && linha !== undefined);

    const evangelho = pecasDoProprio(advento, ["Evangelho"])[0].blocos;
    const aberto = semAberturaDoEvangelho(evangelho).find((b) => b.tipo === "bilingue");
    const primeira = aberto && aberto.tipo === "bilingue" ? aberto.latim[0] : undefined;
    conferir("o Evangelho do próprio abre pelo In illo témpore",
      primeira?.tipo === "paragrafo" && primeira.texto.startsWith("In illo témpore"),
      primeira?.tipo === "paragrafo" ? primeira.texto.slice(0, 30) : "");

    const outra = comEvangelhoDoDia([{ tipo: "paragrafo", texto: "nada" }], abertura!);
    conferir("sem a linha do Ordinário, nada é trocado", !outra.substituiu);
  }

  const lugares: { nome: string; subtitulos: string[] }[] = [];
  const andar = (blocos: Bloco[]) => {
    for (const b of blocos) {
      if (b.tipo === "proprio") lugares.push({ nome: b.nome, subtitulos: b.subtitulos });
      else if (b.tipo === "bilingue") {
        andar(b.latim);
        andar(b.portugues);
      } else if (b.tipo === "passo") andar(b.corpo);
    }
  };
  for (const s of secoes) andar(s.blocos);

  const nomes = lugares.map((l) => l.nome).join(" / ");
  conferir("o Ordinário tem os dez lugares do próprio, na ordem do missal",
    nomes === "Intróito / Oração / Epístola / Gradual, Aleluia ou Tracto / "
      + "Evangelho / Ofertório / Secreta / Prefácio / Comunhão / Pós-comunhão",
    nomes);

  const advento = (folhetos as unknown as { folhetos: Folheto[] }).folhetos.find(
    (f) => f.id === "proprio-advento-i",
  );
  conferir("o folheto do I Domingo do Advento está publicado", advento !== undefined);

  if (advento) {
    const brancos = lugares.filter(
      (l) => pecasDoProprio(advento, l.subtitulos).length === 0,
    );
    conferir("no I Domingo do Advento, os dez lugares do próprio se enchem",
      brancos.length === 0, brancos.map((l) => l.nome).join(", "));
  }
}

{
  const latim: string[] = [];
  const andar = (o: unknown, dentro: boolean) => {
    if (typeof o === "string") {
      if (dentro) latim.push(o);
      else for (const m of o.matchAll(/\[lat\]([\s\S]*?)\[\/lat\]/g)) latim.push(m[1]);
    } else if (o && typeof o === "object") {
      for (const [chave, v] of Object.entries(o)) {
        if (chave !== "id") andar(v, dentro || (chave === "latim"));
      }
    }
  };
  for (const pasta of ["src/data", "src/data/ordinario"]) {
    for (const nome of readdirSync(pasta)) {
      if (nome.endsWith(".json")) andar(JSON.parse(readFileSync(`${pasta}/${nome}`, "utf-8")), false);
    }
  }
  const suspeitas = latim
    .flatMap((s) => s.replace(/\[[^\]]*\]/g, "").match(/\p{L}*\p{Ll}v(?![aeiouyáéíóúýǽæœ.])\p{L}*/gu) ?? []);
  conferir("nenhum latim com v no lugar de u",
    latim.length > 100 && suspeitas.length === 0,
    `${latim.length} trechos; ${suspeitas.slice(0, 8).join(", ")}`);

  const tema = readFileSync("src/styles/tema.css", "utf-8");
  const fontes = [...tema.matchAll(/url\("(\/fonts\/[^"]+)"\)/g)].map((m) => m[1]);
  conferir("a fonte sem a troca de u por v está no lugar",
    fontes.length === 2 && fontes.every((f) => existsSync(`public${f}`))
      && !readFileSync("index.html", "utf-8").includes("EB+Garamond"),
    fontes.join(", "));
}

const total = passaram + falhas.length;
console.log(`\nintegridade do conteúdo: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
