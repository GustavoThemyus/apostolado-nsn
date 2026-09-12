import { ANOS, ARQUIVOS } from "../data/ordo/indice";
import { tempoDe } from "./tempo";
import type { Cor, Tempo } from "./tipos";

/**
 * O calendário anterior à reforma de 1955.
 *
 * Ao contrário do de 1962, este não é calculado: é o Ordo que a própria capela
 * publica, importado dia a dia por `ferramentas/ordo/importar.py`. A razão de
 * copiar em vez de deduzir é que o Ordo traz o que regra nenhuma devolveria —
 * o grau no vocabulário pré-55, a Missa, as comemorações, o Prefácio, as
 * rubricas do dia e o próprio da Arquidiocese da Paraíba.
 *
 * Por isso ele cobre os anos que a capela publicou, e só esses. Fora deles a
 * página diz que não há Ordo, em vez de inventar um.
 */
export interface DiaDoOrdo {
  data: Date;
  /** Calculado, não copiado: o cômputo do tempo é o mesmo nos dois usos. */
  tempo: Tempo;
  nome: string;
  cor: Cor;
  /** Grau nas palavras do Ordo: "Duples maior", "Oitava privilegiada de 2ª ordem". */
  grau: string;
  /** Só quando a cor não é uma palavra só: dois paramentos, ou o róseo. */
  cores?: string;
  guarda?: boolean;
  /** Missa, comemorações, Prefácio e rubricas, nas palavras do Ordo. */
  partes: string[];
}

export interface ArquivoDoOrdo {
  fonte: string;
  descricao: string;
  ano: number;
  dias: Record<string, Omit<DiaDoOrdo, "data" | "tempo">>;
}

/*
 * Um arquivo por ano, carregado sob demanda: são 27 KB comprimidos cada um, e
 * quem fica no calendário de 1962 — que é o padrão — não baixa nenhum. O
 * índice é gerado junto com os arquivos, e é o que permite saber quais anos
 * existem sem baixar nenhum deles.
 */
export const ANOS_COM_ORDO: number[] = [...ANOS].sort((a, b) => a - b);

export const temOrdo = (ano: number) => ANOS_COM_ORDO.includes(ano);

const carregados = new Map<number, ArquivoDoOrdo>();

export async function carregarOrdo(ano: number): Promise<ArquivoDoOrdo | null> {
  const emCache = carregados.get(ano);
  if (emCache) return emCache;
  const abrir = ARQUIVOS[ano];
  if (!abrir) return null;
  // o JSON chega com `cor: string`; a forma é garantida pelo importador e
  // conferida por ferramentas/ordo/conferir.py, que é onde isso se prova
  const modulo = (await abrir()) as unknown as { default: ArquivoDoOrdo };
  carregados.set(ano, modulo.default);
  return modulo.default;
}

const chave = (ano: number, mes: number, dia: number) =>
  `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

/** Os dias de um mês, já com o tempo litúrgico calculado. */
export function mesDoOrdo(arquivo: ArquivoDoOrdo, ano: number, mes: number): DiaDoOrdo[] {
  const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const dias: DiaDoOrdo[] = [];
  for (let d = 1; d <= ultimo; d++) {
    const registro = arquivo.dias[chave(ano, mes, d)];
    if (!registro) continue;
    const data = new Date(Date.UTC(ano, mes - 1, d));
    dias.push({ ...registro, data, tempo: tempoDe(data).tempo, partes: registro.partes ?? [] });
  }
  return dias;
}

/**
 * O que acontece na Missa do dia, segundo o Ordo.
 *
 * O irmão disto do lado de 1962 é `desenvolvimentoDe`, que *deduz* das
 * rubricas gerais. Aqui não se deduz nada: o Ordo já escreve a linha da Missa
 * — "Missa Ecce advenit; Glória; Credo; Prefácio da Epifania; Ite, Missa est"
 * — e o que se faz é separá-la em campos.
 *
 * A diferença não é de estilo. No Natalício de São João Batista o Ordo não
 * manda Credo, e a dedução de 1962 mandaria, porque ela olha a classe: o
 * Credo depende da categoria da festa, não do grau. Onde os dois discordam,
 * quem está certo é o Ordo.
 *
 * A convenção da linha é que ela enumera o que se diz. Por isso a ausência de
 * "Glória" ou de "Credo" é uma afirmação, e não uma omissão — e o redator
 * ainda escreve "sem Credo" onde quer deixar claro.
 */
export interface NaMissa {
  gloria: boolean;
  credo: boolean;
  /** O Ordo às vezes diz por quê: "por causa da Oitava", "por causa do Doutor". */
  gloriaPorque?: string;
  credoPorque?: string;
  prefacio?: string;
  /** O Ordo diz "Prefácio e Communicantes do Natal": o Communicantes é próprio. */
  communicantes?: boolean;
  fecho?: string;
  ultimoEvangelho?: string;
  /** Trato, Sequência, Aleluia: só quando o Ordo se dá ao trabalho de dizer. */
  entreAsLeituras: string[];
  comemoracoes: string[];
}

/**
 * Procura um item na linha da Missa.
 *
 * Item por item, e não segmento por segmento: o Ordo tanto escreve "Glória"
 * sozinho entre dois pontos e vírgulas quanto "Missa Quasi modo do domingo
 * precedente: Glória" tudo junto, e num dia faltou o ponto e vírgula antes do
 * Prefácio. Exigir segmento próprio perdia 18 Glórias e 25 Credos.
 *
 * A negação é sempre "sem": não há "omite-se o Credo" em lugar nenhum do ano.
 */
function achar(linha: string, termo: string): { tem: boolean; porque?: string } {
  const achado = new RegExp(`(sem\\s+)?${termo}(\\s*\\(([^)]*)\\))?`).exec(linha);
  if (!achado) return { tem: false };
  return { tem: !achado[1], porque: achado[3] };
}

const primeiro = (linha: string, padrao: RegExp) => linha.match(padrao)?.[0]?.trim();

export function naMissaDoOrdo(dia: DiaDoOrdo): NaMissa | null {
  const linha = dia.partes[0];
  // Sexta-feira Santa, Sábado Santo e a Vigília de Pentecostes não abrem com
  // "Missa": abrem com o rito do dia, que não cabe nesta tabela
  if (!linha?.startsWith("Missa")) return null;

  const gloria = achar(linha, "Glória");
  const credo = achar(linha, "Credo");
  const prefacio = primeiro(linha, /Prefácio[^;]*/);
  const evangelho = primeiro(linha, /Último Evangelho[^;]*/);
  const fecho = primeiro(linha, /(Ite, Missa est|Benedicamus Domino|Requiescant in pace)[^;]*/);

  const entreAsLeituras: string[] = [];
  const comemoracoes: string[] = [];
  for (const cru of linha.split(";")) {
    const p = cru.trim();
    if (/^(sem\s+)?Trato$/.test(p) || /^Sequência/.test(p) || /Aleluia/.test(p)) {
      entreAsLeituras.push(p);
    } else if (p.includes("comemoração")) comemoracoes.push(p);
  }

  /*
   * "Prefácio e Communicantes da Epifania" é uma frase só e quer dizer duas
   * coisas: o Prefácio daquela festa e o Communicantes próprio dela. Tirar só
   * a palavra "Prefácio" deixaria a linha lendo "Prefácio: e Communicantes da
   * Epifania", que parece erro de digitação.
   */
  const composto = prefacio?.startsWith("Prefácio e Communicantes");

  return {
    gloria: gloria.tem,
    gloriaPorque: gloria.porque,
    credo: credo.tem,
    credoPorque: credo.porque,
    prefacio: prefacio?.replace(/^Prefácio( e Communicantes)?\s*/, ""),
    communicantes: composto || undefined,
    fecho,
    ultimoEvangelho: evangelho?.replace(/^Último Evangelho\s*/, ""),
    entreAsLeituras,
    comemoracoes,
  };
}
